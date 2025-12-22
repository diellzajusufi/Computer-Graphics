import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ==============================
// SCENE / CAMERA / RENDERER
// ==============================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0d8ef);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(60, 40, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

document.body.appendChild(renderer.domElement);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 5, 0);

// ==============================
// LIGHTS
// ==============================
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
scene.add(hemiLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 100, 50);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.left = -120;
sun.shadow.camera.right = 120;
sun.shadow.camera.top = 120;
sun.shadow.camera.bottom = -120;
sun.shadow.radius = 6;
scene.add(sun);

// ==============================
// SUN DIRECTION VISUAL (Arrow + Line)
// ==============================
const origin = new THREE.Vector3(0, 0, 0);
let dir = new THREE.Vector3().subVectors(origin, sun.position).normalize();

const arrowHelper = new THREE.ArrowHelper(
  dir,
  sun.position,
  120,
  0xffff00,
  5,
  3
);
scene.add(arrowHelper);

const lineGeom = new THREE.BufferGeometry().setFromPoints([
  sun.position.clone(),
  origin.clone(),
]);
const lineMat = new THREE.LineBasicMaterial({ color: 0xffff00 });
const line = new THREE.Line(lineGeom, lineMat);
scene.add(line);

// ==============================
// TEXTURES
// ==============================
const texLoader = new THREE.TextureLoader();

function loadTexture(path, repX = 1, repY = 1) {
  const t = texLoader.load(path);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repX, repY);
  t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return t;
}

// (Sipas strukturës tënde aktuale)
const grassTex = loadTexture("./assets/textures/grass.jpg", 10, 10);
const roadTex = loadTexture("./assets/textures/road.jpg", 6, 1);
const brickTex = loadTexture("./assets/textures/brick.jpg", 2, 1);
const concreteTex = loadTexture("./assets/textures/concrete.jpg", 2, 1);

// ==============================
// OBJECT LISTS (for click/hover)
// ==============================
const selectableMeshes = [];

// helper: add mesh to selectable list
function makeSelectable(mesh) {
  if (!mesh || !mesh.isMesh) return;
  selectableMeshes.push(mesh);

  // keep original color for toggling
  if (mesh.material && mesh.material.color) {
    mesh.userData.originalColor = mesh.material.color.clone();
    mesh.userData.colorToggled = false;
  }
}

// helper: make sure emissive exists (for hover)
function ensureEmissive(material) {
  if (!material) return;
  // MeshStandardMaterial / MeshPhysicalMaterial have emissive
  if (material.emissive === undefined) return;
}

// helper: clone material(s) of gltf meshes so color change doesn't affect shared mats
function cloneMaterials(obj) {
  if (!obj.isMesh) return;

  if (Array.isArray(obj.material)) {
    obj.material = obj.material.map((m) => (m ? m.clone() : m));
  } else if (obj.material) {
    obj.material = obj.material.clone();
  }
}

// ==============================
// GROUND (grass)
// ==============================
const grassMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 });
const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), grassMat);
grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
scene.add(grass);
// (opsionale: mos e bëj selectable që të mos “prishë” klikimin)
// makeSelectable(grass);

// ==============================
// ROAD
// ==============================
const roadMat = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.9 });
const road = new THREE.Mesh(new THREE.BoxGeometry(80, 0.2, 12), roadMat);
road.position.set(0, 0.1, -25);
road.receiveShadow = true;
scene.add(road);
makeSelectable(road);

// ==============================
// SIDEWALKS
// ==============================
const sidewalkMat = new THREE.MeshStandardMaterial({
  color: 0x999999,
  roughness: 0.8,
});

function createSidewalk(x, z, width, length) {
  const s = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.3, length),
    sidewalkMat.clone()
  );
  s.position.set(x, 0.15, z);
  s.receiveShadow = true;
  s.castShadow = false;
  scene.add(s);
  makeSelectable(s);
  return s;
}

createSidewalk(-25, -40, 16, 6);
createSidewalk(0, -45, 18, 7);
createSidewalk(25, -40, 14, 6);

createSidewalk(-25, -32, 4, 8);
createSidewalk(0, -38, 4, 7);
createSidewalk(25, -32, 4, 8);

// ==============================
// BUILDINGS
// ==============================
const buildingMat1 = new THREE.MeshStandardMaterial({
  map: brickTex,
  roughness: 0.75,
});
const buildingMat2 = new THREE.MeshStandardMaterial({
  map: concreteTex,
  roughness: 0.85,
});
const buildingMat3 = new THREE.MeshStandardMaterial({
  color: 0xd3d3d3,
  roughness: 0.7,
});

const buildings = [
  new THREE.Mesh(new THREE.BoxGeometry(12, 5, 8), buildingMat1),
  new THREE.Mesh(new THREE.BoxGeometry(14, 6, 10), buildingMat2),
  new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 7), buildingMat3),
];

buildings[0].position.set(-25, 2.5, -40);
buildings[1].position.set(0, 3, -45);
buildings[2].position.set(25, 2.25, -40);

buildings.forEach((b) => {
  b.castShadow = true;
  b.receiveShadow = true;
  scene.add(b);
  makeSelectable(b);
});

// ==============================
// GLASS (simple transparent windows)
// ==============================
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xe6f2ff,
  transparent: true,
  opacity: 0.55,
  roughness: 0.15,
  metalness: 0.0,
  transmission: 0.85,
  thickness: 0.25,
});

