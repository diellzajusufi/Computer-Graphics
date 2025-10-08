import * as THREE from 'three';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020); // Dark gray background


const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000 
);
camera.position.z = 5; 

const renderer = new THREE.WebGLRenderer({ antialias: true }); // Smooth edges
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);


const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);


const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.5);
scene.add(lightHelper);

const pointLight = new THREE.PointLight(0xffaa00, 1, 20); 
pointLight.position.set(-3, 2, 4);
scene.add(pointLight);


const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.3);
scene.add(pointLightHelper);


const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100); 
const material = new THREE.MeshPhongMaterial({
  color: 0x8844ff,   // Purple base color
  specular: 0xffffff, // White specular highlight
  shininess: 50      // How shiny the material is
});


const object = new THREE.Mesh(geometry, material);
scene.add(object);


function animate() {
  requestAnimationFrame(animate);

  
  object.rotation.x += 0.02;
  object.rotation.y += 0.03;

 
  renderer.render(scene, camera);
}


animate();


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
