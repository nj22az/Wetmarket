/**
 * Interactive 3D Fruit Inspection Viewer & Market Scale Simulator.
 * Allows 360-degree rotation, cross-section slicing view, and weighing.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FruitData, buildFruitModel } from '../three/fruitAssets';
import { marketAudio } from '../utils/audio';
import { X, Scale, Scissors, ShoppingBag, Plus, Minus, Check, Sparkles, MapPin, Calendar, Award } from 'lucide-react';

interface Props {
  fruit: FruitData;
  onClose: () => void;
  onAddToBasket: (fruit: FruitData, quantity: number) => void;
}

export const FruitInspectModal: React.FC<Props> = ({ fruit, onClose, onAddToBasket }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [sliced, setSliced] = useState(false);
  const [isWeighing, setIsWeighing] = useState(false);
  const [weighedWeight, setWeighedWeight] = useState(fruit.weightGrams);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  // Three.js mini inspector setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x13171f);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10);
    camera.position.set(0, 0.4, 1.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm three-point lighting
    const amb = new THREE.AmbientLight(0xfff1e6, 0.8);
    scene.add(amb);

    const key = new THREE.DirectionalLight(0xfff7ed, 2.2);
    key.position.set(2, 3, 2);
    key.castShadow = true;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rim.position.set(-2, 1, -2);
    scene.add(rim);

    // Red conical lamp replica casting downward warm cone
    const redLampLight = new THREE.PointLight(0xf87171, 1.5, 3);
    redLampLight.position.set(0, 1.2, 0);
    scene.add(redLampLight);

    // Fruit model
    const fruitModel = buildFruitModel(fruit.id, sliced);
    fruitModel.scale.setScalar(1.2);
    scene.add(fruitModel);

    // Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.08, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      roughness: 0.6,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.45, 0);
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Pointer rotation control
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      fruitModel.rotation.y += dx * 0.015;
      fruitModel.rotation.x = Math.max(-0.6, Math.min(0.6, fruitModel.rotation.x + dy * 0.01));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        fruitModel.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, [fruit, sliced]);

  // Weigh fruit on scale simulation
  const handleWeighOnScale = () => {
    setIsWeighing(true);
    marketAudio.playScaleWeigh();
    // Simulate slight natural variance in wet market scales
    const variance = (Math.random() - 0.5) * 60;
    setTimeout(() => {
      setWeighedWeight(Math.round(fruit.weightGrams + variance));
      setIsWeighing(false);
    }, 450);
  };

  const handleToggleSlice = () => {
    marketAudio.playFruitPickup();
    setSliced(!sliced);
  };

  const handleAdd = () => {
    marketAudio.playCoinDrop();
    onAddToBasket(fruit, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1600);
  };

  const catties = (weighedWeight / 600).toFixed(2); // 1 Hong Kong catty = 600g

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 text-neutral-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 rounded-full transition-colors"
          title="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: 3D Interactive Fruit Viewer */}
        <div className="md:col-span-6 bg-gradient-to-b from-neutral-800/60 to-neutral-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
              <span className="tracking-wider uppercase">{fruit.category} Produce</span>
              <span className="text-neutral-400 font-normal">Drag to Rotate 360°</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-neutral-100 flex items-baseline gap-2">
              <span>{fruit.nameChinese}</span>
              <span className="text-sm font-sans font-normal text-neutral-400">({fruit.pinyin})</span>
            </h2>
            <div className="text-sm text-neutral-300 font-medium">{fruit.nameEnglish}</div>
          </div>

          {/* 3D Canvas Mount */}
          <div className="relative w-full h-72 md:h-80 my-3 flex items-center justify-center cursor-grab active:cursor-grabbing">
            <div ref={mountRef} className="w-full h-full" />

            {/* Sliced Badge Indicator */}
            {sliced && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs rounded-md backdrop-blur-sm flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-rose-400" />
                Cross-Section View
              </div>
            )}
          </div>

          {/* 3D Controls Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSlice}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                sliced
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
              }`}
            >
              <Scissors className="w-4 h-4" />
              {sliced ? 'View Whole Fruit' : 'Cut / Slice Open'}
            </button>

            <button
              onClick={handleWeighOnScale}
              disabled={isWeighing}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Scale className={`w-4 h-4 ${isWeighing ? 'animate-bounce' : ''}`} />
              {isWeighing ? 'Weighing...' : 'Place on Scale'}
            </button>
          </div>
        </div>

        {/* Right Column: Fruit Data, Market Wisdom & Purchase */}
        <div className="md:col-span-6 p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-none space-y-5">
          {/* Top Info & Price */}
          <div>
            <div className="flex items-baseline justify-between border-b border-neutral-800 pb-4 mb-4">
              <div>
                <div className="text-3xl font-extrabold text-amber-400 font-mono">
                  HK${fruit.priceHkd}
                  <span className="text-xs font-sans text-neutral-400 ml-1.5">/ {fruit.unit}</span>
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">Approx. ${(fruit.priceHkd * 0.13).toFixed(2)} USD</div>
              </div>

              {/* Hanging Scale Reading */}
              <div className="text-right">
                <div className="text-xs text-neutral-400">Scale Reading</div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  {weighedWeight}g <span className="text-xs font-sans text-neutral-400">({catties} 斤)</span>
                </div>
              </div>
            </div>

            {/* Quality Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 bg-neutral-800/60 rounded-lg border border-neutral-700/50">
                <div className="text-neutral-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Sweetness Rating
                </div>
                <div className="text-base font-semibold text-neutral-100">{fruit.sweetnessBrix}° Brix</div>
                <div className="w-full bg-neutral-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (fruit.sweetnessBrix / 30) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-800/60 rounded-lg border border-neutral-700/50">
                <div className="text-neutral-400 flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  Ripeness State
                </div>
                <div className="text-base font-semibold text-emerald-400">{fruit.ripeness}</div>
                <div className="text-[11px] text-neutral-400 mt-1">Inspected Daily</div>
              </div>
            </div>

            {/* Origin & Season */}
            <div className="flex items-center gap-4 text-xs text-neutral-400 mb-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>{fruit.origin}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Season: {fruit.season}</span>
              </div>
            </div>

            {/* Flavor Tasting Notes */}
            <div className="mb-4">
              <div className="text-xs text-neutral-400 uppercase tracking-wider mb-2">Aroma & Flavor Profile</div>
              <div className="flex flex-wrap gap-1.5">
                {fruit.flavorNotes.map((note, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-neutral-800 text-neutral-200 border border-neutral-700/60 rounded-md text-xs"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Authentic Wet Market Uncle Pro Tip */}
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs text-amber-200/90 leading-relaxed mb-4">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
                <span>🇭🇰 街市老檔主秘訣 (Market Stall Wisdom)</span>
              </div>
              {fruit.marketTips}
            </div>
          </div>

          {/* Purchase Bar */}
          <div className="pt-3 border-t border-neutral-800">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-xs text-neutral-400">Select Quantity:</span>
              <div className="flex items-center border border-neutral-700 rounded-lg overflow-hidden bg-neutral-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 hover:bg-neutral-700 text-neutral-300"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-mono font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 hover:bg-neutral-700 text-neutral-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="ml-auto text-right">
                <div className="text-xs text-neutral-400">Total Price</div>
                <div className="font-mono font-bold text-amber-400 text-lg">HK${fruit.priceHkd * quantity}</div>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 active:scale-[0.99]"
            >
              {addedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Market Basket!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Bag Produce & Add to Basket
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
