/**
 * 3D Hover Tooltip for Kowloon Wet Market interactive items.
 */
import React from 'react';
import { InteractiveObjectInfo } from '../three/MarketScene';
import { Sparkles, Eye } from 'lucide-react';

interface Props {
  info: InteractiveObjectInfo | null;
}

export const ObjectTooltip: React.FC<Props> = ({ info }) => {
  if (!info) return null;

  return (
    <div
      className="fixed z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
      style={{
        left: `${Math.max(120, Math.min(window.innerWidth - 120, info.screenPos.x))}px`,
        top: `${Math.max(80, Math.min(window.innerHeight - 100, info.screenPos.y - 15))}px`,
      }}
    >
      <div className="bg-neutral-950/90 backdrop-blur-md border border-amber-500/50 text-neutral-100 rounded-xl px-3.5 py-2 shadow-2xl flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-100">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <div>
          <div className="font-serif font-bold text-sm text-neutral-100 flex items-center gap-1.5">
            <span>{info.name}</span>
          </div>
          {info.subtitle && (
            <div className="text-xs text-amber-300/90 font-mono mt-0.5">{info.subtitle}</div>
          )}
          <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
            <Eye className="w-3 h-3 text-neutral-500" />
            <span>Click to interact & inspect</span>
          </div>
        </div>
      </div>
    </div>
  );
};
