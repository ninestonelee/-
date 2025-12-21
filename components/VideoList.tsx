import React from 'react';
import { VideoItem } from '../types';
import { formatNumber, formatRelativeTime } from '../utils';
import { ExternalLink, Copy, ThumbsUp, MessageCircle, Eye, Zap } from 'lucide-react';

interface Props {
  videos: VideoItem[];
}

const VideoList: React.FC<Props> = ({ videos }) => {
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('영상 주소가 복사되었습니다!');
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-100 mt-6">
        <p className="text-gray-500">결과가 여기에 표시됩니다. 검색 조건을 입력하고 분석을 시작하세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      {videos.map((video, index) => (
        <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
          {/* Rank Badge */}
          <div className="absolute bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-lg -mt-4 -ml-4 z-10">
            #{index + 1}
          </div>

          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-full md:w-64 h-48 md:h-36 bg-gray-200 rounded-lg overflow-hidden group">
             <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
             <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
               {video.duration.replace('PT','').replace('H',':').replace('M',':').replace('S','')}
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight mb-1">
                  {video.title}
                </h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ml-2 whitespace-nowrap ${video.isShorts ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {video.isShorts ? '쇼츠' : '롱폼'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{video.channelTitle} • {formatRelativeTime(video.publishedAt)}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-center">
                <div className="text-gray-500 text-xs flex items-center justify-center gap-1"><Eye size={12}/> 조회수</div>
                <div className="font-bold">{formatNumber(video.viewCount)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs flex items-center justify-center gap-1"><ThumbsUp size={12}/> 좋아요</div>
                <div className="font-bold">{formatNumber(video.likeCount)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs flex items-center justify-center gap-1"><MessageCircle size={12}/> 댓글</div>
                <div className="font-bold">{formatNumber(video.commentCount)}</div>
              </div>
              <div className="text-center border-l border-gray-200">
                <div className="text-red-500 text-xs flex items-center justify-center gap-1"><Zap size={12}/> 극초기 점수</div>
                <div className="font-bold text-red-600">{formatNumber(video.score)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-3">
              <a 
                href={video.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <ExternalLink size={16} /> 영상 열기
              </a>
              <button 
                onClick={() => handleCopyUrl(video.url)}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Copy size={16} /> 주소 복사
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList;