/**
 * Procedural texture generators for Kowloon Wet Market 3D.
 * Generates crisp, realistic textures entirely in-memory using HTML5 Canvas.
 */
import * as THREE from 'three';

// Cache generated textures so we don't recreate them repeatedly
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates an authentic wet tiled market pavement texture with mortar lines,
 * subtle surface grime, and drain gutters.
 */
export function createWetTileTexture(wetness = 0.85): {
  diffuse: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
  normal: THREE.CanvasTexture;
} {
  const cacheKey = `wet_tiles_${wetness.toFixed(2)}`;
  if (textureCache.has(cacheKey + '_diff')) {
    return {
      diffuse: textureCache.get(cacheKey + '_diff')!,
      roughness: textureCache.get(cacheKey + '_rough')!,
      normal: textureCache.get(cacheKey + '_norm')!,
    };
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  // 1. Base pavement stone color: aged grayish-beige with damp staining
  ctx.fillStyle = '#424549';
  ctx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#b8b8b8'; // default stone roughness (quite rough)
  rCtx.fillRect(0, 0, size, size);

  // 2. Tile grid (rectangular market pavers)
  const cols = 8;
  const rows = 16;
  const tileW = size / cols;
  const tileH = size / rows;
  const grout = 6;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tileW + (r % 2 === 0 ? 0 : tileW * 0.5) - (r % 2 === 0 ? 0 : tileW * 0.5);
      const y = r * tileH;

      // Slight natural shade variation per stone tile
      const shade = 65 + Math.floor(Math.sin(c * 13.5 + r * 7.2) * 20);
      const redTint = Math.floor(Math.sin(r * 3.1) * 6);
      ctx.fillStyle = `rgb(${shade + redTint}, ${shade + 2}, ${shade - 2})`;
      ctx.fillRect(c * tileW + grout / 2, r * tileH + grout / 2, tileW - grout, tileH - grout);

      // Inner tile micro-staining / age spots
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(c * tileW + grout * 1.5, r * tileH + grout * 1.5, (tileW - grout) * 0.4, (tileH - grout) * 0.6);
    }
  }

  // 3. Wet Puddle Zones (irregular organic shapes where water collects)
  const puddleSeeds = [
    { x: size * 0.35, y: size * 0.4, rx: size * 0.28, ry: size * 0.18, rot: 0.2 },
    { x: size * 0.72, y: size * 0.75, rx: size * 0.22, ry: size * 0.15, rot: -0.3 },
    { x: size * 0.2, y: size * 0.85, rx: size * 0.16, ry: size * 0.12, rot: 0.4 },
    { x: size * 0.55, y: size * 0.18, rx: size * 0.24, ry: size * 0.14, rot: 0.1 },
  ];

  puddleSeeds.forEach(p => {
    // Wet pavement is darker in diffuse
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, Math.max(p.rx, p.ry));
    grad.addColorStop(0, 'rgba(15, 18, 20, 0.75)');
    grad.addColorStop(0.7, 'rgba(25, 28, 30, 0.5)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Roughness is extremely low inside puddles (glossy specular reflection!)
    rCtx.save();
    rCtx.translate(p.x, p.y);
    rCtx.rotate(p.rot);
    const rGrad = rCtx.createRadialGradient(0, 0, 10, 0, 0, Math.max(p.rx, p.ry));
    const puddleRoughness = (1 - wetness) * 0.2; // very slick when wet
    rGrad.addColorStop(0, `rgba(${Math.floor(puddleRoughness * 255)}, ${Math.floor(puddleRoughness * 255)}, ${Math.floor(puddleRoughness * 255)}, 1)`);
    rGrad.addColorStop(0.7, `rgba(40, 40, 40, 0.8)`);
    rGrad.addColorStop(1, `rgba(180, 180, 180, 0)`);
    rCtx.fillStyle = rGrad;
    rCtx.beginPath();
    rCtx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
    rCtx.fill();
    rCtx.restore();
  });

  // Overall wet sheen applied if wetness > 0.5
  if (wetness > 0.5) {
    rCtx.fillStyle = `rgba(30, 30, 30, ${(wetness - 0.5) * 0.6})`;
    rCtx.fillRect(0, 0, size, size);
  }

  // 4. Normal map generation (subtle tile borders and stone bump)
  const normCanvas = document.createElement('canvas');
  normCanvas.width = size;
  normCanvas.height = size;
  const nCtx = normCanvas.getContext('2d')!;
  nCtx.fillStyle = 'rgb(128, 128, 255)'; // Flat normal
  nCtx.fillRect(0, 0, size, size);

  // Bevel tile edges in normal map
  nCtx.strokeStyle = 'rgb(90, 90, 240)';
  nCtx.lineWidth = grout;
  for (let r = 0; r <= rows; r++) {
    nCtx.beginPath();
    nCtx.moveTo(0, r * tileH);
    nCtx.lineTo(size, r * tileH);
    nCtx.stroke();
  }
  for (let c = 0; c <= cols; c++) {
    nCtx.beginPath();
    nCtx.moveTo(c * tileW, 0);
    nCtx.lineTo(c * tileW, size);
    nCtx.stroke();
  }

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.colorSpace = THREE.SRGBColorSpace;

  const roughness = new THREE.CanvasTexture(roughCanvas);
  roughness.wrapS = THREE.RepeatWrapping;
  roughness.wrapT = THREE.RepeatWrapping;

  const normal = new THREE.CanvasTexture(normCanvas);
  normal.wrapS = THREE.RepeatWrapping;
  normal.wrapT = THREE.RepeatWrapping;

  textureCache.set(cacheKey + '_diff', diffuse);
  textureCache.set(cacheKey + '_rough', roughness);
  textureCache.set(cacheKey + '_norm', normal);

  return { diffuse, roughness, normal };
}

