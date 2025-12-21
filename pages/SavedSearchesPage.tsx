import React, { useEffect, useState } from 'react';
import { SavedSearch, SearchCriteria } from '../types';
import { Trash2, Play, Calendar, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper to pass data back to Analyzer (simulated via localstorage or state management, here using simple navigation state not possible with HashRouter easily without context, so we will use localStorage to 'stage' a search or just manual query params? 
// Actually, simple solution: We can't easily pass props via Link in HashRouter without location state.
// We will store "active_search_preload" in localStorage briefly.)

const SavedSearchesPage: React.FC = () => {
  const [saves, setSaves] = useState<SavedSearch[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = () => {
    const raw = localStorage.getItem('saved_searches');
    if (raw) {
      setSaves(JSON.parse(raw).sort((a: SavedSearch, b: SavedSearch) => b.savedAt - a.savedAt));
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const newSaves = saves.filter(s => s.id !== id);
    localStorage.setItem('saved_searches', JSON.stringify(newSaves));
    setSaves(newSaves);
  };

  const handleRun = (item: SavedSearch) => {
    // To keep it simple without Context API complexity for this size:
    // We navigate to home, but Analyzer needs to know what to load.
    // Ideally Analyzer reads a 'draft' or we implement a Context.
    // For MVP, let's just copy to clipboard or simply imply functionality.
    // BETTER: Save to a temp key.
    
    // We will use a URL hash param logic or just Context? 
    // Let's use a specialized localStorage key that the Home page checks on mount.
    
    // Actually, let's just make the Analyzer accept props? No, routing.
    // Let's use 'preload_search' in localStorage.
    
    // Extract strictly SearchCriteria
    const criteria: SearchCriteria = {
      keyword: item.keyword,
      dateOption: item.dateOption,
      durationOption: item.durationOption,
      minViews: item.minViews,
      count: item.count
    };
    
    // Since we are inside the same app, let's pass state via route location if possible, 
    // but React Router's `state` prop is cleaner.
    // However, since the prompt forbids complex router setup beyond HashRouter, 
    // we'll pass it via the navigate state.
    
    navigate('/', { state: { preload: criteria } });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">저장한 검색</h1>
      
      {saves.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">저장된 검색 조건이 없습니다.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-red-600 font-bold hover:underline">
            분석하러 가기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {saves.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                <span className="text-xs text-gray-400">{new Date(item.savedAt).toLocaleDateString()}</span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-900">"{item.keyword}"</div>
                <div className="flex flex-wrap gap-2 mt-2">
                   <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 text-xs"><Calendar size={12}/> {item.dateOption}</span>
                   <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 text-xs"><Clock size={12}/> {item.durationOption}</span>
                   <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 text-xs"><Eye size={12}/> {item.minViews}+</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleRun(item)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Play size={16} /> 바로 분석
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="px-3 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearchesPage;