/**
 * Kowloon Wet Market 3D Scene Controller.
 * Manages Three.js WebGLRenderer, Scene, Camera choreography,
 * realistic lighting system, raycasting, interactive stalls, and fruit assets.
 */
import * as THREE from 'three';
import {
  createWetTileTexture,
  createWoodPlankTexture,
  createStoreSignTexture,
  createLuckyBannerTexture,
  createCardboardTexture,
  createWickerTexture,
  createMarketPosterTexture,
} from '../utils/proceduralTextures';
import { FRUIT_CATALOG, buildFruitModel } from './fruitAssets';

export interface MarketCameraPreset {
  name: string;
  label: string;
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export type LightingMode = 'dusk' | 'night' | 'day' | 'rain';

export interface InteractiveObjectInfo {
  type: 'fruit' | 'stall' | 'scale' | 'lamp';
  id: string;
  name: string;
  subtitle?: string;
  screenPos: { x: number; y: number };
}

export class MarketScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private animFrameId: number | null = null;

  // Camera animation
  private targetCamPos = new THREE.Vector3(0, 1.8, 5.5);
  private targetCamLook = new THREE.Vector3(0, 1.3, 0);
  private currentCamLook = new THREE.Vector3(0, 1.3, 0);
  private isFirstPerson = false;
  private fpMoveForward = false;
  private fpMoveBackward = false;
  private fpMoveLeft = false;
  private fpMoveRight = false;
  private fpYaw = 0;
  private fpPitch = 0;

  // Orbit dragging state
  private isPointerDown = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private orbitAzimuth = 0;
  private orbitPolar = Math.PI / 4;
  private orbitDistance = 6.5;
  private orbitCenter = new THREE.Vector3(0, 1.2, 0);

  // Lights & Atmosphere
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private ambientLight!: THREE.AmbientLight;
  private redLamps: { mesh: THREE.Group; light: THREE.PointLight; basePos: THREE.Vector3; phase: number }[] = [];
  private neonSignLight!: THREE.PointLight;
  private mistParticles!: THREE.Points;
  private floorMaterial!: THREE.MeshStandardMaterial;

  // Interactivity & Raycasting
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(-999, -999);
  private interactiveMeshes: THREE.Object3D[] = [];
  private hoveredObject: THREE.Object3D | null = null;

  // Callbacks to UI
  public onFruitSelect?: (fruitId: string) => void;
  public onHoverChange?: (info: InteractiveObjectInfo | null) => void;

