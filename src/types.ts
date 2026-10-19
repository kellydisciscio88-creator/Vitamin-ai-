export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  notes?: string;
  isCrucial?: boolean;
  benefits?: string;
  pairings?: string;
  foodSources?: string;
}

export interface ScheduleBlock {
  id: string;
  title: string;
  iconName: string;
  timeOfDay: string;
  instructions?: string;
  mealSuggestion?: string;
  fastingNote?: string;
  mealTime?: string;
  prepTimeMinutes?: number;
  items: Supplement[];
}

export interface UserProfile {
  profileId: string;
  name: string;
  age?: number;
  gender?: string;
  weight?: string;
  height?: string;
  dietaryPreference?: string;
  healthGoals: string[];
  healthConditions: string[];
  wakeTime?: string;
  bedTime?: string;
  notes?: string;
  isCurrent?: boolean;
}

export type DailyRecord = Record<string, boolean>; // item ID -> true (if taken)
export type HistoryRecord = Record<string, DailyRecord>; // Date string (YYYY-MM-DD) -> DailyRecord

export interface SubjectiveLog {
  date: string;
  mood: number;
  energy: number;
  sleep: number;
}
export type SubjectiveHistory = Record<string, SubjectiveLog>;

export interface WeeklyReport {
  summary: string;
  highlights: string[];
  improvements: string[];
  actionableAdvice: string;
}

export interface Recommendation {
  action: string;
  supplement: string;
  reason: string;
}

export interface Biomarker {
  markerName: string;
  status: string;
  value: string;
}

export interface HealthInsight {
  id: string;
  date: string;
  fileName: string;
  summary: string;
  recommendations: Recommendation[];
  keyMarkers: Biomarker[];
  disclaimer: string;
}
