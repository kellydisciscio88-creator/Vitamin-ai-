import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  profileId: text('profile_id').notNull(),
  name: text('name').notNull(),
  age: integer('age'),
  gender: text('gender'),
  weight: text('weight'),
  height: text('height'),
  dietaryPreference: text('dietary_preference'),
  healthGoals: text('health_goals'), // JSON array or comma separated
  healthConditions: text('health_conditions'), // Allergies, genetic mutations (e.g. MTHFR), sensitivities
  wakeTime: text('wake_time'),
  bedTime: text('bed_time'),
  notes: text('notes'),
  isCurrent: boolean('is_current').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userSchedules = pgTable('user_schedules', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  profileId: text('profile_id').notNull().default('default'),
  scheduleJson: text('schedule_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userLogs = pgTable('user_logs', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  profileId: text('profile_id').notNull().default('default'),
  date: text('date').notNull(),
  historyJson: text('history_json'),
  subjectiveJson: text('subjective_json'),
  hydration: integer('hydration').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});
