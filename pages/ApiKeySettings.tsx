import React, { useState, useEffect } from 'react';
import { validateApiKey } from '../services/youtubeService';
import { Key, CheckCircle, AlertCircle, Save, Download, Trash } from 'lucide-react';

const ApiKeySettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Load implicitly on mount if exists
    const saved = localStorage.getItem('youtube_api_key');
    if (saved) {
      setApiKey(saved);
    }
  }, []);

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setStatus({ type: 'error', message: 'API 키를 입력해주세요.' });
      return;
    }
    
    setIsChecking(true);
    setStatus({ type: 'idle', message: '' });

    const result = await validateApiKey(apiKey);
    setIsChecking(false);

    setStatus({
      type: result.isValid ? 'success' : 'error',
      message: result.message
    });
  };

  const handleSave = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('youtube_api_key', apiKey);
    alert('브라우저에 안전하게(로컬) 저장되었습니다.');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('youtube_api_key');
    if (saved) {
      setApiKey(saved);
      setStatus({ type: 'success', message: '저장된 키를 불러왔습니다. 검증 버튼을 눌러 상태를 확인하세요.' });
    } else {
      alert('저장된 키가 없습니다.');
    }
  };

  const handleDelete = () => {
    if (confirm('저장된 API 키를 삭제하시겠습니까?')) {
      localStorage.removeItem('youtube_api_key');
      setApiKey('');
      setStatus({ type: 'idle', message: '' });
      alert('삭제되었습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">API 키 설정</h1>
      <p className="text-gray-500 mb-8">
        Google Cloud Platform에서 발급받은 YouTube Data API v3 키를 입력해주세요.
      </p>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Data API 키</label>
        <div className="relative">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono"
          />
          <div className="absolute right-2 top-2">
             {/* Optional eye icon to show key could go here */}
          </div>
        </div>

        {status.message && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <button
            onClick={handleValidate}
            disabled={isChecking}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {isChecking ? '확인 중...' : <><Key size={16} /> 키 검증</>}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50"
          >
            <Save size={16} /> 저장
          </button>
          <button
            onClick={handleLoad}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50"
          >
            <Download size={16} /> 불러오기
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">보안 및 주의사항</h3>
            {apiKey && (
              <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <Trash size={12} /> 저장된 키 삭제
              </button>
            )}
          </div>
          <ul className="mt-2 space-y-1 text-xs text-gray-500 list-disc list-inside">
            <li>API 키는 브라우저 로컬 저장소(localStorage)에 저장됩니다.</li>
            <li>공용 PC에서는 사용 후 반드시 삭제해주세요.</li>
            <li>일일 할당량(Quota) 초과 시 다음 날(태평양 표준시 기준) 초기화됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettings;