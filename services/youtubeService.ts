import { ApiValidationResult, SearchCriteria, VideoItem } from '../types';
import { getPublishedAfterDate, parseDuration, calculateScore, checkDurationMatch } from '../utils';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const validateApiKey = async (apiKey: string): Promise<ApiValidationResult> => {
  if (!apiKey) {
    return { isValid: false, message: 'API 키를 입력해주세요.' };
  }

  try {
    // Minimal call to check validity
    const response = await fetch(`${BASE_URL}/videos?part=id&chart=mostPopular&maxResults=1&key=${apiKey}`);
    
    if (response.ok) {
      return { isValid: true, message: '✅ API 키가 정상적으로 확인되었습니다.' };
    }

    const data = await response.json();
    const reason = data?.error?.errors?.[0]?.reason || '';

    if (response.status === 403) {
      if (reason === 'quotaExceeded') {
        return { isValid: false, message: '❌ API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' };
      }
      return { isValid: false, message: '❌ API 사용 설정이 꺼져있거나 권한이 없습니다. GCP 콘솔을 확인해주세요.' };
    }
    
    if (response.status === 400) {
      return { isValid: false, message: '❌ API 키가 올바르지 않습니다. 다시 확인해주세요.' };
    }

    return { isValid: false, message: `❌ 검증 실패: ${data?.error?.message || '알 수 없는 오류'}` };

  } catch (error) {
    return { isValid: false, message: '❌ 네트워크 오류가 발생했습니다.' };
  }
};

export const searchVideos = async (apiKey: string, criteria: SearchCriteria): Promise<VideoItem[]> => {
  if (!apiKey) throw new Error('API 키가 없습니다.');

  // 1. Search Query
  // Note: We use type=video and order=viewCount to get high performing videos first, 
  // then filter by date/duration strictly on client or via params where possible.
  
  const publishedAfter = getPublishedAfterDate(criteria.dateOption);
  
  // Mapping Duration Option to API parameter (approximate)
  let videoDurationParam = 'any';
  if (criteria.durationOption === 'shorts') videoDurationParam = 'short'; // < 4 mins
  else if (criteria.durationOption === '1-5m') videoDurationParam = 'short'; // < 4 mins (need manual filter)
  else if (criteria.durationOption === '5-20m') videoDurationParam = 'medium'; // 4-20 mins
  else if (criteria.durationOption === 'long') videoDurationParam = 'long'; // > 20 mins

  // We request more items than needed because we will filter them client-side
  const maxResults = Math.min(50, criteria.count * 3); 

  const searchUrl = `${BASE_URL}/search?part=id&q=${encodeURIComponent(criteria.keyword)}&type=video&publishedAfter=${publishedAfter}&videoDuration=${videoDurationParam}&order=viewCount&maxResults=${maxResults}&key=${apiKey}`;

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    const err = await searchRes.json();
    throw new Error(err.error?.message || '검색 요청 실패');
  }

  const searchData = await searchRes.json();
  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

  if (!videoIds) return [];

  // 2. Get Video Details (Stats & Duration)
  const statsUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
  const statsRes = await fetch(statsUrl);
  if (!statsRes.ok) {
    throw new Error('영상 정보 상세 요청 실패');
  }

  const statsData = await statsRes.json();

  // 3. Process & Filter
  const videos: VideoItem[] = statsData.items
    .map((item: any) => {
      const durationSeconds = parseDuration(item.contentDetails.duration);
      const viewCount = parseInt(item.statistics.viewCount || '0');
      const likeCount = parseInt(item.statistics.likeCount || '0');
      const commentCount = parseInt(item.statistics.commentCount || '0');
      const publishedAt = item.snippet.publishedAt;
      const isShorts = durationSeconds <= 60;

      return {
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt,
        viewCount,
        likeCount,
        commentCount,
        duration: item.contentDetails.duration,
        durationSeconds,
        isShorts,
        score: calculateScore(viewCount, likeCount, publishedAt, isShorts),
        url: `https://www.youtube.com/watch?v=${item.id}`
      };
    })
    .filter((video: VideoItem) => {
      // Client-side Strict Filtering
      
      // Min Views
      if (video.viewCount < parseInt(criteria.minViews)) return false;

      // Strict Duration Match
      if (!checkDurationMatch(video.durationSeconds, criteria.durationOption)) return false;

      return true;
    })
    // Sort by Score (Viral Potential)
    .sort((a: VideoItem, b: VideoItem) => b.score - a.score)
    // Limit to requested count
    .slice(0, criteria.count);

  return videos;
};