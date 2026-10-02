/**
 * Floating HUD Controls Toolbar & Fruit Catalog Strip for Kowloon Wet Market 3D.
 */
import React from 'react';
import { LightingMode } from '../three/MarketScene';
import { FRUIT_CATALOG, FruitData } from '../three/fruitAssets';
import { Sun, Moon, Sunset, CloudRain, Wind, Droplets, Info } from 'lucide-react';

interface Props {
  lightingMode: LightingMode;
  onSelectLighting: (mode: LightingMode) => void;
  wetness: number;
  onChangeWetness: (val: number) => void;
  lampsSway: boolean;
  onToggleLampSway: () => void;
  onInspectFruit: (fruit: FruitData) => void;
  isFirstPerson: boolean;
}

export const HUDToolbar: React.FC<Props> = ({
  lightingMode,
  onSelectLighting,
  wetness,
  onChangeWetness,
  lampsSway,
  onToggleLampSway,
  onInspectFruit,
  isFirstPerson,
}) => {
  const fruitList = Object.values(FRUIT_CATALOG);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 flex flex-col gap-3 pointer-events-none select-none">
      {/* Fruit Catalog Fast-Picker Strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 pointer-events-auto scrollbar-none max-w-full mx-auto">
        <div className="bg-neutral-950/85 backdrop-blur-md border border-neutral-800 rounded-2xl p-1.5 flex items-center gap-1.5 shadow-xl">
          <div className="px-3 py-1 text-xs text-amber-400 font-semibold uppercase tracking-wider hidden sm:block">
            Inspect Produce
          </div>
          {fruitList.map((fruit) => (
            <button
              key={fruit.id}
              onClick={() => onInspectFruit(fruit)}
              className="px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800/80 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={`Inspect 3D ${fruit.nameEnglish}`}
            >
              <span className="font-serif text-amber-300">{fruit.nameChinese}</span>
              <span className="text-neutral-400 font-mono text-[11px] tabular-nums">HK${fruit.priceHkd}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950/85 backdrop-blur-md border border-neutral-800/90 rounded-2xl p-2.5 px-4 shadow-2xl pointer-events-auto max-w-4xl mx-auto w-full text-neutral-300 text-xs">
        {/* Lighting Atmosphere Segmented Tabs */}
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 font-medium mr-2 hidden sm:inline">Lighting:</span>
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
            <button
              onClick={() => onSelectLighting('dusk')}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                lightingMode === 'dusk'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sunset className="w-3.5 h-3.5" />
              <span>Dusk</span>
            </button>

            <button
              onClick={() => onSelectLighting('night')}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                lightingMode === 'night'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Night Neon</span>
            </button>

            <button
              onClick={() => onSelectLighting('day')}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                lightingMode === 'day'
                  ? 'bg-sky-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Daylight</span>
            </button>

            <button
              onClick={() => onSelectLighting('rain')}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                lightingMode === 'rain'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Rainy Wet</span>
            </button>
          </div>
        </div>

        {/* Floor Wetness / Puddle Reflection Slider */}
        <div className="flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-neutral-400 hidden md:inline">Wet Floor:</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={wetness}
            onChange={(e) => onChangeWetness(parseFloat(e.target.value))}
            className="w-20 md:w-28 accent-amber-400 cursor-pointer"
            title="Floor Wetness & Puddle Reflection"
          />
        </div>

        {/* Lamp Sway Physics Toggle */}
        <button
          onClick={onToggleLampSway}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
            lampsSway
              ? 'bg-neutral-800 text-amber-300 border-amber-500/40'
              : 'bg-neutral-900 text-neutral-500 border-neutral-800'
          }`}
          title="Toggle Red Market Lamp Swaying Breeze"
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Lamp Sway</span>
        </button>

        {/* Interaction Hint */}
        <div className="hidden lg:flex items-center gap-1.5 text-neutral-400 text-[11px]">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          {isFirstPerson ? (
            <span>Use <strong className="text-neutral-200">WASD</strong> to walk, Mouse to look</span>
          ) : (
            <span>Click any stall or fruit to inspect · Drag to orbit</span>
          )}
        </div>
      </div>
    </div>
  );
};
