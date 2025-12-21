import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Analyzer from './pages/Analyzer';
import SavedSearchesPage from './pages/SavedSearchesPage';
import ApiKeySettings from './pages/ApiKeySettings';
import HelpPage from './pages/HelpPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Analyzer />} />
            <Route path="/saved" element={<SavedSearchesPage />} />
            <Route path="/settings" element={<ApiKeySettings />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;