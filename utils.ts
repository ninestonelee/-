import { DateOption, DurationOption } from './types';

// Helper to parse ISO 8601 duration (e.g., PT1M30S) to seconds
export const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = (parseInt(match[1] || '0') || 0);
  const minutes = (parseInt(match[2] || '0') || 0);
  const seconds = (parseInt(match[3] || '0') || 0);

  return hours * 3600 + minutes * 60 + seconds;
};

export const getPublishedAfterDate = (option: DateOption): string => {
  const now = new Date();
  switch (option) {
    case DateOption.HOURS_24:
      now.setHours(now.getHours() - 24);
      break;
    case DateOption.DAYS_3:
      now.setDate(now.getDate() - 3);
      break;
    case DateOption.DAYS_7:
      now.setDate(now.getDate() - 7);
      break;
    case DateOption.DAYS_10:
      now.setDate(now.getDate() - 10);
      break;
    case DateOption.DAYS_30:
      now.setDate(now.getDate() - 30);
      break;
  }
  return now.toISOString();
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}초 전`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  return `${Math.floor(diffInSeconds / 86400)}일 전`;
};

// Calculate "Viral Score"
export const calculateScore = (
  viewCount: number,
  likeCount: number,
  publishedAt: string,
  isShorts: boolean
): number => {
  const now = new Date();
  const uploaded = new Date(publishedAt);
  const hoursSinceUpload = Math.max(1, (now.getTime() - uploaded.getTime()) / (1000 * 60 * 60));

  // Base: Views per hour
  let velocity = viewCount / hoursSinceUpload;

  // Multiplier: Engagement (Likes per view)
  // Prevent division by zero
  const safeViews = Math.max(viewCount, 1);
  const likeRatio = likeCount / safeViews;

  // Shorts tend to have higher views but lower relative engagement compared to deep long-form
  // We boost score if engagement is high.
  let score = velocity * (1 + likeRatio * 20);

  if (isShorts) {
      // Shorts decay faster, prioritize recent velocity
      score = score * 1.2;
  } else {
      // Long form prioritizes engagement retention proxy (likes)
      score = score * (1 + likeRatio * 10);
  }

  return Math.round(score);
};

export const checkDurationMatch = (seconds: number, option: DurationOption): boolean => {
  switch (option) {
    case DurationOption.SHORTS: return seconds <= 60;
    case DurationOption.SHORT_MEDIUM: return seconds > 60 && seconds <= 300;
    case DurationOption.MEDIUM: return seconds > 300 && seconds <= 1200;
    case DurationOption.LONG: return seconds > 1200;
    default: return true;
  }
};