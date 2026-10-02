/**
 * 3D Fruit Assets and Procedural Geometries for Kowloon Wet Market.
 * Each fruit is modeled with high detail, realistic materials, and cross-section anatomy.
 */
import * as THREE from 'three';

export interface FruitData {
  id: string;
  nameEnglish: string;
  nameChinese: string;
  pinyin: string;
  category: 'Tropical' | 'Citrus' | 'Melon' | 'Exotic' | 'Greens';
  priceHkd: number;
  unit: string;
  weightGrams: number;
  sweetnessBrix: number;
  ripeness: 'Ready to Eat' | 'Peak Flavor' | 'Ripens in 2 Days' | 'Super Crisp';
  origin: string;
  season: string;
  flavorNotes: string[];
  marketTips: string;
}

export const FRUIT_CATALOG: Record<string, FruitData> = {
  durian: {
    id: 'durian',
    nameEnglish: 'Monthong Golden Pillow Durian',
    nameChinese: '金枕頭榴槤',
    pinyin: 'Jīn Zhěntóu Liúlián',
    category: 'Exotic',
    priceHkd: 68,
    unit: 'catty (斤)',
    weightGrams: 2800,
    sweetnessBrix: 28,
    ripeness: 'Peak Flavor',
    origin: 'Chanthaburi, Thailand',
    season: 'May - September',
    flavorNotes: ['Rich Custard', 'Almond Cream', 'Caramelized Onion', 'Whipped Vanilla'],
    marketTips: 'Experienced market stall masters tap the thorny shell with a rattan rod—a hollow, vibrating thud means the creamy arils have pulled away from the wall and reached maximum buttery ripeness.',
  },
  dragonfruit: {
    id: 'dragonfruit',
    nameEnglish: 'Ruby Red Dragonfruit (Pitaya)',
    nameChinese: '紅心火龍果',
    pinyin: 'Hóngxīn Huǒlóngguǒ',
    category: 'Tropical',
    priceHkd: 22,
    unit: '2 pcs (個)',
    weightGrams: 420,
    sweetnessBrix: 16,
    ripeness: 'Ready to Eat',
    origin: 'Pingtung, Taiwan',
    season: 'Year-round',
    flavorNotes: ['Subtle Berry', 'Crisp Kiwi', 'Earthy Floral', 'Refreshing Hydration'],
    marketTips: 'Look for bright magenta skin with green tipped bracts that are supple rather than brittle. Red flesh varieties are notably sweeter than white flesh ones.',
  },
  watermelon: {
    id: 'watermelon',
    nameEnglish: 'Sweet Striped Watermelon',
    nameChinese: '蜜寶西瓜',
    pinyin: 'Mìbǎo Xīguā',
    category: 'Melon',
    priceHkd: 16,
    unit: 'catty (斤)',
    weightGrams: 4500,
    sweetnessBrix: 13,
    ripeness: 'Ready to Eat',
    origin: 'Huizhou, Guangdong',
    season: 'Summer - Autumn',
    flavorNotes: ['Honey Water', 'Summer Crisp', 'Floral Nectar', 'Icy Refreshment'],
    marketTips: 'Knock on the melon with your knuckles—it should produce a deep resonant bass sound like a hollow drum. The creamy yellow field spot proves it ripened under direct sunshine.',
  },
  mango: {
    id: 'mango',
    nameEnglish: 'Philippine Carabao Mango',
    nameChinese: '菲律賓呂宋芒',
    pinyin: 'Lǚsòng Máng',
    category: 'Tropical',
    priceHkd: 38,
    unit: '3 pcs (個)',
    weightGrams: 260,
    sweetnessBrix: 22,
    ripeness: 'Peak Flavor',
    origin: 'Guimaras, Philippines',
    season: 'March - July',
    flavorNotes: ['Sweet Honey', 'Velvety Nectarine', 'Bright Citrus Zest', 'Zero Fiber'],
    marketTips: 'Gentle floral aroma radiating from the stem cap is the surest sign of golden maturity. Wet market stalls keep them cushioned in tissue paper.',
  },
  pineapple: {
    id: 'pineapple',
    nameEnglish: 'Taiwan Diamond Hill Pineapple',
    nameChinese: '金鑽鳳梨',
    pinyin: 'Jīnzuàn Fènglí',
    category: 'Tropical',
    priceHkd: 28,
    unit: 'whole (個)',
    weightGrams: 1400,
    sweetnessBrix: 18,
    ripeness: 'Peak Flavor',
    origin: 'Tainan, Taiwan',
    season: 'April - August',
    flavorNotes: ['Golden Caramel', 'Tangy Sweet', 'Edible Sweet Core', 'Subtropical Breeze'],
    marketTips: 'The Jinzuan variety has so little bromelain acidity that you do not need to soak it in salt water, and its tender core is just as sweet as the outer meat.',
  },
  mangosteen: {
    id: 'mangosteen',
    nameEnglish: 'Queen of Fruits Mangosteen',
    nameChinese: '泰國頂級山竹',
    pinyin: 'Shānzhú',
    category: 'Exotic',
    priceHkd: 45,
    unit: 'lb (磅)',
    weightGrams: 110,
    sweetnessBrix: 19,
    ripeness: 'Ready to Eat',
    origin: 'Rayong, Thailand',
    season: 'May - August',
    flavorNotes: ['Sherbet Tart', 'Lychee Sweet', 'Velvet Peach', 'Snowflake Texture'],
    marketTips: 'Check the bottom petals—the number of woody petals exactly equals the number of snowy white fruit segments inside! Press the shell gently; it should yield like a soft rubber ball.',
  },
  bananas: {
    id: 'bananas',
    nameEnglish: 'Emperor Fragrant Bananas',
    nameChinese: '皇帝蕉 / 香蕉',
    pinyin: 'Huángdì Jiāo',
    category: 'Tropical',
    priceHkd: 14,
    unit: 'comb (梳)',
    weightGrams: 900,
    sweetnessBrix: 21,
    ripeness: 'Peak Flavor',
    origin: 'Hainan Island',
    season: 'Year-round',
    flavorNotes: ['Dense Cream', 'Honey Perfume', 'Vanilla Bean', 'Rich Starch'],
    marketTips: 'Wet market shoppers love the tiny "sugar freckles" (芝麻點) that appear on the skin, signaling starch has completely turned into liquid sugar.',
  },
  oranges: {
    id: 'oranges',
    nameEnglish: 'Sugar Ring Mandarin Oranges',
    nameChinese: '砂糖橘 / 蜜柑',
    pinyin: 'Shātáng Jú',
    category: 'Citrus',
    priceHkd: 20,
    unit: 'catty (斤)',
    weightGrams: 85,
    sweetnessBrix: 15,
    ripeness: 'Ready to Eat',
    origin: 'Sihui, Guangdong',
    season: 'November - February',
    flavorNotes: ['Bursting Juice', 'Candied Peel Aroma', 'Mellow Acidity', 'Seedless Sweet'],
    marketTips: 'The skin is paper-thin and separates effortlessly from the segments. Market fruit stalls sell them with green leaves still attached to demonstrate freshness.',
  },
  papaya: {
    id: 'papaya',
    nameEnglish: 'Solo Sunset Red Papaya',
    nameChinese: '夏威夷紅肉木瓜',
    pinyin: 'Hóngròu Mùguā',
    category: 'Tropical',
    priceHkd: 25,
    unit: '2 pcs (個)',
    weightGrams: 650,
    sweetnessBrix: 14,
    ripeness: 'Peak Flavor',
    origin: 'Oahu / Guangdong',
    season: 'Year-round',
    flavorNotes: ['Melon Cantaloupe', 'Silky Papain', 'Subtle Musky Honey'],
    marketTips: 'Often simmered in traditional Hong Kong dessert soups with rock sugar and snow fungus (銀耳燉木瓜) for skin health and vitality.',
  },
  bokchoy: {
    id: 'bokchoy',
    nameEnglish: 'Crisp Baby Shanghai Bok Choy',
    nameChinese: '精選上海青菜心',
    pinyin: 'Shànghǎi Qīng',
    category: 'Greens',
    priceHkd: 12,
    unit: 'catty (斤)',
    weightGrams: 300,
    sweetnessBrix: 5,
    ripeness: 'Super Crisp',
    origin: 'New Territories, Hong Kong',
    season: 'Autumn - Spring',
    flavorNotes: ['Crisp Peppery Clean', 'Sweet Stem Water', 'Tender Jade Leaf'],
    marketTips: 'Kept misted with fresh water in wet market wicker baskets. The squat, spoon-shaped stems are stir-fried with fragrant garlic and oyster sauce.',
  },
};