  // Config parameters
  public lightingMode: LightingMode = 'dusk';
  public wetness = 0.85;
  public lampsSway = true;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initScene();
    this.initLighting();
    this.buildMarketArchitecture();
    this.buildGoodTasteGroceryStall();
    this.buildFruitStall();
    this.buildSeafoodStall();
    this.buildRoastStall();
    this.buildAtmosphericProps();
    this.setupEvents();
    this.applyLightingMode('dusk');
    this.startRenderLoop();
  }

  private initScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0f14);
    this.scene.fog = new THREE.FogExp2(0x0c0f14, 0.045);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 2.0, 6.2);
    this.targetCamPos.copy(this.camera.position);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);
  }

  private initLighting() {
    // 1. Ambient & Hemisphere
    this.ambientLight = new THREE.AmbientLight(0x2a2228, 0.6);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x4338ca, 0x1c1917, 0.5);
    this.scene.add(this.hemiLight);

    // 2. Sunlight / Moonlight directional key light
    this.dirLight = new THREE.DirectionalLight(0xffecd1, 1.2);
    this.dirLight.position.set(6, 12, 4);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 30;
    this.dirLight.shadow.camera.left = -9;
    this.dirLight.shadow.camera.right = 9;
    this.dirLight.shadow.camera.top = 9;
    this.dirLight.shadow.camera.bottom = -9;
    this.dirLight.shadow.bias = -0.0004;
    this.scene.add(this.dirLight);

    // 3. Neon sign point light
    this.neonSignLight = new THREE.PointLight(0xf43f5e, 2.5, 9, 1.8);
    this.neonSignLight.position.set(3.4, 3.2, -2.5);
    this.scene.add(this.neonSignLight);
  }

  /**
   * Builds the wet alley ground with puddles, raised curbs, and facade walls.
   */
  private buildMarketArchitecture() {
    // 1. Wet tiled floor with puddle roughness map
    const tileTextures = createWetTileTexture(this.wetness);
    tileTextures.diffuse.repeat.set(8, 16);
    tileTextures.roughness.repeat.set(8, 16);
    tileTextures.normal.repeat.set(8, 16);

    const floorGeo = new THREE.PlaneGeometry(16, 26);
    this.floorMaterial = new THREE.MeshStandardMaterial({
      map: tileTextures.diffuse,
      roughnessMap: tileTextures.roughness,
      normalMap: tileTextures.normal,
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughness: 0.25,
      metalness: 0.15,
    });

    const floor = new THREE.Mesh(floorGeo, this.floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Raised Sidewalk Curbs along left and right stall lines
    const curbGeo = new THREE.BoxGeometry(0.35, 0.16, 24);
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x474b50,
      roughness: 0.8,
    });

    // Left curb (Good taste grocery)
    const leftCurb = new THREE.Mesh(curbGeo, curbMat);
    leftCurb.position.set(-2.6, 0.08, 0);
    leftCurb.receiveShadow = true;
    this.scene.add(leftCurb);

    // Right curb (Fruit stall)
    const rightCurb = new THREE.Mesh(curbGeo, curbMat);
    rightCurb.position.set(2.6, 0.08, 0);
    rightCurb.receiveShadow = true;
    this.scene.add(rightCurb);

    // Raised sidewalk platforms for stalls
    const platGeo = new THREE.BoxGeometry(4.5, 0.15, 24);
    const platMat = new THREE.MeshStandardMaterial({
      color: 0x3e4147,
      roughness: 0.7,
    });
    const leftPlat = new THREE.Mesh(platGeo, platMat);
    leftPlat.position.set(-5.0, 0.075, 0);
    leftPlat.receiveShadow = true;
    this.scene.add(leftPlat);

    const rightPlat = new THREE.Mesh(platGeo, platMat);
    rightPlat.position.set(5.0, 0.075, 0);
    rightPlat.receiveShadow = true;
    this.scene.add(rightPlat);

    // 3. Drainage grates along the gutters
    const grateGeo = new THREE.BoxGeometry(0.28, 0.02, 0.8);
    const grateMat = new THREE.MeshStandardMaterial({
      color: 0x1f2225,
      roughness: 0.6,
      metalness: 0.8,
    });
    [-4, 0, 4].forEach(z => {
      const g1 = new THREE.Mesh(grateGeo, grateMat);
      g1.position.set(-2.3, 0.01, z);
      this.scene.add(g1);
      const g2 = new THREE.Mesh(grateGeo, grateMat);
      g2.position.set(2.3, 0.01, z);
      this.scene.add(g2);
    });

    // 4. Tenement building facade walls
    const wallGeo = new THREE.BoxGeometry(1, 8, 24);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x33363a,
      roughness: 0.95,
    });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-7.5, 4, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(7.5, 4, 0);
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);

    // End alley backdrop wall
    const backWallGeo = new THREE.BoxGeometry(16, 8, 1);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 4, -12);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Corrugated metal shop shutters on back wall (partially rolled up)
    const shutterGeo = new THREE.PlaneGeometry(3.6, 2.2);
    const shutterMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.7,
      roughness: 0.45,
    });
    const shutter = new THREE.Mesh(shutterGeo, shutterMat);
    shutter.position.set(-4.5, 2.2, 0.5);
    shutter.rotation.y = Math.PI / 2;
    this.scene.add(shutter);
  }

  /**
   * Central Stall 1: "Good Taste Grocery" (味友干菜鋪)
   * Exact homage to the reference image provided:
   * - Giant wooden tilted storefront signboard with Chinese calligraphy + English
   * - Hanging red conical lamps with localized warm light
   * - Hanging red "福" lucky diamond scrolls
   * - Hanging dried fish and cured sausages
   * - Wooden crates and cardboard boxes stacked on sidewalk
   * - Shelves of spices and apothecary jars
   */
  private buildGoodTasteGroceryStall() {
    const stallGroup = new THREE.Group();
    stallGroup.name = 'stall_good_taste';
    stallGroup.userData = {
      type: 'stall',
      id: 'good_taste_grocery',
      name: 'Good Taste Grocery (味友干菜鋪)',
      subtitle: 'Dried Goods, Herbal Spices & Preserves',
    };

    const woodDark = createWoodPlankTexture('dark');
    const woodHoney = createWoodPlankTexture('honey');

    // 1. Tilted Wooden Storefront Signboard (Central feature of reference image)
    const signTexture = createStoreSignTexture({
      chineseTitle: '味友干菜鋪',
      englishTitle: 'Good Taste Grocery',
      style: 'good_taste',
    });
    const signGeo = new THREE.BoxGeometry(4.2, 1.4, 0.12);
    const signMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x4a341e }),
      new THREE.MeshStandardMaterial({ color: 0x4a341e }),
      new THREE.MeshStandardMaterial({ color: 0x4a341e }),
      new THREE.MeshStandardMaterial({ color: 0x4a341e }),
      new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.6 }), // Front face
      new THREE.MeshStandardMaterial({ color: 0x4a341e }),
    ];
    const signMesh = new THREE.Mesh(signGeo, signMaterials);
    signMesh.position.set(-3.5, 3.3, 0.5);
    signMesh.rotation.set(-0.25, 0.22, 0.05); // tilted forward like the reference image!
    signMesh.castShadow = true;
    stallGroup.add(signMesh);

    // Sign support timber struts
    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x362312 });
    [-1.6, 1.6].forEach(x => {
      const strut = new THREE.Mesh(strutGeo, strutMat);
      strut.position.set(-3.5 + x, 3.8, 0.3);
      strut.rotation.x = 0.5;
      stallGroup.add(strut);
    });

    // 2. Hanging Red Lucky Diamond Scrolls ("福", "春", "吉") under the sign
    ['福', '春', '吉'].forEach((char, idx) => {
      const luckyTex = createLuckyBannerTexture(char);
      const bannerGeo = new THREE.PlaneGeometry(0.38, 0.38);
      const bannerMat = new THREE.MeshStandardMaterial({
        map: luckyTex,
        transparent: true,
        roughness: 0.5,
        side: THREE.DoubleSide,
      });
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.set(-4.5 + idx * 1.0, 2.35, 0.85);
      banner.rotation.y = 0.15;
      stallGroup.add(banner);
    });

    // 3. Wooden Stall Counter and Tiered Display Tables
    const counterGeo = new THREE.BoxGeometry(3.6, 0.85, 1.2);
    const counterMat = new THREE.MeshStandardMaterial({ map: woodDark, roughness: 0.7 });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(-3.8, 0.55, 0.5);
    counter.castShadow = true;
    counter.receiveShadow = true;
    stallGroup.add(counter);

    // Front low display table on pavement curb
    const lowTableGeo = new THREE.BoxGeometry(2.4, 0.45, 0.9);
    const lowTable = new THREE.Mesh(lowTableGeo, counterMat);
    lowTable.position.set(-2.8, 0.32, 1.6);
    lowTable.castShadow = true;
    lowTable.receiveShadow = true;
    stallGroup.add(lowTable);

    // 4. Stacked Woven Wicker Baskets with Dried Goods
    const wickerTex = createWickerTexture();
    const basketGeo = new THREE.CylinderGeometry(0.32, 0.26, 0.22, 14);
    const basketMat = new THREE.MeshStandardMaterial({ map: wickerTex, roughness: 0.75 });

    // Dried goods fillings
    const garlicMat = new THREE.MeshStandardMaterial({ color: 0xeee8d5, roughness: 0.5 });
    const chiliMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });
    const mushroomMat = new THREE.MeshStandardMaterial({ color: 0x443221, roughness: 0.9 });

    const basketItems = [
      { pos: new THREE.Vector3(-3.2, 0.62, 1.6), mat: chiliMat, label: 'Dried Sichuan Chilis' },
      { pos: new THREE.Vector3(-2.4, 0.62, 1.6), mat: garlicMat, label: 'Shandong Garlic Heads' },
      { pos: new THREE.Vector3(-4.6, 1.08, 0.4), mat: mushroomMat, label: 'Shiitake Black Mushrooms' },
      { pos: new THREE.Vector3(-3.9, 1.08, 0.4), mat: chiliMat, label: 'Sun-Dried Peppers' },
    ];

    basketItems.forEach(item => {
      const bMesh = new THREE.Mesh(basketGeo, basketMat);
      bMesh.position.copy(item.pos);
      bMesh.castShadow = true;
      stallGroup.add(bMesh);

      // Mound inside basket
      const moundGeo = new THREE.SphereGeometry(0.28, 12, 8);
      moundGeo.scale(1, 0.45, 1);
      const mound = new THREE.Mesh(moundGeo, item.mat);
      mound.position.set(item.pos.x, item.pos.y + 0.1, item.pos.z);
      mound.castShadow = true;
      stallGroup.add(mound);
    });

    // 5. Stacked Cardboard Shipping Boxes on Sidewalk (matching reference image!)
    const fruitBoxTex = createCardboardTexture('GOOD TASTE', 'PRODUCE');
    const boxMat = new THREE.MeshStandardMaterial({ map: fruitBoxTex, roughness: 0.85 });

    const boxConfigs = [
      { pos: [-2.1, 0.24, 0.2], rot: 0.05, s: [0.65, 0.35, 0.45] },
      { pos: [-2.1, 0.58, 0.2], rot: -0.08, s: [0.65, 0.35, 0.45] },
      { pos: [-2.1, 0.92, 0.22], rot: 0.12, s: [0.65, 0.35, 0.45] },
      { pos: [-2.0, 0.24, 2.7], rot: 0.2, s: [0.68, 0.36, 0.46] },
      { pos: [-2.0, 0.59, 2.68], rot: 0.1, s: [0.68, 0.36, 0.46] },
      { pos: [-2.6, 0.24, 2.9], rot: -0.15, s: [0.62, 0.34, 0.42] },
    ];

    boxConfigs.forEach(b => {
      const bGeo = new THREE.BoxGeometry(b.s[0], b.s[1], b.s[2]);
      const bMesh = new THREE.Mesh(bGeo, boxMat);
      bMesh.position.set(b.pos[0], b.pos[1], b.pos[2]);
      bMesh.rotation.y = b.rot;
      bMesh.castShadow = true;
      stallGroup.add(bMesh);
    });

    // 6. Hanging Dried Fish and Cured Sausages Rack (iconic Asian wet market prop)
    const rackBarGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.2, 8);
    const rackBar = new THREE.Mesh(rackBarGeo, counterMat);
    rackBar.position.set(-3.5, 2.2, 0.4);
    rackBar.rotateZ(Math.PI / 2);
    stallGroup.add(rackBar);

    // Hanging fish
    const fishGeo = new THREE.ConeGeometry(0.06, 0.38, 4);
    fishGeo.scale(0.4, 1, 1);
    const fishMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.5, metalness: 0.2 });

    for (let f = 0; f < 6; f++) {
      const x = -4.3 + f * 0.32;
      const fish = new THREE.Mesh(fishGeo, fishMat);
      fish.position.set(x, 1.85, 0.4);
      fish.rotation.z = Math.PI; // upside down hanging
      fish.castShadow = true;
      stallGroup.add(fish);

      // String line
      const stringGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.2, 4);
      const str = new THREE.Mesh(stringGeo, counterMat);
      str.position.set(x, 2.1, 0.4);
      stallGroup.add(str);
    }

    // 7. Shelving unit with glass jars on back wall
    const shelfGeo = new THREE.BoxGeometry(3.2, 0.06, 0.35);
    const jarGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 10);
    const jarMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 1,
      roughness: 0.15,
      ior: 1.5,
    });
    const lidMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });

    [1.4, 1.9].forEach(y => {
      const shelf = new THREE.Mesh(shelfGeo, counterMat);
      shelf.position.set(-5.0, y, 0.5);
      stallGroup.add(shelf);

      for (let j = 0; j < 8; j++) {
        const jMesh = new THREE.Mesh(jarGeo, jarMat);
        jMesh.position.set(-6.1 + j * 0.32, y + 0.12, 0.5);
        stallGroup.add(jMesh);

        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 10), lidMat);
        lid.position.set(-6.1 + j * 0.32, y + 0.24, 0.5);
        stallGroup.add(lid);
      }
    });

    // 8. Iconic Hanging Red Conical Market Lamps (2 lamps over Good Taste Grocery)
    this.createHangingMarketLamp(new THREE.Vector3(-4.2, 2.7, 1.1), stallGroup);
    this.createHangingMarketLamp(new THREE.Vector3(-2.8, 2.6, 1.4), stallGroup);

    this.scene.add(stallGroup);
    this.interactiveMeshes.push(stallGroup);
  }

  /**
   * Stall 2: "Golden Orchard Fresh Fruits" (金園鮮果行)
   * The primary interactive produce pavilion with rich 3D fruit assets.
   */
  private buildFruitStall() {
    const stallGroup = new THREE.Group();
    stallGroup.name = 'stall_fruits';
    stallGroup.userData = {
      type: 'stall',
      id: 'golden_fruit_orchard',
      name: 'Golden Orchard Fresh Fruits (金園鮮果行)',
      subtitle: 'Premium Tropical & Subtropical Produce',
    };

    const woodHoney = createWoodPlankTexture('honey');
    const woodDark = createWoodPlankTexture('dark');

    // 1. Awning with striped canvas canopy
    const signTexture = createStoreSignTexture({
      chineseTitle: '金園鮮果行',
      englishTitle: 'Golden Orchard Fresh Fruits',
      style: 'golden_fruit',
    });
    const signGeo = new THREE.BoxGeometry(4.6, 1.2, 0.1);
    const signMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x103926 }),
      new THREE.MeshStandardMaterial({ color: 0x103926 }),
      new THREE.MeshStandardMaterial({ color: 0x103926 }),
      new THREE.MeshStandardMaterial({ color: 0x103926 }),
      new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0x103926 }),
    ];
    const signMesh = new THREE.Mesh(signGeo, signMaterials);
    signMesh.position.set(3.6, 3.4, 0.6);
    signMesh.rotation.set(-0.2, -0.18, 0.02);
    signMesh.castShadow = true;
    stallGroup.add(signMesh);

    // Green market awning roof extending forward
    const awningGeo = new THREE.PlaneGeometry(4.8, 2.4);
    const awningMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(3.8, 3.1, 1.4);
    awning.rotation.set(Math.PI / 2.8, -0.1, 0);
    stallGroup.add(awning);

    // 2. Multi-tier Fruit Display Stand (stepped wooden risers)
    const tiers = 3;
    const riserW = 4.4;
    const riserD = 0.55;
    const riserH = 0.28;

    for (let t = 0; t < tiers; t++) {
      const riserGeo = new THREE.BoxGeometry(riserW, riserH, riserD);
      const riser = new THREE.Mesh(riserGeo, new THREE.MeshStandardMaterial({ map: woodHoney, roughness: 0.7 }));
      riser.position.set(3.8, 0.4 + t * 0.28, 0.4 - t * 0.45);
      riser.castShadow = true;
      riser.receiveShadow = true;
      stallGroup.add(riser);
    }

    // Front Produce Bins along sidewalk
    const crateGeo = new THREE.BoxGeometry(0.85, 0.22, 0.65);
    const wickerTex = createWickerTexture();
    const crateMat = new THREE.MeshStandardMaterial({ map: wickerTex, roughness: 0.8 });

    // Place Fruits onto the tiers & crates
    this.populateFruitsOnStall(stallGroup);

    // 3. Vintage Brass Hanging Scale (Iconic wet market mechanical scale)
    this.createHangingScale(new THREE.Vector3(2.5, 2.3, 1.2), stallGroup);

    // 4. Iconic Hanging Red Conical Market Lamps (3 lamps illuminating the fruit displays)
    this.createHangingMarketLamp(new THREE.Vector3(2.5, 2.5, 0.8), stallGroup);
    this.createHangingMarketLamp(new THREE.Vector3(3.8, 2.5, 0.8), stallGroup);
    this.createHangingMarketLamp(new THREE.Vector3(5.1, 2.5, 0.8), stallGroup);

    // 5. Retro Wall Poster on the side pillar
    const posterTex = createMarketPosterTexture();
    const posterGeo = new THREE.PlaneGeometry(0.8, 1.2);
    const posterMat = new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.6 });
    const poster = new THREE.Mesh(posterGeo, posterMat);
    poster.position.set(5.9, 1.8, 1.9);
    poster.rotation.y = -Math.PI / 2;
    stallGroup.add(poster);

    this.scene.add(stallGroup);
    this.interactiveMeshes.push(stallGroup);
  }

  /**
   * Places interactive 3D fruit models into baskets and crates on the fruit stall.
   */
  private populateFruitsOnStall(parent: THREE.Group) {
    const fruitPlacements = [
      // Tier 1 (Lowest & closest to customer)
      { id: 'durian', x: 2.3, y: 0.65, z: 0.4, scale: 0.85, sliced: true },
      { id: 'watermelon', x: 3.3, y: 0.65, z: 0.4, scale: 0.85, sliced: true },
      { id: 'pineapple', x: 4.3, y: 0.68, z: 0.4, scale: 0.9, sliced: false },
      { id: 'papaya', x: 5.2, y: 0.64, z: 0.4, scale: 0.85, sliced: false },

      // Tier 2 (Middle)
      { id: 'dragonfruit', x: 2.3, y: 0.95, z: -0.05, scale: 0.85, sliced: true },
      { id: 'mango', x: 3.2, y: 0.92, z: -0.05, scale: 0.95, sliced: false },
      { id: 'bananas', x: 4.1, y: 0.98, z: -0.05, scale: 0.9, sliced: false },
      { id: 'mangosteen', x: 5.0, y: 0.92, z: -0.05, scale: 1.05, sliced: true },

      // Tier 3 (Highest tier & side crates)
      { id: 'oranges', x: 2.8, y: 1.22, z: -0.5, scale: 0.95, sliced: false },
      { id: 'bokchoy', x: 4.4, y: 1.22, z: -0.5, scale: 0.95, sliced: false },
    ];

    const basketGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.18, 14);
    const wickerTex = createWickerTexture();
    const basketMat = new THREE.MeshStandardMaterial({ map: wickerTex, roughness: 0.8 });

    fruitPlacements.forEach(fp => {
      const data = FRUIT_CATALOG[fp.id];
      if (!data) return;

      // Basket beneath fruit
      const basket = new THREE.Mesh(basketGeo, basketMat);
      basket.position.set(fp.x, fp.y - 0.1, fp.z);
      basket.castShadow = true;
      parent.add(basket);

      // Fruit 3D model
      const fruitGroup = buildFruitModel(fp.id, fp.sliced);
      fruitGroup.name = `fruit_${fp.id}`;
      fruitGroup.position.set(fp.x, fp.y, fp.z);
      fruitGroup.scale.setScalar(fp.scale);
      fruitGroup.userData = {
        type: 'fruit',
        id: fp.id,
        name: `${data.nameChinese} (${data.nameEnglish})`,
        subtitle: `HK$ ${data.priceHkd} / ${data.unit} · ${data.ripeness}`,
      };

      // Add clickable bounding collider
      const colliderGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const colliderMat = new THREE.MeshBasicMaterial({ visible: false });
      const collider = new THREE.Mesh(colliderGeo, colliderMat);
      collider.userData = fruitGroup.userData;
      fruitGroup.add(collider);

      parent.add(fruitGroup);
      this.interactiveMeshes.push(collider);
    });
  }

  /**
   * Stall 3: "Dragon Wharf Live Seafood" (龍門活海鮮)
   * Crushed ice counter, live seafood aquarium, and stainless steel trays.
   */
  private buildSeafoodStall() {
    const stallGroup = new THREE.Group();
    stallGroup.name = 'stall_seafood';
    stallGroup.position.set(-3.8, 0, -5.5);
    stallGroup.userData = {
      type: 'stall',
      id: 'dragon_seafood',
      name: 'Dragon Wharf Live Seafood (龍門活海鮮)',
      subtitle: 'Live Fish, Wild Mud Crabs & Blue Prawns',
    };

    const signTexture = createStoreSignTexture({
      chineseTitle: '龍門活海鮮',
      englishTitle: 'Dragon Wharf Live Seafood',
      style: 'dragon_seafood',
    });
    const signGeo = new THREE.BoxGeometry(4.0, 1.1, 0.1);
    const signMesh = new THREE.Mesh(signGeo, [
      new THREE.MeshStandardMaterial({ color: 0x0f2942 }),
      new THREE.MeshStandardMaterial({ color: 0x0f2942 }),
      new THREE.MeshStandardMaterial({ color: 0x0f2942 }),
      new THREE.MeshStandardMaterial({ color: 0x0f2942 }),
      new THREE.MeshStandardMaterial({ map: signTexture }),
      new THREE.MeshStandardMaterial({ color: 0x0f2942 }),
    ]);
    signMesh.position.set(0.2, 3.2, 0.8);
    signMesh.rotation.set(-0.15, 0.15, 0);
    stallGroup.add(signMesh);

    // Stainless steel counter
    const counterGeo = new THREE.BoxGeometry(3.6, 0.85, 1.4);
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
    });
    const counter = new THREE.Mesh(counterGeo, steelMat);
    counter.position.set(0, 0.55, 0.5);
    counter.castShadow = true;
    stallGroup.add(counter);

    // Crushed ice bed (sparkling translucent white ice)
    const iceGeo = new THREE.BoxGeometry(3.4, 0.1, 1.2);
    const iceMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.7,
      roughness: 0.1,
      ior: 1.31,
    });
    const ice = new THREE.Mesh(iceGeo, iceMat);
    ice.position.set(0, 1.02, 0.5);
    stallGroup.add(ice);

    // Live Fish Aquarium Tank on back counter
    const tankGeo = new THREE.BoxGeometry(1.6, 0.9, 0.6);
    const tankMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.85,
      roughness: 0.05,
      ior: 1.33,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(-0.8, 1.5, -0.1);
    stallGroup.add(tank);

    // Aquarium aerator bubbling light
    const aquaLight = new THREE.PointLight(0x38bdf8, 1.8, 3.5);
    aquaLight.position.set(-0.8, 1.6, 0.1);
    stallGroup.add(aquaLight);

    // Hanging red market lamp over seafood
    this.createHangingMarketLamp(new THREE.Vector3(-3.8, 2.5, -4.8), stallGroup);

    this.scene.add(stallGroup);
    this.interactiveMeshes.push(stallGroup);
  }

  /**
   * Stall 4: "Sun Kee Roast & Tea" (新記燒味)
   * Glass roast display and vertical glowing neon sign!
   */
  private buildRoastStall() {
    const stallGroup = new THREE.Group();
    stallGroup.name = 'stall_roast';
    stallGroup.position.set(3.8, 0, -5.5);
    stallGroup.userData = {
      type: 'stall',
      id: 'sun_kee_roast',
      name: 'Sun Kee Roast & Delicacies (新記燒臘茶檔)',
      subtitle: 'Crispy Pork Belly, Char Siu & Herbal Milk Tea',
    };

    const signTexture = createStoreSignTexture({
      chineseTitle: '新記燒味',
      englishTitle: 'Sun Kee Roast & Tea',
      style: 'sun_kee_roast',
    });
    const signGeo = new THREE.BoxGeometry(3.8, 1.1, 0.1);
    const signMesh = new THREE.Mesh(signGeo, [
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d }),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d }),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d }),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d }),
      new THREE.MeshStandardMaterial({ map: signTexture }),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d }),
    ]);
    signMesh.position.set(-0.2, 3.2, 0.8);
    signMesh.rotation.set(-0.15, -0.15, 0);
    stallGroup.add(signMesh);

    // Vertical Neon Sign bracket extending into alley
    const neonGeo = new THREE.BoxGeometry(0.35, 2.2, 0.1);
    const neonMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });
    const neon = new THREE.Mesh(neonGeo, neonMat);
    neon.position.set(-1.6, 2.6, 1.2);
    stallGroup.add(neon);

    // Roast glass showcase with warm golden heat lamp
    const caseGeo = new THREE.BoxGeometry(2.2, 1.4, 0.8);
    const caseMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      roughness: 0.05,
      ior: 1.45,
    });
    const showcase = new THREE.Mesh(caseGeo, caseMat);
    showcase.position.set(0, 1.4, 0.4);
    stallGroup.add(showcase);

    // Warm infrared heat lamp glow inside roast case
    const roastLight = new THREE.PointLight(0xf59e0b, 2.2, 4);
    roastLight.position.set(0, 1.8, 0.4);
    stallGroup.add(roastLight);

    this.scene.add(stallGroup);
    this.interactiveMeshes.push(stallGroup);
  }

  /**
   * Iconic Hanging Red Market Conical Lamp.
   * Features a suspended black cord, brass socket, bright crimson conical shade,
   * warm 2700K point light casting soft pool of light on produce, and gentle physics sway!
   */
  public createHangingMarketLamp(pos: THREE.Vector3, parent: THREE.Object3D = this.scene): THREE.Group {
    const lampGroup = new THREE.Group();
    lampGroup.position.copy(pos);

    // Black electrical cord dropping from ceiling
    const cordGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.2, 6);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9 });
    const cord = new THREE.Mesh(cordGeo, cordMat);
    cord.position.set(0, 0.6, 0);
    lampGroup.add(cord);

    // Brass socket connector
    const socketGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.05, 10);
    const socketMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.3 });
    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.position.set(0, 0.02, 0);
    lampGroup.add(socket);

    // Iconic Red Conical Plastic Shade (bell shape)
    const shadeGeo = new THREE.ConeGeometry(0.24, 0.22, 20, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // bright wet market red
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.set(0, -0.06, 0);
    shade.castShadow = true;
    lampGroup.add(shade);

    // Glowing incandescent bulb
    const bulbGeo = new THREE.SphereGeometry(0.045, 12, 10);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xfef08a,
      emissiveIntensity: 1.8,
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, -0.08, 0);
    lampGroup.add(bulb);

    // Warm localized PointLight casting dramatic downward light
    const light = new THREE.PointLight(0xffaa44, 2.2, 5.5, 1.6);
    light.position.set(0, -0.15, 0);
    light.castShadow = true;
    light.shadow.bias = -0.002;
    lampGroup.add(light);

    parent.add(lampGroup);

    this.redLamps.push({
      mesh: lampGroup,
      light,
      basePos: pos.clone(),
      phase: Math.random() * Math.PI * 2,
    });

    return lampGroup;
  }

  /**
   * Vintage Brass Hanging Market Dial Scale.
   * With dial face, pointer needle, suspension chains, and round fruit weighing pan.
   */
  private createHangingScale(pos: THREE.Vector3, parent: THREE.Group): THREE.Group {
    const scaleGroup = new THREE.Group();
    scaleGroup.name = 'scale_hanging';
    scaleGroup.position.copy(pos);
    scaleGroup.userData = {
      type: 'scale',
      id: 'market_scale',
      name: 'Dial Spring Produce Scale (街市彈簧秤)',
      subtitle: 'Accurate in Catties (斤) & Kilograms',
    };

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
    });

    // Top suspension hook
    const hookGeo = new THREE.TorusGeometry(0.04, 0.008, 8, 16, Math.PI * 1.5);
    const hook = new THREE.Mesh(hookGeo, brassMat);
    hook.position.set(0, 0.45, 0);
    scaleGroup.add(hook);

    // Circular Dial Gauge Body
    const dialBodyGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 24);
    const dialBody = new THREE.Mesh(dialBodyGeo, brassMat);
    dialBody.rotateX(Math.PI / 2);
    dialBody.position.set(0, 0.22, 0);
    scaleGroup.add(dialBody);

    // Dial face canvas (white face with calibration marks)
    const dCanvas = document.createElement('canvas');
    dCanvas.width = 256;
    dCanvas.height = 256;
    const dCtx = dCanvas.getContext('2d')!;
    dCtx.fillStyle = '#f8fafc';
    dCtx.beginPath();
    dCtx.arc(128, 128, 120, 0, Math.PI * 2);
    dCtx.fill();
    dCtx.strokeStyle = '#1e293b';
    dCtx.lineWidth = 6;
    dCtx.stroke();

    // Scale tick marks
    for (let a = 0; a < 360; a += 15) {
      const rad = (a * Math.PI) / 180;
      const x1 = 128 + Math.cos(rad) * 95;
      const y1 = 128 + Math.sin(rad) * 95;
      const x2 = 128 + Math.cos(rad) * (a % 45 === 0 ? 80 : 88);
      const y2 = 128 + Math.sin(rad) * (a % 45 === 0 ? 80 : 88);
      dCtx.beginPath();
      dCtx.moveTo(x1, y1);
      dCtx.lineTo(x2, y2);
      dCtx.stroke();
    }
    // Red pointer needle
    dCtx.strokeStyle = '#dc2626';
    dCtx.lineWidth = 4;
    dCtx.beginPath();
    dCtx.moveTo(128, 128);
    dCtx.lineTo(128, 48);
    dCtx.stroke();

    const dialTex = new THREE.CanvasTexture(dCanvas);
    const faceGeo = new THREE.CircleGeometry(0.19, 24);
    const faceMat = new THREE.MeshBasicMaterial({ map: dialTex });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.set(0, 0.22, 0.035);
    scaleGroup.add(face);

    // Three suspension brass chains down to pan
    const chainMat = new THREE.MeshStandardMaterial({ color: 0x92400e, metalness: 0.8 });
    for (let c = 0; c < 3; c++) {
      const angle = (c * Math.PI * 2) / 3;
      const chainGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.42, 4);
      const chain = new THREE.Mesh(chainGeo, chainMat);
      chain.position.set(Math.cos(angle) * 0.12, -0.05, Math.sin(angle) * 0.12);
      chain.rotation.set(0.12 * Math.sin(angle), 0, -0.12 * Math.cos(angle));
      scaleGroup.add(chain);
    }

    // Round fruit weighing pan (shallow curved disc)
    const panGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.04, 20);
    const pan = new THREE.Mesh(panGeo, brassMat);
    pan.position.set(0, -0.28, 0);
    pan.castShadow = true;
    scaleGroup.add(pan);

    // Sample mango on the scale
    const sampleFruit = buildFruitModel('mango', false);
    sampleFruit.scale.setScalar(0.7);
    sampleFruit.position.set(0, -0.25, 0);
    scaleGroup.add(sampleFruit);

    // Collider
    const colliderGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.7, 8);
    const col = new THREE.Mesh(colliderGeo, new THREE.MeshBasicMaterial({ visible: false }));
    col.userData = scaleGroup.userData;
    scaleGroup.add(col);

    parent.add(scaleGroup);
    this.interactiveMeshes.push(col);

    return scaleGroup;
  }

  /**
   * Tangled overhead electrical wires and atmospheric mist particles.
   */
  private buildAtmosphericProps() {
    // 1. Overhead tangled cables stretching across alley
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x111317 });
    for (let i = 0; i < 7; i++) {
      const z = -6 + i * 2.2;
      const sag = 0.3 + Math.random() * 0.4;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6.8, 4.2 + (Math.random() - 0.5) * 0.4, z),
        new THREE.Vector3(0, 3.6 - sag, z + (Math.random() - 0.5) * 0.5),
        new THREE.Vector3(6.8, 4.2 + (Math.random() - 0.5) * 0.4, z),
      ]);
      const cableGeo = new THREE.TubeGeometry(curve, 20, 0.012, 4, false);
      const cable = new THREE.Mesh(cableGeo, cableMat);
      this.scene.add(cable);
    }

    // 2. Rising steam / mist particles near ice & drains
    const pCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 8;
      pPos[i * 3 + 1] = Math.random() * 2.8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    // Particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(32, 32, 4, 32, 32, 30);
    pGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
    pGrad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const pTex = new THREE.CanvasTexture(pCanvas);

    const pMat = new THREE.PointsMaterial({
      size: 0.6,
      map: pTex,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.mistParticles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.mistParticles);
  }

  /**
   * Applies lighting moods: Dusk, Night Market Neon, Day, Rainy Wet
   */
  public applyLightingMode(mode: LightingMode) {
    this.lightingMode = mode;

    switch (mode) {
      case 'dusk':
        this.scene.background = new THREE.Color(0x0c0f16);
        this.scene.fog = new THREE.FogExp2(0x0c0f16, 0.04);
        this.ambientLight.color.setHex(0x282024);
        this.ambientLight.intensity = 0.7;
        this.hemiLight.color.setHex(0x3730a3);
        this.hemiLight.groundColor.setHex(0x1c1917);
        this.dirLight.color.setHex(0xfb923c); // warm amber golden hour
        this.dirLight.intensity = 1.4;
        this.dirLight.position.set(6, 9, 3);
        this.neonSignLight.intensity = 2.4;
        this.redLamps.forEach(l => (l.light.intensity = 2.2));
        break;

      case 'night':
        this.scene.background = new THREE.Color(0x040608);
        this.scene.fog = new THREE.FogExp2(0x040608, 0.05);
        this.ambientLight.color.setHex(0x111317);
        this.ambientLight.intensity = 0.35;
        this.hemiLight.color.setHex(0x1e1b4b);
        this.hemiLight.groundColor.setHex(0x09090b);
        this.dirLight.color.setHex(0x38bdf8); // cool moon rim
        this.dirLight.intensity = 0.4;
        this.dirLight.position.set(-5, 10, -4);
        this.neonSignLight.intensity = 4.2;
        this.redLamps.forEach(l => (l.light.intensity = 3.0));
        break;

      case 'day':
        this.scene.background = new THREE.Color(0x475569);
        this.scene.fog = new THREE.FogExp2(0x475569, 0.025);
        this.ambientLight.color.setHex(0x64748b);
        this.ambientLight.intensity = 1.2;
        this.hemiLight.color.setHex(0xbae6fd);
        this.hemiLight.groundColor.setHex(0x334155);
        this.dirLight.color.setHex(0xffffff);
        this.dirLight.intensity = 2.4;
        this.dirLight.position.set(4, 14, 2);
        this.neonSignLight.intensity = 0.8;
        this.redLamps.forEach(l => (l.light.intensity = 1.2));
        break;

      case 'rain':
        this.scene.background = new THREE.Color(0x080b10);
        this.scene.fog = new THREE.FogExp2(0x080b10, 0.06);
        this.ambientLight.color.setHex(0x1e293b);
        this.ambientLight.intensity = 0.5;
        this.hemiLight.color.setHex(0x0284c7);
        this.hemiLight.groundColor.setHex(0x0f172a);
        this.dirLight.color.setHex(0x60a5fa);
        this.dirLight.intensity = 0.6;
        this.neonSignLight.intensity = 3.6;
        this.redLamps.forEach(l => (l.light.intensity = 2.6));
        break;
    }
  }

  /**
   * Sets puddle wetness and updates floor specular reflection
   */
  public setWetness(val: number) {
    this.wetness = val;
    const tileTextures = createWetTileTexture(val);
    this.floorMaterial.map = tileTextures.diffuse;
    this.floorMaterial.roughnessMap = tileTextures.roughness;
    this.floorMaterial.roughness = Math.max(0.1, 0.6 - val * 0.45);
    this.floorMaterial.needsUpdate = true;
  }

  /**
   * Smooth camera presets
   */
  public goToPreset(presetName: 'overview' | 'good_taste' | 'fruits' | 'seafood' | 'scale') {
    this.isFirstPerson = false;
    switch (presetName) {
      case 'overview':
        this.targetCamPos.set(0, 2.0, 5.8);
        this.targetCamLook.set(0, 1.3, 0);
        break;
      case 'good_taste':
        this.targetCamPos.set(-2.2, 1.6, 2.8);
        this.targetCamLook.set(-3.6, 1.4, 0.8);
        break;
      case 'fruits':
        this.targetCamPos.set(2.4, 1.6, 2.2);
        this.targetCamLook.set(3.6, 1.1, 0.2);
        break;
      case 'seafood':
        this.targetCamPos.set(-2.0, 1.6, -3.8);
        this.targetCamLook.set(-3.5, 1.2, -5.2);
        break;
      case 'scale':
        this.targetCamPos.set(2.1, 2.1, 1.8);
        this.targetCamLook.set(2.5, 2.2, 1.2);
        break;
    }
  }

  /**
   * Focus camera directly on a specific fruit
   */
  public focusFruit(fruitId: string) {
    const fruitObj = this.scene.getObjectByName(`fruit_${fruitId}`);
    if (fruitObj) {
      const worldPos = new THREE.Vector3();
      fruitObj.getWorldPosition(worldPos);

      this.targetCamLook.copy(worldPos);
      this.targetCamPos.set(worldPos.x - 0.6, worldPos.y + 0.4, worldPos.z + 0.9);
      this.isFirstPerson = false;
    }
  }

  public setFirstPersonMode(enabled: boolean) {
    this.isFirstPerson = enabled;
  }

  public getFirstPersonMode(): boolean {
    return this.isFirstPerson;
  }

  private setupEvents() {
    const el = this.renderer.domElement;

    // Resize
    window.addEventListener('resize', this.onResize);

    // Pointer events for Orbit & Raycast
    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: true });
    el.addEventListener('click', this.onClick);

    // Keyboard for first-person walking
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private onPointerDown = (e: PointerEvent) => {
    this.isPointerDown = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (this.isPointerDown) {
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      if (this.isFirstPerson) {
        this.fpYaw -= dx * 0.003;
        this.fpPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.fpPitch - dy * 0.003));
      } else {
        // Orbit pan
        this.targetCamPos.x -= dx * 0.006;
        this.targetCamPos.y = Math.max(0.6, Math.min(4.5, this.targetCamPos.y + dy * 0.006));
        this.targetCamLook.x -= dx * 0.004;
      }
    }
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    if (this.isFirstPerson) return;
    const zoomDelta = e.deltaY * 0.004;
    const dir = new THREE.Vector3().subVectors(this.targetCamPos, this.targetCamLook).normalize();
    const currentDist = this.targetCamPos.distanceTo(this.targetCamLook);
    const newDist = Math.max(1.0, Math.min(12.0, currentDist + zoomDelta));
    this.targetCamPos.copy(this.targetCamLook).addScaledVector(dir, newDist);
  };

  private onClick = (e: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, true);

    if (intersects.length > 0) {
      let target: THREE.Object3D | null = intersects[0].object;
      while (target && !target.userData?.type && target.parent) {
        target = target.parent;
      }
      if (target && target.userData) {
        if (target.userData.type === 'fruit') {
          if (this.onFruitSelect) this.onFruitSelect(target.userData.id);
        } else if (target.userData.type === 'stall') {
          // Focus stall viewpoint
          if (target.userData.id === 'good_taste_grocery') this.goToPreset('good_taste');
          else if (target.userData.id === 'golden_fruit_orchard') this.goToPreset('fruits');
          else if (target.userData.id === 'dragon_seafood') this.goToPreset('seafood');
        } else if (target.userData.type === 'scale') {
          this.goToPreset('scale');
        }
      }
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.fpMoveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.fpMoveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.fpMoveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.fpMoveRight = true;
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.fpMoveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.fpMoveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.fpMoveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.fpMoveRight = false;
        break;
    }
  };

  /**
   * Main animation and render loop
   */
  private startRenderLoop() {
    const render = () => {
      this.animFrameId = requestAnimationFrame(render);
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();

      // 1. Lamp sway physics
      if (this.lampsSway) {
        this.redLamps.forEach(lamp => {
          const swayX = Math.sin(elapsed * 1.5 + lamp.phase) * 0.05;
          const swayZ = Math.cos(elapsed * 1.2 + lamp.phase) * 0.03;
          lamp.mesh.rotation.set(swayZ, 0, swayX);
        });
      }

      // 2. Rising mist particle movement
      if (this.mistParticles) {
        const pos = this.mistParticles.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + delta * 0.35;
          if (y > 3.0) y = 0.1;
          pos.setY(i, y);
        }
        pos.needsUpdate = true;
      }

      // 3. Subtle neon sign flicker
      if (this.neonSignLight && this.lightingMode !== 'day') {
        const flicker = Math.sin(elapsed * 30) > 0.97 ? 0.4 : 1.0;
        this.neonSignLight.intensity = (this.lightingMode === 'night' ? 4.2 : 2.4) * flicker;
      }

      // 4. Camera choreography
      if (this.isFirstPerson) {
        const moveSpeed = delta * 3.5;
        const forward = new THREE.Vector3(-Math.sin(this.fpYaw), 0, -Math.cos(this.fpYaw));
        const right = new THREE.Vector3(Math.cos(this.fpYaw), 0, -Math.sin(this.fpYaw));

        if (this.fpMoveForward) this.camera.position.addScaledVector(forward, moveSpeed);
        if (this.fpMoveBackward) this.camera.position.addScaledVector(forward, -moveSpeed);
        if (this.fpMoveRight) this.camera.position.addScaledVector(right, moveSpeed);
        if (this.fpMoveLeft) this.camera.position.addScaledVector(right, -moveSpeed);

        // Alley boundaries
        this.camera.position.x = Math.max(-2.2, Math.min(2.2, this.camera.position.x));
        this.camera.position.z = Math.max(-10, Math.min(8, this.camera.position.z));
        this.camera.position.y = 1.7; // eye height

        const lookTarget = new THREE.Vector3(
          this.camera.position.x - Math.sin(this.fpYaw) * Math.cos(this.fpPitch),
          this.camera.position.y + Math.sin(this.fpPitch),
          this.camera.position.z - Math.cos(this.fpYaw) * Math.cos(this.fpPitch)
        );
        this.camera.lookAt(lookTarget);
      } else {
        // Smooth lerp to preset target
        this.camera.position.lerp(this.targetCamPos, 0.06);
        this.currentCamLook.lerp(this.targetCamLook, 0.06);
        this.camera.lookAt(this.currentCamLook);
      }

      // 5. Raycasting for hover feedback
      this.checkHover();

      this.renderer.render(this.scene, this.camera);
    };

    render();
  }

  private checkHover() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, true);

    if (intersects.length > 0) {
      let target: THREE.Object3D | null = intersects[0].object;
      while (target && !target.userData?.type && target.parent) {
        target = target.parent;
      }

      if (target && target.userData) {
        this.hoveredObject = target;
        this.renderer.domElement.style.cursor = 'pointer';

        // Project 3D position to 2D screen coordinate for tooltip
        const worldPos = new THREE.Vector3();
        target.getWorldPosition(worldPos);
        worldPos.project(this.camera);

        const rect = this.renderer.domElement.getBoundingClientRect();
        const screenX = ((worldPos.x + 1) * rect.width) / 2;
        const screenY = ((-worldPos.y + 1) * rect.height) / 2;

        if (this.onHoverChange) {
          this.onHoverChange({
            type: target.userData.type,
            id: target.userData.id,
            name: target.userData.name,
            subtitle: target.userData.subtitle,
            screenPos: { x: screenX, y: screenY },
          });
        }
        return;
      }
    }

    if (this.hoveredObject) {
      this.hoveredObject = null;
      this.renderer.domElement.style.cursor = 'default';
      if (this.onHoverChange) this.onHoverChange(null);
    }
  }

  public dispose() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.dispose();
  }
}
