import * as THREE from 'three';

// =========================
// 1. SCENE
// =========================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // sfond i zi

// =========================
// 2. CAMERA
// =========================
const camera = new THREE.PerspectiveCamera(
  75,                                     // field of view
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1,                                    // near plane
  1000                                    // far plane
);
camera.position.z = 3;
scene.add(camera);

// =========================
// 3. RENDERER
// =========================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// =========================
// 4. NGARKIMI I TEKSTURËS
// =========================
const textureLoader = new THREE.TextureLoader();

// NDRYSHO EMRIN NËSE TEKSTURA TEK TI QUHET NDYSHE
const texture = textureLoader.load('texture/Onyx011_1K-PNG/Onyx011_1K-PNG_Color.png');
// p.sh. nëse ke vetëm "Onyx011.png", shkruaj:
// const texture = textureLoader.load('texture/Onyx011.png');

// Bëje teksturën të përsëritet pak që të duket më bukur në sferë
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(2, 1); // luaj me këto vlera: (2,1), (3,1), (4,2) etj.

// =========================
// 5. MATERIALI & OBJEKTI (SFERA)
// =========================
const material = new THREE.MeshStandardMaterial({
  map: texture,
  roughness: 0.5,
  metalness: 0.0
});

// Sferë me më shumë segmente që tekstura të duket më e lëmuar
const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
const sphere = new THREE.Mesh(sphereGeometry, material);
scene.add(sphere);

// =========================
// 6. DRITAT
// =========================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // dritë e butë
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// =========================
// 7. RESIZE (që të mos shtrembërohet kur ndryshon madhësia e dritares)
// =========================
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});

// =========================
// 8. ANIMACIONI
// =========================
function animate() {
  requestAnimationFrame(animate);

  // Rrotullimi i sferës
  sphere.rotation.y += 0.01;
  sphere.rotation.x += 0.005;

  renderer.render(scene, camera);
}

animate();