/**
 * 1. Durian 3D Mesh Builder
 */
export function createDurianMesh(sliced = false): THREE.Group {
  const group = new THREE.Group();
  group.name = 'durian';

  // Base husk: elongated egg-shaped base
  const huskGeo = new THREE.SphereGeometry(0.35, 24, 20);
  huskGeo.scale(1, 1.25, 0.95);

  const huskMat = new THREE.MeshStandardMaterial({
    color: 0x7c7336,
    roughness: 0.9,
    metalness: 0.05,
  });

  const baseMesh = new THREE.Mesh(huskGeo, huskMat);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Instanced or grouped thorns
  const thornGeo = new THREE.ConeGeometry(0.024, 0.065, 4);
  thornGeo.translate(0, 0.032, 0);
  thornGeo.rotateX(Math.PI / 2);

  const thornMat = new THREE.MeshStandardMaterial({
    color: 0x8b803a,
    roughness: 0.85,
  });

  // Distribute thorns on surface
  const thornCount = 220;
  const dummy = new THREE.Object3D();
  const instancedThorns = new THREE.InstancedMesh(thornGeo, thornMat, thornCount);
  instancedThorns.castShadow = true;

  for (let i = 0; i < thornCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / thornCount);
    const theta = Math.sqrt(thornCount * Math.PI) * phi;

    const x = Math.cos(theta) * Math.sin(phi) * 0.35;
    const y = Math.cos(phi) * 0.44;
    const z = Math.sin(theta) * Math.sin(phi) * 0.33;

    dummy.position.set(x, y, z);
    dummy.lookAt(x * 2, y * 1.8, z * 2);
    dummy.scale.setScalar(0.75 + Math.random() * 0.35);
    dummy.updateMatrix();
    instancedThorns.setMatrixAt(i, dummy.matrix);
  }
  instancedThorns.instanceMatrix.needsUpdate = true;
  group.add(instancedThorns);

  // Curved Woody Stem
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.42, 0),
    new THREE.Vector3(0.02, 0.52, 0.01),
    new THREE.Vector3(0.06, 0.6, -0.02),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 10, 0.03, 8, false);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x4a3b2c,
    roughness: 0.95,
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.castShadow = true;
  group.add(stem);

  // Sliced opening showing creamy custard arils
  if (sliced) {
    const slitGeo = new THREE.SphereGeometry(0.16, 16, 16);
    slitGeo.scale(0.8, 1.4, 0.7);
    const fleshMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.4,
      metalness: 0.05,
    });
    const pulp = new THREE.Mesh(slitGeo, fleshMat);
    pulp.position.set(0.18, 0.02, 0.22);
    pulp.castShadow = true;
    group.add(pulp);
  }

  return group;
}

