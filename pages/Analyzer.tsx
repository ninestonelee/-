import React, { useState, useEffect } from 'react';
import SearchForm from '../components/SearchForm';
import VideoList from '../components/VideoList';
import { SearchCriteria, DateOption, DurationOption, MinViewOption, VideoItem, SavedSearch } from '../types';
import { searchVideos } from '../services/youtubeService';
import { Save } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const DEFAULT_CRITERIA: SearchCriteria = {
  keyword: '',
  dateOption: DateOption.DAYS_7,
  durationOption: DurationOption.MEDIUM,
  minViews: MinViewOption.VIEW_10K,
  count: 10
};

const Analyzer: React.FC = () => {
  const [criteria, setCriteria] = useState<SearchCriteria>(DEFAULT_CRITERIA);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<VideoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have preloaded criteria from "Saved Searches" page
    const state = location.state as { preload?: SearchCriteria };
    if (state?.preload) {
      setCriteria(state.preload);
      // Optional: Auto run search? Let's just fill the form for safety/quota saving.
      // If auto-run is desired, we would call handleSearch here, but handleSearch depends on state.
    }
  }, [location.state]);

  const handleSearch = async () => {
    const apiKey = localStorage.getItem('youtube_api_key');
    if (!apiKey) {
      alert('API 키가 필요합니다. [API 키 설정] 메뉴에서 먼저 등록해주세요.');
      navigate('/settings');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await searchVideos(apiKey, criteria);
      setResults(data);
      setHasSearched(true);
      if (data.length === 0) {
        setError('조건에 맞는 영상이 없습니다. 기간을 늘리거나 최소 조회수를 낮춰보세요.');
      }
    } catch (err: any) {
      setError(`분석에 실패했습니다. API 키 또는 검색 조건을 확인해주세요. (${err.message})`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSearch = () => {
    if (!criteria.keyword) return;
    const name = prompt('이 검색 조건을 저장할 이름을 입력하세요:', `${criteria.keyword}_${criteria.dateOption}`);
    if (!name) return;

    const newSave: SavedSearch = {
      ...criteria,
      id: Date.now().toString(),
      name,
      savedAt: Date.now()
    };

    const existing = localStorage.getItem('saved_searches');
    const list = existing ? JSON.parse(existing) : [];
    list.push(newSave);
    localStorage.setItem('saved_searches', JSON.stringify(list));
    alert('검색 조건이 저장되었습니다. [저장한 검색] 메뉴에서 확인할 수 있습니다.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">유튜브 트렌드 분석기</h1>
        <p className="text-gray-500 mt-1">키워드와 조건을 입력해 잠재력 있는 영상을 찾아보세요.</p>
      </div>

      <SearchForm 
        criteria={criteria} 
        onChange={setCriteria} 
        onSubmit={handleSearch}
        isLoading={isLoading}
      />

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {hasSearched && results.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">분석 결과 ({results.length}건)</h2>
            <button 
              onClick={saveSearch}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Save size={16} /> 이 검색 저장
            </button>
          </div>
          <VideoList videos={results} />
        </div>
      )}
    </div>
  );
};

export default Analyzer;