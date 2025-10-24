import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// skena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0d8ef);

// kamera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(60, 40, 60);

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 5, 0);

// DRITAT
// Hemisphere Light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
scene.add(hemiLight);

// DIELLI
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 100, 50); // bie nga lart majtas
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
sun.shadow.radius = 6;
scene.add(sun);


// Pika ku bie dielli 
const origin = new THREE.Vector3(0, 0, 0); 

// Drejtimi i diellit drejt qendres
const dir = new THREE.Vector3().subVectors(origin, sun.position).normalize(); 

// gjatesia e vijes
const length = 120;

// ArrowHelper vizualizon drejtimin e diellit
const arrowHelper = new THREE.ArrowHelper(dir, sun.position, length, 0xffff00, 5, 3);
scene.add(arrowHelper);

// Opsional: gjithashtu mund ta shohim si vije normale
const points = [];
points.push(sun.position.clone());
points.push(origin.clone());

const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
const lineMat = new THREE.LineBasicMaterial({ color: 0xffff00 });
const line = new THREE.Line(lineGeom, lineMat);
scene.add(line);


// Ground
const grassMat = new THREE.MeshStandardMaterial({ color: 0x3e8e41, roughness: 1 });
const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), grassMat);
grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
scene.add(grass);

// Main Road
const roadMat = new THREE.MeshPhysicalMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.2, clearcoat: 0.3 });
const road = new THREE.Mesh(new THREE.BoxGeometry(80, 0.2, 12), roadMat);
road.position.set(0, 0.1, -25);
road.receiveShadow = true;
scene.add(road);

// trotuar i ngritur sidewalks 
const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8 });
function createSidewalk(x, z, width, length) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(width, 0.3, length), sidewalkMat);
  s.position.set(x, 0.15, z); // ngritur mbi tokë
  s.receiveShadow = true;
  scene.add(s);
  return s;
}

// Trotuaret rreth ndertesave
createSidewalk(-25, -40, 16, 6); 
createSidewalk(0, -45, 18, 7);   
createSidewalk(25, -40, 14, 6);  

// Rruge lidhese nga rruga kryesore te ndertesat
createSidewalk(-25, -32, 4, 8);  
createSidewalk(0, -38, 4, 7);    
createSidewalk(25, -32, 4, 8);   

//BUILDINGS 
const materials = [
  new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.6 }),
  new THREE.MeshPhongMaterial({ color: 0xb0c4de, shininess: 80 }),
  new THREE.MeshLambertMaterial({ color: 0xd3d3d3 })
];

// Ndertesat
const buildings = [
  new THREE.Mesh(new THREE.BoxGeometry(12, 5, 8), materials[0]),
  new THREE.Mesh(new THREE.BoxGeometry(14, 6, 10), materials[1]),
  new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 7), materials[2])
];

// Pozicionimi mbi toke
buildings[0].position.set(-25, 2.5, -40);
buildings[1].position.set(0, 3, -45);
buildings[2].position.set(25, 2.25, -40);

buildings.forEach(b => {
  b.castShadow = true;
  b.receiveShadow = true;
  scene.add(b);
});

// Pemet
function createTree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 3),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  trunk.position.set(x, 1.5, z);
  trunk.castShadow = true;

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x006400 })
  );
  leaves.position.set(x, 4, z);
  leaves.castShadow = true;

  scene.add(trunk, leaves);
}

// Peme te shperndara
createTree(-30, -30);
createTree(30, -30);
createTree(-35, -50);
createTree(35, -50);
createTree(0, -55);
createTree(-15, -45);
createTree(15, -45);

// dritat ne rruge
function createLamp(x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 6),
    new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 1, roughness: 0.3 })
  );
  pole.position.set(x, 3, z);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshStandardMaterial({ emissive: 0xffcc66, emissiveIntensity: 2 })
  );
  bulb.position.set(x, 6.2, z);

  const light = new THREE.PointLight(0xfff5cc, 1.5, 25, 2);
  light.position.set(x, 6.2, z);
  light.castShadow = true;

  scene.add(pole, bulb, light);
}

//  llamba larg pemeve
createLamp(-10, -35);
createLamp(10, -35);
createLamp(0, -45);

// animacioni
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

//  RESIZE HANDLER 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