function addGlassWindows(building) {
  const w = 10;
  const h = 3;
  const geom = new THREE.PlaneGeometry(w, h);

  const front = new THREE.Mesh(geom, glassMat);
  front.position.set(0, 1.5, building.geometry.parameters.depth / 2 + 0.02);

  const back = new THREE.Mesh(geom, glassMat);
  back.position.set(0, 1.5, -(building.geometry.parameters.depth / 2 + 0.02));
  back.rotation.y = Math.PI;

  building.add(front, back);
}
addGlassWindows(buildings[1]);

// ==============================
// TREES
// ==============================
function createTree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 3),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  trunk.position.set(x, 1.5, z);
  trunk.castShadow = true;
  trunk.receiveShadow = true;

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x006400 })
  );
  leaves.position.set(x, 4, z);
  leaves.castShadow = true;
  leaves.receiveShadow = true;

  scene.add(trunk, leaves);
  makeSelectable(trunk);
  makeSelectable(leaves);
}

createTree(-30, -30);
createTree(30, -30);
createTree(-35, -50);
createTree(35, -50);
createTree(0, -55);
createTree(-15, -45);
createTree(15, -45);

// ==============================
// LAMPS + keyboard interaction (L)
// ==============================
const lampLights = [];

function createLamp(x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 6),
    new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 1,
      roughness: 0.3,
    })
  );
  pole.position.set(x, 3, z);
  pole.castShadow = true;
  pole.receiveShadow = true;

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshStandardMaterial({
      emissive: 0xffcc66,
      emissiveIntensity: 2,
      color: 0xffffff,
    })
  );
  bulb.position.set(x, 6.2, z);
  bulb.castShadow = false;

  const light = new THREE.PointLight(0xfff5cc, 1.5, 25, 2);
  light.position.set(x, 6.2, z);
  light.castShadow = true;

  lampLights.push(light);
  scene.add(pole, bulb, light);

  makeSelectable(pole);
  makeSelectable(bulb);
}

createLamp(-10, -35);
createLamp(10, -35);
createLamp(0, -45);

let lampsOn = true;
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "l") {
    lampsOn = !lampsOn;
    lampLights.forEach((pl) => (pl.intensity = lampsOn ? 1.5 : 0.0));
  }
});

// ==============================
// GLTF / GLB LOADING
// ==============================
const gltfLoader = new GLTFLoader();

let benchModel = null;

// BENCH (your file: assets/models/bench.glb)
gltfLoader.load(
  "./assets/models/bench.glb",
  (gltf) => {
    benchModel = gltf.scene;

    // Pozitë më e mirë (afër rrugës, pranë ndërtesës së mesme)
    benchModel.position.set(5, 0, -30);
    benchModel.rotation.y = Math.PI * 0.1;
    benchModel.scale.set(6, 6, 6);

    benchModel.traverse((obj) => {
      if (obj.isMesh) {
        cloneMaterials(obj);
        obj.castShadow = true;
        obj.receiveShadow = true;
        makeSelectable(obj);
      }
    });

    scene.add(benchModel);
  },
  undefined,
  (err) => console.error("BENCH GLB load error:", err)
);

// ==============================
// INTERACTION: hover highlight + click color toggle
// ==============================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hovered = null;

function setHover(obj) {
  // reset previous hover glow
  if (hovered && hovered.material) {
    const mats = Array.isArray(hovered.material)
      ? hovered.material
      : [hovered.material];
    mats.forEach((m) => {
      if (m && m.emissive) m.emissive.setHex(0x000000);
    });
  }

  hovered = obj;

  // new hover glow
  if (hovered && hovered.material) {
    const mats = Array.isArray(hovered.material)
      ? hovered.material
      : [hovered.material];
    mats.forEach((m) => {
      if (m && m.emissive) m.emissive.setHex(0x222222);
    });
  }
}

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function toggleColor(mesh) {
  if (!mesh || !mesh.isMesh || !mesh.material) return;

  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach((m) => {
    if (!m || !m.color) return;

    // store original if not stored
    if (!mesh.userData.originalColor) {
      mesh.userData.originalColor = m.color.clone();
      mesh.userData.colorToggled = false;
    }

    if (!mesh.userData.colorToggled) {
      m.color.setHex(0xffff00); // yellow
      mesh.userData.colorToggled = true;
    } else {
      m.color.copy(mesh.userData.originalColor);
      mesh.userData.colorToggled = false;
    }
  });
}

window.addEventListener("click", () => {
  if (!hovered) return;

  // change color on click
  toggleColor(hovered);

  // focus camera to clicked object (nice for demo)
  const p = new THREE.Vector3();
  hovered.getWorldPosition(p);
  controls.target.copy(p);
});

// ==============================
// ANIMATION LOOP (sun moves => shadows rotate)
// ==============================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Sun rotates in circle => shadows rotate
  const radius = 90;
  sun.position.x = Math.cos(t * 0.2) * radius;
  sun.position.z = Math.sin(t * 0.2) * radius;
  sun.position.y = 80 + Math.sin(t * 0.3) * 10;

  // update arrow + line
  dir = new THREE.Vector3().subVectors(origin, sun.position).normalize();
  arrowHelper.setDirection(dir);
  arrowHelper.position.copy(sun.position);
  line.geometry.setFromPoints([sun.position.clone(), origin.clone()]);

  // hover raycast (selectable meshes)
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(selectableMeshes, false);
  if (hits.length > 0) setHover(hits[0].object);
  else setHover(null);

  controls.update();
  renderer.render(scene, camera);
}
animate();

// ==============================
// RESIZE
// ==============================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
