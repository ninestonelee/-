export enum DateOption {
  HOURS_24 = '24h',
  DAYS_3 = '3d',
  DAYS_7 = '7d',
  DAYS_10 = '10d',
  DAYS_30 = '30d'
}

export enum DurationOption {
  SHORTS = 'shorts', // < 60s
  SHORT_MEDIUM = '1-5m', // 1m - 5m
  MEDIUM = '5-20m', // 5m - 20m
  LONG = 'long' // > 20m
}

export enum MinViewOption {
  VIEW_1K = '1000',
  VIEW_5K = '5000',
  VIEW_10K = '10000',
  VIEW_50K = '50000',
  VIEW_100K = '100000'
}

export interface SearchCriteria {
  keyword: string;
  dateOption: DateOption;
  durationOption: DurationOption;
  minViews: MinViewOption;
  count: number;
}

export interface SavedSearch extends SearchCriteria {
  id: string;
  name: string;
  savedAt: number;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string; // ISO 8601
  durationSeconds: number;
  isShorts: boolean;
  score: number; // Calculated viral score
  url: string;
}

export interface ApiValidationResult {
  isValid: boolean;
  message: string;
}