/**
 * 2. Dragonfruit 3D Mesh Builder
 */
export function createDragonfruitMesh(sliced = false): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dragonfruit';

  // Body: bright fuchsia / ruby magenta
  const bodyGeo = new THREE.SphereGeometry(0.24, 24, 20);
  bodyGeo.scale(1, 1.35, 1);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xbe123c, // vivid magenta
    roughness: 0.6,
    metalness: 0.1,
  });

  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Curved green bract scales
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x65a30d, // lime green tips
    roughness: 0.7,
    side: THREE.DoubleSide,
  });

  const leafGeo = new THREE.ConeGeometry(0.04, 0.12, 5);
  leafGeo.translate(0, 0.06, 0);

  const scalesCount = 42;
  for (let i = 0; i < scalesCount; i++) {
    const t = i / scalesCount;
    const angle = i * 2.4;
    const y = (t - 0.5) * 0.55;
    const rad = Math.sqrt(1 - (y / 0.32) ** 2) * 0.23;

    if (isNaN(rad) || rad <= 0.02) continue;

    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;

    const scaleMesh = new THREE.Mesh(leafGeo, leafMat);
    scaleMesh.position.set(x, y, z);
    scaleMesh.lookAt(x * 1.8, y + 0.1, z * 1.8);
    scaleMesh.rotateX(0.4);
    scaleMesh.scale.set(0.9, 1.1, 0.4);
    scaleMesh.castShadow = true;
    group.add(scaleMesh);
  }

  // If sliced, create a half sphere with seeded texture
  if (sliced) {
    const halfCanvas = document.createElement('canvas');
    halfCanvas.width = 256;
    halfCanvas.height = 256;
    const hCtx = halfCanvas.getContext('2d')!;

    // Red pulp
    hCtx.fillStyle = '#9f1239';
    hCtx.fillRect(0, 0, 256, 256);

    // Inner magenta gradient
    const grad = hCtx.createRadialGradient(128, 128, 20, 128, 128, 120);
    grad.addColorStop(0, '#e11d48');
    grad.addColorStop(1, '#881337');
    hCtx.fillStyle = grad;
    hCtx.fillRect(0, 0, 256, 256);

    // Tiny black seeds scattered
    hCtx.fillStyle = '#0f172a';
    for (let s = 0; s < 180; s++) {
      const sx = 20 + Math.random() * 216;
      const sy = 20 + Math.random() * 216;
      if (Math.hypot(sx - 128, sy - 128) < 110) {
        hCtx.beginPath();
        hCtx.ellipse(sx, sy, 2.5, 1.5, Math.random() * Math.PI, 0, Math.PI * 2);
        hCtx.fill();
      }
    }

    const pulpTex = new THREE.CanvasTexture(halfCanvas);
    const sliceGeo = new THREE.CircleGeometry(0.24, 24);
    const sliceMat = new THREE.MeshStandardMaterial({
      map: pulpTex,
      roughness: 0.4,
    });
    const sliceCap = new THREE.Mesh(sliceGeo, sliceMat);
    sliceCap.position.set(0, 0, 0.242);
    group.add(sliceCap);
  }

  return group;
}

