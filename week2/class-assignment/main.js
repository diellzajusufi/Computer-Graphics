import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 19;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const axes = new THREE.AxesHelper(9);
scene.add(axes);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

// Group per objektet
const group = new THREE.Group();
group.scale.y = 2;
group.rotation.y = 0.2;
scene.add(group);

// 1. Sfere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.8, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
sphere.position.x = -3;
group.add(sphere);

// 2. Cilinder
const cylinder = new THREE.Mesh(
  new THREE.CylinderGeometry(0.7, 0.7, 2, 32),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
cylinder.position.x = 0;
group.add(cylinder);

// 3. Kon
const cone = new THREE.Mesh(
  new THREE.ConeGeometry(1, 2, 32),
  new THREE.MeshStandardMaterial({ color: 0xffa500 })
);
cone.position.x = 3;
group.add(cone);

function animate() {
  requestAnimationFrame(animate);

  // Rotacion per animacion
  sphere.rotation.y += 0.01;
  cylinder.rotation.y += 0.01;
  cone.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
