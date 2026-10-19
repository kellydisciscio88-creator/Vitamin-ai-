import fs from 'fs';
import path from 'path';
import { db } from './index.ts';
import { profiles, userSchedules, userLogs } from './schema.ts';
import { eq, and } from 'drizzle-orm';
import { UserProfile, ScheduleBlock } from '../types.ts';

// File-based fallback storage for environments without active Cloud SQL
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'vitality_store.json');

interface FileStore {
  profiles: Record<string, UserProfile[]>; // key: userUid
  schedules: Record<string, ScheduleBlock[]>; // key: `${userUid}__${profileId}`
  logs: Record<string, Array<{
    userUid: string;
    profileId: string;
    date: string;
    historyJson?: string;
    subjectiveJson?: string;
    hydration?: number;
    updatedAt?: string;
  }>>; // key: `${userUid}__${profileId}`
}

function getFileStore(): FileStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Could not read local store, initializing empty store:', err);
  }
  return { profiles: {}, schedules: {}, logs: {} };
}

function saveFileStore(store: FileStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save to local store file:', err);
  }
}

const isSqlConfigured = () => Boolean(process.env.SQL_HOST);

export async function getUserProfiles(userUid: string): Promise<UserProfile[]> {
  if (isSqlConfigured()) {
    try {
      const rows = await db.select().from(profiles).where(eq(profiles.userUid, userUid));
      return rows.map(r => ({
        profileId: r.profileId,
        name: r.name,
        age: r.age ?? undefined,
        gender: r.gender ?? undefined,
        weight: r.weight ?? undefined,
        height: r.height ?? undefined,
        dietaryPreference: r.dietaryPreference ?? undefined,
        healthGoals: r.healthGoals ? JSON.parse(r.healthGoals) : [],
        healthConditions: r.healthConditions ? JSON.parse(r.healthConditions) : [],
        wakeTime: r.wakeTime ?? undefined,
        bedTime: r.bedTime ?? undefined,
        notes: r.notes ?? undefined,
        isCurrent: r.isCurrent ?? false,
      }));
    } catch (err) {
      console.warn('Cloud SQL query failed, falling back to local storage:', err);
    }
  }

  const store = getFileStore();
  return store.profiles[userUid] || [];
}

export async function upsertUserProfile(userUid: string, profile: UserProfile): Promise<void> {
  const store = getFileStore();
  if (!store.profiles[userUid]) {
    store.profiles[userUid] = [];
  }
  const idx = store.profiles[userUid].findIndex(p => p.profileId === profile.profileId);
  if (idx >= 0) {
    store.profiles[userUid][idx] = profile;
  } else {
    store.profiles[userUid].push(profile);
  }
  saveFileStore(store);

  if (isSqlConfigured()) {
    try {
      const existing = await db.select().from(profiles).where(
        and(eq(profiles.userUid, userUid), eq(profiles.profileId, profile.profileId))
      );

      const dataToSave = {
        userUid,
        profileId: profile.profileId,
        name: profile.name,
        age: profile.age ?? null,
        gender: profile.gender ?? null,
        weight: profile.weight ?? null,
        height: profile.height ?? null,
        dietaryPreference: profile.dietaryPreference ?? null,
        healthGoals: JSON.stringify(profile.healthGoals || []),
        healthConditions: JSON.stringify(profile.healthConditions || []),
        wakeTime: profile.wakeTime ?? null,
        bedTime: profile.bedTime ?? null,
        notes: profile.notes ?? null,
        isCurrent: profile.isCurrent ?? false,
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(profiles)
          .set(dataToSave)
          .where(and(eq(profiles.userUid, userUid), eq(profiles.profileId, profile.profileId)));
      } else {
        await db.insert(profiles).values(dataToSave);
      }
    } catch (err) {
      console.warn('Cloud SQL upsert profile failed, saved locally:', err);
    }
  }
}

export async function deleteUserProfile(userUid: string, profileId: string): Promise<void> {
  const store = getFileStore();
  if (store.profiles[userUid]) {
    store.profiles[userUid] = store.profiles[userUid].filter(p => p.profileId !== profileId);
  }
  const key = `${userUid}__${profileId}`;
  delete store.schedules[key];
  delete store.logs[key];
  saveFileStore(store);

  if (isSqlConfigured()) {
    try {
      await db.delete(profiles).where(
        and(eq(profiles.userUid, userUid), eq(profiles.profileId, profileId))
      );
      await db.delete(userSchedules).where(
        and(eq(userSchedules.userUid, userUid), eq(userSchedules.profileId, profileId))
      );
      await db.delete(userLogs).where(
        and(eq(userLogs.userUid, userUid), eq(userLogs.profileId, profileId))
      );
    } catch (err) {
      console.warn('Cloud SQL delete profile failed:', err);
    }
  }
}

