/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DriverProfile } from '../types';

interface HeaderProps {
  profile: DriverProfile;
  onToggleOnline?: () => void;
}

export default function Header({ profile, onToggleOnline }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center h-20 px-5 md:px-16 bg-surface border-b border-outline-variant/40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleOnline}
          className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container relative group hover:scale-105 active:scale-95 duration-150"
          title="Clique para alternar estado Online/Offline"
        >
          <img 
            className="w-full h-full object-cover" 
            src={profile.avatarUrl} 
            alt={profile.fullName}
            referrerPolicy="no-referrer"
          />
        </button>
        <div>
          <h1 className="font-sans font-extrabold uppercase tracking-widest text-[16px] md:text-xl text-on-surface">
            {profile.name}
          </h1>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider block md:hidden">
            MOTORISTA PROFISSIONAL
          </p>
        </div>
      </div>
      
      <button 
        onClick={onToggleOnline}
        className="flex items-center gap-2 px-3 py-1 bg-surface-container-high/60 rounded-full border border-outline-variant/40 hover:bg-surface-container-highest transition-colors active:scale-95"
      >
        {profile.isOnline ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-status-success shadow-[0_0_8px_rgba(0,200,83,0.8)] animate-pulse"></span>
            <span className="font-mono text-xs text-status-success font-bold tracking-wider">ONLINE</span>
          </>
        ) : (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-500 shadow-[0_0_8px_rgba(100,100,100,0.8)]"></span>
            <span className="font-mono text-xs text-neutral-400 font-bold tracking-wider">OFFLINE</span>
          </>
        )}
      </button>
    </header>
  );
}
