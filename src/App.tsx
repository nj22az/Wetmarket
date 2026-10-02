/**
 * Kowloon Wet Market 3D Application.
 * Full-scale interactive 3D simulation with authentic Asian grocery stalls,
 * realistic lighting, hanging red market lamps, and detailed fruit assets.
 */
import React, { useEffect, useRef, useState } from 'react';
import { MarketScene, LightingMode, InteractiveObjectInfo } from './three/MarketScene';
import { FRUIT_CATALOG, FruitData } from './three/fruitAssets';
import { TopBar } from './components/TopBar';
import { HUDToolbar } from './components/HUDToolbar';
import { FruitInspectModal } from './components/FruitInspectModal';
import { BasketDrawer, BasketItem } from './components/BasketDrawer';
import { ObjectTooltip } from './components/ObjectTooltip';
import { marketAudio } from './utils/audio';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MarketScene | null>(null);

  // App State
  const [activePreset, setActivePreset] = useState<'overview' | 'good_taste' | 'fruits' | 'seafood' | 'scale'>('overview');
  const [lightingMode, setLightingMode] = useState<LightingMode>('dusk');
  const [wetness, setWetness] = useState(0.85);
  const [lampsSway, setLampsSway] = useState(true);
  const [isFirstPerson, setIsFirstPerson] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Inspection & Cart
  const [selectedFruit, setSelectedFruit] = useState<FruitData | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<InteractiveObjectInfo | null>(null);
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const scene = new MarketScene(canvasContainerRef.current);
    sceneRef.current = scene;

    // Callbacks from 3D world
    scene.onFruitSelect = (fruitId: string) => {
      const fruit = FRUIT_CATALOG[fruitId];
      if (fruit) {
        marketAudio.playFruitPickup();
        setSelectedFruit(fruit);
      }
    };

    scene.onHoverChange = (info: InteractiveObjectInfo | null) => {
      setHoveredInfo(info);
    };

    // User gesture starts audio ambiance smoothly
    const startAudioOnFirstClick = () => {
      marketAudio.startAmbiance();
      window.removeEventListener('pointerdown', startAudioOnFirstClick);
    };
    window.addEventListener('pointerdown', startAudioOnFirstClick);

    return () => {
      window.removeEventListener('pointerdown', startAudioOnFirstClick);
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Handlers
  const handleSelectPreset = (preset: 'overview' | 'good_taste' | 'fruits' | 'seafood' | 'scale') => {
    setActivePreset(preset);
    setIsFirstPerson(false);
    sceneRef.current?.goToPreset(preset);
  };

  const handleSelectLighting = (mode: LightingMode) => {
    setLightingMode(mode);
    sceneRef.current?.applyLightingMode(mode);
    marketAudio.playSwitchClick();
  };

  const handleChangeWetness = (val: number) => {
    setWetness(val);
    sceneRef.current?.setWetness(val);
  };

  const handleToggleLampSway = () => {
    const nextVal = !lampsSway;
    setLampsSway(nextVal);
    if (sceneRef.current) {
      sceneRef.current.lampsSway = nextVal;
    }
  };

  const handleToggleFirstPerson = () => {
    const nextFp = !isFirstPerson;
    setIsFirstPerson(nextFp);
    sceneRef.current?.setFirstPersonMode(nextFp);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    marketAudio.setMuted(nextMuted);
  };

  const handleInspectFruit = (fruit: FruitData) => {
    marketAudio.playFruitPickup();
    setSelectedFruit(fruit);
    sceneRef.current?.focusFruit(fruit.id);
  };

  const handleAddToBasket = (fruit: FruitData, quantity: number) => {
    setBasketItems((prev) => {
      const existing = prev.find((item) => item.fruit.id === fruit.id);
      if (existing) {
        return prev.map((item) =>
          item.fruit.id === fruit.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { fruit, quantity }];
    });
  };

  const handleRemoveFromBasket = (fruitId: string) => {
    setBasketItems((prev) => prev.filter((item) => item.fruit.id !== fruitId));
  };

  const handleClearBasket = () => {
    setBasketItems([]);
  };

  const totalBasketCount = basketItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans">
      {/* Top Navigation Bar */}
      <TopBar
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        basketCount={totalBasketCount}
        onOpenBasket={() => setIsBasketOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isFirstPerson={isFirstPerson}
        onToggleFirstPerson={handleToggleFirstPerson}
      />

      {/* 3D WebGL Canvas Viewport */}
      <div ref={canvasContainerRef} className="w-full h-full cursor-default" />

      {/* 3D Hover Tooltip */}
      <ObjectTooltip info={hoveredInfo} />

      {/* Floating HUD Controls Toolbar */}
      <HUDToolbar
        lightingMode={lightingMode}
        onSelectLighting={handleSelectLighting}
        wetness={wetness}
        onChangeWetness={handleChangeWetness}
        lampsSway={lampsSway}
        onToggleLampSway={handleToggleLampSway}
        onInspectFruit={handleInspectFruit}
        isFirstPerson={isFirstPerson}
      />

      {/* Interactive Fruit Inspector Modal */}
      {selectedFruit && (
        <FruitInspectModal
          fruit={selectedFruit}
          onClose={() => setSelectedFruit(null)}
          onAddToBasket={handleAddToBasket}
        />
      )}

      {/* Market Basket Checkout Drawer */}
      <BasketDrawer
        isOpen={isBasketOpen}
        onClose={() => setIsBasketOpen(false)}
        items={basketItems}
        onRemoveItem={handleRemoveFromBasket}
        onClearBasket={handleClearBasket}
      />
    </div>
  );
}
