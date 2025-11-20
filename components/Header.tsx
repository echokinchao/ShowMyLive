import React from 'react';
import { Wand2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            StyleFusion AI
          </h1>
        </div>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noreferrer"
          className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block"
        >
          v1.0.0
        </a>
      </div>
    </header>
  );
};