/**
 * 3. Watermelon 3D Mesh Builder
 */
export function createWatermelonMesh(sliced = false): THREE.Group {
  const group = new THREE.Group();
  group.name = 'watermelon';

  // Procedural striped watermelon rind canvas
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#14532d'; // dark forest green
  ctx.fillRect(0, 0, 512, 256);

  // Wavy lighter stripes
  ctx.fillStyle = '#4ade80';
  for (let s = 0; s < 14; s++) {
    const x = s * (512 / 14);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= 256; y += 16) {
      const wave = Math.sin(y * 0.08 + s) * 8 + Math.cos(y * 0.16) * 4;
      ctx.lineTo(x + wave, y);
    }
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#22c55e';
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;

  const melonGeo = new THREE.SphereGeometry(0.38, 32, 24);
  melonGeo.scale(1, 0.95, 1.15); // realistic oblong shape

  const melonMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.45,
    metalness: 0.08,
  });

  const melon = new THREE.Mesh(melonGeo, melonMat);
  melon.castShadow = true;
  melon.receiveShadow = true;
  group.add(melon);

  // Little curly stem
  const stemGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.09, 8);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3f382a, roughness: 0.9 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(0, 0, 0.44);
  stem.rotateX(Math.PI / 2);
  group.add(stem);

  if (sliced) {
    // Sliced carved wedge next to it
    const wedge = createWatermelonWedge();
    wedge.position.set(0.42, -0.1, 0.1);
    wedge.rotation.set(0.2, -0.5, 0.3);
    group.add(wedge);
  }

  return group;
}

export function createWatermelonWedge(): THREE.Group {
  const wedgeGroup = new THREE.Group();
  wedgeGroup.name = 'watermelon_slice';

  // Triangle wedge shape
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.28, 0);
  shape.absarc(0, 0, 0.28, 0, Math.PI / 3, false);
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // juicy red pulp
    roughness: 0.4,
  });

  const wedge = new THREE.Mesh(geo, redMat);
  wedge.castShadow = true;
  wedgeGroup.add(wedge);

  // Green outer rind rim
  const rindGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.08, 16, 1, true, 0, Math.PI / 3);
  const rindMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
  const rind = new THREE.Mesh(rindGeo, rindMat);
  rind.rotateX(Math.PI / 2);
  rind.position.set(0, 0, 0.035);
  wedgeGroup.add(rind);

  // Black seeds
  const seedGeo = new THREE.ConeGeometry(0.008, 0.016, 4);
  seedGeo.rotateZ(Math.PI / 2);
  const seedMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.3 });

  [[0.14, 0.05], [0.18, 0.12], [0.1, 0.09], [0.22, 0.06]].forEach(([sx, sy]) => {
    const seed = new THREE.Mesh(seedGeo, seedMat);
    seed.position.set(sx, sy, 0.075);
    wedgeGroup.add(seed);
  });

  return wedgeGroup;
}

/**
 * 4. Carabao Mango 3D Mesh Builder
 */
