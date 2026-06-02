/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, History, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-surface-container border-t border-outline-variant/40 flex justify-around items-center h-24 pb-4">
      {/* Home (Início) */}
      <button 
        onClick={() => onChangeTab('inicio')}
        className={`flex flex-col items-center justify-center py-2 px-6 rounded-xl active:scale-95 duration-150 cursor-pointer ${
          activeTab === 'inicio' 
            ? 'text-secondary font-bold' 
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/30'
        }`}
      >
        <Home className="w-6 h-6 mb-1" strokeWidth={activeTab === 'inicio' ? 2.5 : 2} />
        <span className="font-mono text-xs uppercase tracking-wider">Início</span>
      </button>

      {/* Histórico */}
      <button 
        onClick={() => onChangeTab('historico')}
        className={`flex flex-col items-center justify-center py-2 px-6 rounded-xl active:scale-95 duration-150 cursor-pointer ${
          activeTab === 'historico' 
            ? 'text-secondary font-bold' 
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/30'
        }`}
      >
        <History className="w-6 h-6 mb-1" strokeWidth={activeTab === 'historico' ? 2.5 : 2} />
        <span className="font-mono text-xs uppercase tracking-wider">Histórico</span>
      </button>

      {/* Perfil */}
      <button 
        onClick={() => onChangeTab('perfil')}
        className={`flex flex-col items-center justify-center py-2 px-6 rounded-xl active:scale-95 duration-150 cursor-pointer ${
          activeTab === 'perfil' 
            ? 'text-secondary font-bold' 
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/30'
        }`}
      >
        <User className="w-6 h-6 mb-1" strokeWidth={activeTab === 'perfil' ? 2.5 : 2} />
        <span className="font-mono text-xs uppercase tracking-wider">Perfil</span>
      </button>
    </nav>
  );
}
