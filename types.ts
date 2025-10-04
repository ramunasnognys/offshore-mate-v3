export type RotationPattern = string;

export interface ScheduleConfig {
  startDate: string; // ISO string format YYYY-MM-DD
  pattern: RotationPattern;
}

export interface Schedule extends ScheduleConfig {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO string
}

export interface RotationStatus {
  status: 'offshore' | 'onshore' | null;
  isFirstDay: boolean;
  isLastDay: boolean;
}

export type ViewMode = 'monthly' | 'yearly';