export function createMangoMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mango';

  const mangoGeo = new THREE.SphereGeometry(0.18, 24, 20);
  mangoGeo.scale(0.85, 1.45, 0.65);

  // Bend mango into signature kidney curved shape
  const pos = mangoGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const curve = Math.sin((y + 0.25) * 4) * 0.045;
    pos.setX(i, pos.getX(i) + curve);
  }
  pos.needsUpdate = true;
  mangoGeo.computeVertexNormals();

  const mangoMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // golden yellow
    roughness: 0.35,
    metalness: 0.04,
  });

  const mesh = new THREE.Mesh(mangoGeo, mangoMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Stem indentation and dot
  const stemGeo = new THREE.CylinderGeometry(0.008, 0.01, 0.03, 6);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(-0.02, 0.27, 0);
  group.add(stem);

  return group;
}

/**
 * 5. Pineapple 3D Mesh Builder
 */
export function createPineappleMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'pineapple';

  // Body: barrel shaped cylinder with scale details
  const bodyGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.44, 16, 8);
  // Bulge the middle
  const pos = bodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const bulge = 1 + (0.22 - Math.abs(y)) * 0.45;
    pos.setX(i, pos.getX(i) * bulge);
    pos.setZ(i, pos.getZ(i) * bulge);
  }
  pos.needsUpdate = true;
  bodyGeo.computeVertexNormals();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // rich amber
    roughness: 0.8,
    metalness: 0.05,
  });

  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Spiky crown leaves
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });

  const leafGeo = new THREE.ConeGeometry(0.035, 0.28, 4);
  leafGeo.translate(0, 0.14, 0);

  const crownCount = 28;
  for (let i = 0; i < crownCount; i++) {
    const tier = Math.floor(i / 8);
    const angle = i * 1.8;
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0, 0.22 + tier * 0.03, 0);
    leaf.rotation.set(0.3 + tier * 0.15, angle, 0);
    leaf.castShadow = true;
    group.add(leaf);
  }

  return group;
}

/**
 * 6. Mangosteen 3D Mesh Builder
 */
export function createMangosteenMesh(sliced = false): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mangosteen';

  const rindGeo = new THREE.SphereGeometry(0.14, 20, 16);
  const rindMat = new THREE.MeshStandardMaterial({
    color: 0x4a044e, // deep dark plum purple
    roughness: 0.35,
    metalness: 0.12,
  });

  const rind = new THREE.Mesh(rindGeo, rindMat);
  rind.castShadow = true;
  rind.receiveShadow = true;
  group.add(rind);

  // Thick green 4-petal calyx at top
  const calyxMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.7 });
  for (let i = 0; i < 4; i++) {
    const petalGeo = new THREE.SphereGeometry(0.04, 10, 8);
    petalGeo.scale(1.2, 0.4, 0.8);
    const petal = new THREE.Mesh(petalGeo, calyxMat);
    const a = (i * Math.PI) / 2;
    petal.position.set(Math.cos(a) * 0.06, 0.13, Math.sin(a) * 0.06);
    petal.rotation.set(0.3, a, 0);
    group.add(petal);
  }

  // Woody pedicel stem
  const stemGeo = new THREE.CylinderGeometry(0.018, 0.015, 0.06, 8);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x362312 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(0, 0.16, 0);
  group.add(stem);

  if (sliced) {
    // Sliced white segments
    const segmentGeo = new THREE.SphereGeometry(0.045, 12, 10);
    segmentGeo.scale(0.8, 1.1, 0.8);
    const segmentMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
    });
    for (let s = 0; s < 5; s++) {
      const a = (s * Math.PI * 2) / 5;
      const seg = new THREE.Mesh(segmentGeo, segmentMat);
      seg.position.set(Math.cos(a) * 0.05 + 0.18, 0, Math.sin(a) * 0.05);
      group.add(seg);
    }
  }

  return group;
}

/**
 * 7. Bananas Hand/Bunch 3D Mesh Builder
 */
