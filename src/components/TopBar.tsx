/**
 * Top Navigation Bar adhering to Universal Frontend Design Constitution Section 2 Contract:
 * Zone 1: Single text element wordmark
 * Zone 2: 4-6 clean text navigation links
 * Zone 3: 1-2 primary actions
 */
import React from 'react';
import { ShoppingBag, Volume2, VolumeX } from 'lucide-react';

interface Props {
  activePreset: string;
  onSelectPreset: (preset: 'overview' | 'good_taste' | 'fruits' | 'seafood' | 'scale') => void;
  basketCount: number;
  onOpenBasket: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFirstPerson: boolean;
  onToggleFirstPerson: () => void;
}

export const TopBar: React.FC<Props> = ({
  activePreset,
  onSelectPreset,
  basketCount,
  onOpenBasket,
  isMuted,
  onToggleMute,
  isFirstPerson,
  onToggleFirstPerson,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3.5 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 select-none">
      {/* Zone 1: Brand title wordmark (single text element) */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectPreset('overview');
        }}
        className="text-lg font-serif font-bold tracking-tight text-neutral-100 hover:text-amber-400 transition-colors whitespace-nowrap"
      >
        Kowloon Wet Market 3D
      </a>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-300">
        <button
          onClick={() => onSelectPreset('overview')}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            activePreset === 'overview' && !isFirstPerson
              ? 'text-amber-400 font-semibold underline underline-offset-4'
              : 'hover:text-white text-neutral-400'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => onSelectPreset('good_taste')}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            activePreset === 'good_taste' && !isFirstPerson
              ? 'text-amber-400 font-semibold underline underline-offset-4'
              : 'hover:text-white text-neutral-400'
          }`}
        >
          Good Taste Grocery
        </button>

        <button
          onClick={() => onSelectPreset('fruits')}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            activePreset === 'fruits' && !isFirstPerson
              ? 'text-amber-400 font-semibold underline underline-offset-4'
              : 'hover:text-white text-neutral-400'
          }`}
        >
          Fresh Fruit Stand
        </button>

        <button
          onClick={() => onSelectPreset('seafood')}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            activePreset === 'seafood' && !isFirstPerson
              ? 'text-amber-400 font-semibold underline underline-offset-4'
              : 'hover:text-white text-neutral-400'
          }`}
        >
          Live Seafood
        </button>

        <button
          onClick={onToggleFirstPerson}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            isFirstPerson
              ? 'text-amber-400 font-semibold underline underline-offset-4'
              : 'hover:text-white text-neutral-400'
          }`}
        >
          {isFirstPerson ? 'Exit Walk' : 'Street Walk'}
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMute}
          className="p-2 text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
          title={isMuted ? 'Turn Sound On' : 'Mute Market Ambiance'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          onClick={onOpenBasket}
          className="px-3.5 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Basket</span>
          <span className="font-mono font-bold ml-0.5 tabular-nums">({basketCount})</span>
        </button>
      </div>
    </header>
  );
};