/**
 * Creates authentic wooden plank textures for crates, stall counters, and signs.
 */
export function createWoodPlankTexture(colorVariant: 'dark' | 'honey' | 'aged' = 'dark'): THREE.CanvasTexture {
  const cacheKey = `wood_${colorVariant}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const width = 512;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const baseColors = {
    dark: { r: 94, g: 62, b: 42 },
    honey: { r: 168, g: 118, b: 72 },
    aged: { r: 82, g: 74, b: 68 },
  }[colorVariant];

  ctx.fillStyle = `rgb(${baseColors.r}, ${baseColors.g}, ${baseColors.b})`;
  ctx.fillRect(0, 0, width, height);

  // Planks
  const plankCount = 8;
  const plankH = height / plankCount;

  for (let i = 0; i < plankCount; i++) {
    const y = i * plankH;
    const toneOffset = (Math.sin(i * 4.3) * 15) | 0;
    ctx.fillStyle = `rgb(${baseColors.r + toneOffset}, ${baseColors.g + toneOffset}, ${baseColors.b + toneOffset})`;
    ctx.fillRect(0, y + 2, width, plankH - 4);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1.2;
    for (let g = 0; g < 14; g++) {
      const gy = y + 4 + Math.random() * (plankH - 8);
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(
        width * 0.3, gy + (Math.random() - 0.5) * 6,
        width * 0.7, gy + (Math.random() - 0.5) * 6,
        width, gy
      );
      ctx.stroke();
    }

    // Plank seam / groove
    ctx.fillStyle = 'rgba(20, 12, 8, 0.75)';
    ctx.fillRect(0, y, width, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates authentic Asian wet market store signboards with calligraphy,
 * matching the user's reference image for "味友干菜鋪 - Good Taste Grocery"
 * and other lively stalls.
 */
export function createStoreSignTexture(params: {
  chineseTitle: string;
  englishTitle: string;
  subTitle?: string;
  style: 'good_taste' | 'golden_fruit' | 'dragon_seafood' | 'sun_kee_roast';
}): THREE.CanvasTexture {
  const cacheKey = `sign_${params.style}_${params.chineseTitle}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const width = 1024;
  const height = 384;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  if (params.style === 'good_taste') {
    // 1. "Good Taste Grocery" (味友干菜鋪) - weathered bamboo / wood slat background with gold lettering
    ctx.fillStyle = '#6e5134';
    ctx.fillRect(0, 0, width, height);

    // Vertical wooden / bamboo slats
    const slatW = 16;
    for (let x = 0; x < width; x += slatW) {
      const tint = ((x * 17) % 25) - 12;
      ctx.fillStyle = `rgb(${110 + tint}, ${81 + tint}, ${52 + tint})`;
      ctx.fillRect(x + 1, 0, slatW - 2, height);
      ctx.fillStyle = 'rgba(20,10,5,0.6)';
      ctx.fillRect(x, 0, 1.5, height);
    }

    // Weathered border frame
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#4a341e';
    ctx.strokeRect(7, 7, width - 14, height - 14);

    // Corner decorative metal brackets
    ctx.fillStyle = '#c5a059';
    [[12, 12], [width - 32, 12], [12, height - 32], [width - 32, height - 32]].forEach(([cx, cy]) => {
      ctx.fillRect(cx, cy, 20, 20);
    });

    // Chinese Calligraphy title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow / bevel for carved effect
    ctx.font = 'bold 94px "Noto Serif HK", "Cinzel", "Songti SC", "SimSun", serif';
    ctx.fillStyle = 'rgba(10, 6, 2, 0.75)';
    ctx.fillText(params.chineseTitle, width / 2 + 3, height * 0.42 + 3);

    // Main characters - antique warm white / pale ivory with subtle aged gold tint
    ctx.fillStyle = '#f8f1df';
    ctx.fillText(params.chineseTitle, width / 2, height * 0.42);

    // English Title: "Good Taste Grocery"
    ctx.font = '600 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(10, 6, 2, 0.75)';
    ctx.fillText(params.englishTitle, width / 2 + 2, height * 0.78 + 2);
    ctx.fillStyle = '#f2eae0';
    ctx.fillText(params.englishTitle, width / 2, height * 0.78);

  } else if (params.style === 'golden_fruit') {
    // "Golden Orchard Fresh Fruits" (金園鮮果行) - retro dark green enamel sign with gold/red calligraphy
    ctx.fillStyle = '#103926';
    ctx.fillRect(0, 0, width, height);

    // Gold inner border
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#e6b843';
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Red accent corner ribbons
    ctx.fillStyle = '#be123c';
    ctx.fillRect(20, 20, 60, 10);
    ctx.fillRect(width - 80, 20, 60, 10);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '900 96px "Noto Serif HK", serif';
    ctx.fillStyle = '#e6b843';
    ctx.fillText(params.chineseTitle, width / 2, height * 0.44);

    ctx.font = '700 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(params.englishTitle, width / 2, height * 0.8);

  } else if (params.style === 'dragon_seafood') {
    // "Dragon Wharf Live Seafood" (龍門活海鮮) - deep navy / cobalt wet market tile aesthetic
    ctx.fillStyle = '#0f2942';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(14, 14, width - 28, height - 28);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '900 96px "Noto Serif HK", serif';
    ctx.fillStyle = '#f87171'; // red brush calligraphy
    ctx.fillText(params.chineseTitle, width / 2, height * 0.44);

    ctx.font = '700 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(params.englishTitle, width / 2, height * 0.8);

  } else {
    // Sun Kee Roast & Tea
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#fbbf24';
    ctx.strokeRect(12, 12, width - 24, height - 24);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '900 96px "Noto Serif HK", serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(params.chineseTitle, width / 2, height * 0.44);

    ctx.font = '700 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(params.englishTitle, width / 2, height * 0.8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates Chinese lucky red diamond scrolls ("春", "福", "吉", "招財進寶")
 * hung on market doorposts and beams as seen in image.png!
 */
export function createLuckyBannerTexture(character: string): THREE.CanvasTexture {
  const cacheKey = `lucky_${character}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Festive crimson red diamond
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(Math.PI / 4);
  const s = size * 0.65;
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(-s / 2, -s / 2, s, s);

  // Gold patterned border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(-s / 2 + 6, -s / 2 + 6, s - 12, s - 12);
  ctx.restore();

  // Gold or black calligraphy character in center
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 110px "Noto Serif HK", "Kaiti", serif';
  ctx.fillStyle = '#1c1917'; // traditional black ink
  ctx.fillText(character, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates realistic cardboard produce shipping box textures
 * with stamps, Chinese export marks, and handle cutouts.
 */
export function createCardboardTexture(label: string, fruitName: string): THREE.CanvasTexture {
  const cacheKey = `box_${label}_${fruitName}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Kraft cardboard tan/brown
  ctx.fillStyle = '#be9d73';
  ctx.fillRect(0, 0, size, size);

  // Paper fiber speckles
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < 400; i++) {
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }

  // Stamp border
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, size - 60, size - 60);

  // Brand Name & Grade Stamp
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1c1917';
  ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(label, size / 2, 100);

  // Red Quality Seal stamp
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(-0.1);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 5;
  ctx.strokeRect(-90, -40, 180, 80);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 36px "Noto Serif HK", serif';
  ctx.fillText('特級精選', 0, 8);
  ctx.restore();

  // Fruit name at bottom
  ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#44403c';
  ctx.fillText(fruitName.toUpperCase(), size / 2, 360);

  // Handle cutouts simulation
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.roundRect(size / 2 - 50, 420, 100, 28, 14);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates wicker / woven bamboo basket texture for fruit displays.
 */
export function createWickerTexture(): THREE.CanvasTexture {
  const cacheKey = 'wicker_weave';
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#9a7548';
  ctx.fillRect(0, 0, size, size);

  const step = 16;
  ctx.strokeStyle = '#674d2c';
  ctx.lineWidth = 3;

  for (let x = 0; x < size; x += step) {
    for (let y = 0; y < size; y += step) {
      if ((x + y) % (step * 2) === 0) {
        ctx.fillStyle = '#b7915e';
        ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
      } else {
        ctx.fillStyle = '#7a5a33';
        ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates retro Chinese market wall posters & price slates.
 */
export function createMarketPosterTexture(): THREE.CanvasTexture {
  const cacheKey = 'wall_posters';
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const width = 512;
  const height = 768;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Weathered poster paper
  ctx.fillStyle = '#f5e8cf';
  ctx.fillRect(0, 0, width, height);

  // Red header banner
  ctx.fillStyle = '#be123c';
  ctx.fillRect(20, 30, width - 40, 80);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 44px "Noto Serif HK", serif';
  ctx.fillText('今日時令特價', width / 2, 85);

  // Price rows
  const items = [
    { name: '金枕頭榴槤 (Durian)', price: '$48 / 斤' },
    { name: '紅肉火龍果 (Pitaya)', price: '$22 / 3個' },
    { name: '水蜜桃王 (Peach)', price: '$35 / 盒' },
    { name: '黑葉荔枝 (Lychee)', price: '$28 / 斤' },
    { name: '甜密西瓜 (Melon)', price: '$18 / 斤' },
  ];

  ctx.textAlign = 'left';
  items.forEach((item, idx) => {
    const y = 180 + idx * 75;
    ctx.font = '600 24px "Noto Serif HK", sans-serif';
    ctx.fillStyle = '#1c1917';
    ctx.fillText(item.name, 40, y);

    ctx.textAlign = 'right';
    ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText(item.price, width - 40, y);
    ctx.textAlign = 'left';

    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, y + 20);
    ctx.lineTo(width - 40, y + 20);
    ctx.stroke();
  });

  // Weathered edges
  ctx.fillStyle = 'rgba(80, 50, 20, 0.2)';
  ctx.fillRect(0, 0, width, 10);
  ctx.fillRect(0, height - 20, width, 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}