export async function getUserSchedule(userUid: string, profileId: string): Promise<ScheduleBlock[] | null> {
  if (isSqlConfigured()) {
    try {
      const rows = await db.select().from(userSchedules).where(
        and(eq(userSchedules.userUid, userUid), eq(userSchedules.profileId, profileId))
      );
      if (rows.length > 0) {
        return JSON.parse(rows[0].scheduleJson) as ScheduleBlock[];
      }
    } catch (err) {
      console.warn('Cloud SQL getUserSchedule failed, using local storage:', err);
    }
  }

  const store = getFileStore();
  const key = `${userUid}__${profileId}`;
  return store.schedules[key] || null;
}

export async function upsertUserSchedule(userUid: string, profileId: string, schedule: ScheduleBlock[]): Promise<void> {
  const store = getFileStore();
  const key = `${userUid}__${profileId}`;
  store.schedules[key] = schedule;
  saveFileStore(store);

  if (isSqlConfigured()) {
    try {
      const existing = await db.select().from(userSchedules).where(
        and(eq(userSchedules.userUid, userUid), eq(userSchedules.profileId, profileId))
      );

      const scheduleJson = JSON.stringify(schedule);
      const updatedAt = new Date();

      if (existing.length > 0) {
        await db.update(userSchedules)
          .set({ scheduleJson, updatedAt })
          .where(and(eq(userSchedules.userUid, userUid), eq(userSchedules.profileId, profileId)));
      } else {
        await db.insert(userSchedules).values({
          userUid,
          profileId,
          scheduleJson,
          updatedAt,
        });
      }
    } catch (err) {
      console.warn('Cloud SQL upsertUserSchedule failed, saved locally:', err);
    }
  }
}

export async function getUserLogs(userUid: string, profileId: string) {
  if (isSqlConfigured()) {
    try {
      const rows = await db.select().from(userLogs).where(
        and(eq(userLogs.userUid, userUid), eq(userLogs.profileId, profileId))
      );
      return rows;
    } catch (err) {
      console.warn('Cloud SQL getUserLogs failed, using local storage:', err);
    }
  }

  const store = getFileStore();
  const key = `${userUid}__${profileId}`;
  return store.logs[key] || [];
}

export async function upsertUserLog(
  userUid: string,
  profileId: string,
  date: string,
  historyJson?: string,
  subjectiveJson?: string,
  hydration?: number
) {
  const store = getFileStore();
  const key = `${userUid}__${profileId}`;
  if (!store.logs[key]) {
    store.logs[key] = [];
  }
  const existingIndex = store.logs[key].findIndex(l => l.date === date);
  const logEntry = {
    userUid,
    profileId,
    date,
    historyJson: historyJson || '{}',
    subjectiveJson: subjectiveJson || '{}',
    hydration: hydration || 0,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    store.logs[key][existingIndex] = {
      ...store.logs[key][existingIndex],
      ...logEntry,
    };
  } else {
    store.logs[key].push(logEntry);
  }
  saveFileStore(store);

  if (isSqlConfigured()) {
    try {
      const existing = await db.select().from(userLogs).where(
        and(eq(userLogs.userUid, userUid), eq(userLogs.profileId, profileId), eq(userLogs.date, date))
      );

      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (historyJson !== undefined) updateData.historyJson = historyJson;
      if (subjectiveJson !== undefined) updateData.subjectiveJson = subjectiveJson;
      if (hydration !== undefined) updateData.hydration = hydration;

      if (existing.length > 0) {
        await db.update(userLogs)
          .set(updateData)
          .where(and(eq(userLogs.userUid, userUid), eq(userLogs.profileId, profileId), eq(userLogs.date, date)));
      } else {
        await db.insert(userLogs).values({
          userUid,
          profileId,
          date,
          historyJson: historyJson || '{}',
          subjectiveJson: subjectiveJson || '{}',
          hydration: hydration || 0,
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.warn('Cloud SQL upsertUserLog failed, saved locally:', err);
    }
  }
}
