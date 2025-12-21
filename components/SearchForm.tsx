import React from 'react';
import { DateOption, DurationOption, MinViewOption, SearchCriteria } from '../types';
import { Search } from 'lucide-react';

interface Props {
  criteria: SearchCriteria;
  onChange: (c: SearchCriteria) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const SearchForm: React.FC<Props> = ({ criteria, onChange, onSubmit, isLoading }) => {
  const handleChange = (field: keyof SearchCriteria, value: any) => {
    onChange({ ...criteria, [field]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Search className="text-red-600" size={20} />
        검색 조건 설정
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Keyword */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">분석할 키워드</label>
          <input
            type="text"
            value={criteria.keyword}
            onChange={(e) => handleChange('keyword', e.target.value)}
            placeholder="예) 해외감동사연, 동물구조, 은퇴후부업"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
        </div>

        {/* 2. Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">업로드 날짜</label>
          <select
            value={criteria.dateOption}
            onChange={(e) => handleChange('dateOption', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 outline-none bg-white"
          >
            <option value={DateOption.HOURS_24}>24시간 이내</option>
            <option value={DateOption.DAYS_3}>3일 이내</option>
            <option value={DateOption.DAYS_7}>7일 이내</option>
            <option value={DateOption.DAYS_10}>10일 이내</option>
            <option value={DateOption.DAYS_30}>30일 이내</option>
          </select>
        </div>

        {/* 3. Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">영상 길이</label>
          <select
            value={criteria.durationOption}
            onChange={(e) => handleChange('durationOption', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 outline-none bg-white"
          >
            <option value={DurationOption.SHORTS}>쇼츠 (1분 이하)</option>
            <option value={DurationOption.SHORT_MEDIUM}>1분 ~ 5분</option>
            <option value={DurationOption.MEDIUM}>5분 ~ 20분</option>
            <option value={DurationOption.LONG}>20분 초과</option>
          </select>
        </div>

        {/* 4. Min Views */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">최소 조회수</label>
          <select
            value={criteria.minViews}
            onChange={(e) => handleChange('minViews', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 outline-none bg-white"
          >
            <option value={MinViewOption.VIEW_1K}>1천 회 이상</option>
            <option value={MinViewOption.VIEW_5K}>5천 회 이상</option>
            <option value={MinViewOption.VIEW_10K}>1만 회 이상</option>
            <option value={MinViewOption.VIEW_50K}>5만 회 이상</option>
            <option value={MinViewOption.VIEW_100K}>10만 회 이상</option>
          </select>
        </div>

        {/* 5. Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">가져올 영상 개수 (1~50)</label>
          <input
            type="number"
            min={1}
            max={50}
            value={criteria.count}
            onChange={(e) => handleChange('count', Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-end md:col-span-2 lg:col-span-2">
          <button
            onClick={onSubmit}
            disabled={isLoading || !criteria.keyword.trim()}
            className={`w-full py-2 px-6 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              isLoading || !criteria.keyword.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                분석 중입니다... 잠시만요
              </>
            ) : (
              <>
                <Search size={20} />
                분석 시작
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;