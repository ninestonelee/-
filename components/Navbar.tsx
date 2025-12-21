import React from 'react';
import { NavLink } from 'react-router-dom';
import { Flame, Search, Save, Settings, HelpCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors duration-200 ${
      isActive
        ? 'border-red-600 text-red-600 font-bold'
        : 'border-transparent text-gray-500 hover:text-gray-800'
    }`;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-red-600 text-white p-1 rounded">
                  <Flame size={20} />
                </span>
                <span>바이럴 탐지기</span>
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <NavLink to="/" className={getLinkClass} end>
                <Search size={18} />
                <span>트렌드 분석기</span>
              </NavLink>
              <NavLink to="/saved" className={getLinkClass}>
                <Save size={18} />
                <span>저장한 검색</span>
              </NavLink>
              <NavLink to="/settings" className={getLinkClass}>
                <Settings size={18} />
                <span>API 키 설정</span>
              </NavLink>
            </div>
          </div>
          <div className="flex items-center">
             <NavLink to="/help" className="text-gray-400 hover:text-gray-600 p-2">
                <HelpCircle size={20} />
             </NavLink>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      <div className="sm:hidden border-t border-gray-200 flex justify-around bg-gray-50">
        <NavLink to="/" className={({isActive}) => `flex-1 py-3 text-center text-sm ${isActive ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
          분석기
        </NavLink>
        <NavLink to="/saved" className={({isActive}) => `flex-1 py-3 text-center text-sm ${isActive ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
          저장함
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `flex-1 py-3 text-center text-sm ${isActive ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
          설정
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;