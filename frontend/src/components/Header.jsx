import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <div className="flex items-center">
        <span
          className="text-2xl font-medium tracking-tight cursor-pointer"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          onClick={() => navigate('/')}
        >
          maligeeAi
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-300 bg-orange-50 text-sm font-medium">
          <span className="w-5 h-5 rounded-sm bg-orange-500 text-white flex items-center justify-center text-xs font-bold">Y</span>
          <span className="text-gray-800">Combinator S24</span>
        </div>
        {user ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