export function createBananasBunchMesh(): THREE.Group {
  const bunch = new THREE.Group();
  bunch.name = 'bananas';

  const bananaMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15, // bright yellow
    roughness: 0.4,
  });

  const tipMat = new THREE.MeshStandardMaterial({
    color: 0x65a30d, // green-yellow tip
    roughness: 0.6,
  });

  // Crown stem
  const crownGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.18, 8);
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x3f3521, roughness: 0.9 });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.set(0, 0.12, 0);
  crown.rotateZ(Math.PI / 2);
  bunch.add(crown);

  // 5 bananas arranged in a fan
  for (let i = 0; i < 5; i++) {
    const angle = (i - 2) * 0.26;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0.05, 0.02, 0.06),
      new THREE.Vector3(0.08, -0.15, 0.12),
      new THREE.Vector3(0.05, -0.3, 0.08),
      new THREE.Vector3(0, -0.36, 0.02),
    ]);

    const bananaGeo = new THREE.TubeGeometry(curve, 14, 0.038, 6, false);
    const banana = new THREE.Mesh(bananaGeo, bananaMat);
    banana.rotation.y = angle;
    banana.position.x = (i - 2) * 0.06;
    banana.castShadow = true;
    bunch.add(banana);

    // Dark tip
    const tipGeo = new THREE.SphereGeometry(0.015, 6, 6);
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.set(banana.position.x, -0.36, 0.02);
    bunch.add(tip);
  }

  return bunch;
}

/**
 * 8. Mandarins / Oranges 3D Mesh Builder
 */
export function createOrangeMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'orange';

  const orangeGeo = new THREE.SphereGeometry(0.12, 20, 16);
  orangeGeo.scale(1, 0.88, 1); // slight mandarin squashed sphere

  const orangeMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    roughness: 0.42,
    metalness: 0.06,
  });

  const mesh = new THREE.Mesh(orangeGeo, orangeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Small green leaf
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.025, 0.04, 0.01, 0.08);
  leafShape.quadraticCurveTo(-0.025, 0.04, 0, 0);

  const leafGeo = new THREE.ShapeGeometry(leafShape);
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    side: THREE.DoubleSide,
    roughness: 0.5,
  });
  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.position.set(0, 0.11, 0);
  leaf.rotation.set(-0.4, 0.5, 0.2);
  group.add(leaf);

  return group;
}

/**
 * 9. Papaya 3D Mesh Builder
 */
export function createPapayaMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'papaya';

  // Elongated pear shape
  const papayaGeo = new THREE.SphereGeometry(0.16, 20, 18);
  papayaGeo.scale(0.85, 1.6, 0.85);

  const pos = papayaGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    // Taper the top
    if (y > 0) {
      const taper = 1 - (y / 0.26) * 0.35;
      pos.setX(i, pos.getX(i) * taper);
      pos.setZ(i, pos.getZ(i) * taper);
    }
  }
  pos.needsUpdate = true;
  papayaGeo.computeVertexNormals();

  const papayaMat = new THREE.MeshStandardMaterial({
    color: 0xea580c, // deep orange-green skin
    roughness: 0.5,
    metalness: 0.05,
  });

  const mesh = new THREE.Mesh(papayaGeo, papayaMat);
  mesh.castShadow = true;
  group.add(mesh);

  return group;
}

/**
 * 10. Bok Choy Produce Bundle 3D Mesh Builder
 */
export function createBokChoyMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'bokchoy';

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // pale crisp jade white
    roughness: 0.4,
  });

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x166534, // deep jade green
    roughness: 0.6,
    side: THREE.DoubleSide,
  });

  // Bundle of 5 spoon-shaped stalks
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.14, 8);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.set(Math.cos(angle) * 0.03, 0.07, Math.sin(angle) * 0.03);
    stem.rotation.set(0.15, angle, 0);
    group.add(stem);

    // Leaf blade attached at top
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.06, 0.1, 0, 0.18);
    leafShape.quadraticCurveTo(-0.06, 0.1, 0, 0);

    const leafGeo = new THREE.ShapeGeometry(leafShape);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(Math.cos(angle) * 0.04, 0.13, Math.sin(angle) * 0.04);
    leaf.rotation.set(0.35, angle, 0);
    group.add(leaf);
  }

  return group;
}

/**
 * Helper to build any fruit by ID
 */
export function buildFruitModel(fruitId: string, sliced = false): THREE.Group {
  switch (fruitId) {
    case 'durian':
      return createDurianMesh(sliced);
    case 'dragonfruit':
      return createDragonfruitMesh(sliced);
    case 'watermelon':
      return createWatermelonMesh(sliced);
    case 'mango':
      return createMangoMesh();
    case 'pineapple':
      return createPineappleMesh();
    case 'mangosteen':
      return createMangosteenMesh(sliced);
    case 'bananas':
      return createBananasBunchMesh();
    case 'oranges':
      return createOrangeMesh();
    case 'papaya':
      return createPapayaMesh();
    case 'bokchoy':
      return createBokChoyMesh();
    default:
      return createOrangeMesh();
  }
}
