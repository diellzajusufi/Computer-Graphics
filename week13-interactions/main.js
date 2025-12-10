import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

let scene, camera, renderer, raycaster, mouse;
let cubes = [];
let selectedCube = null;

// --- Info Panel ---
const infoPanel = document.createElement("div");
infoPanel.id = "info";
infoPanel.style.position = "absolute";
infoPanel.style.top = "10px";
infoPanel.style.left = "10px";
infoPanel.style.color = "white";
infoPanel.style.fontFamily = "monospace";
infoPanel.style.background = "rgba(0,0,0,0.6)";
infoPanel.style.padding = "12px";
infoPanel.style.borderRadius = "8px";
infoPanel.style.minWidth = "240px";
infoPanel.innerText = "Click a cube to see its information here.";
document.body.appendChild(infoPanel);

init();
animate();

function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 25;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 8, 10);
    scene.add(light);

    // --- Create Random Cubes ---
    for (let i = 0; i < 20; i++) {
        const w = Math.random() * 2 + 1;
        const h = Math.random() * 2 + 1;
        const d = Math.random() * 2 + 1;

        const geometry = new THREE.BoxGeometry(w, h, d);
        const material = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff
        });

        const cube = new THREE.Mesh(geometry, material);

        cube.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40
        );

        cube.userData = { width: w, height: h, depth: d };

        scene.add(cube);
        cubes.push(cube);
    }

    window.addEventListener("click", onMouseClick);
    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(cubes);

    if (hits.length > 0) {
        const cube = hits[0].object;

        // Unselect previous cube
        if (selectedCube) {
            selectedCube.material.emissive.setHex(0x000000);
            selectedCube.scale.set(1, 1, 1);
        }

        selectedCube = cube;

        cube.material.emissive.setHex(0x333333);
        cube.scale.set(1.2, 1.2, 1.2);

        // --- Fixed Template Literal ---
        infoPanel.innerText = 
`Cube Selected:

Position:
x: ${cube.position.x.toFixed(2)}
y: ${cube.position.y.toFixed(2)}
z: ${cube.position.z.toFixed(2)}

Size:
Width: ${cube.userData.width.toFixed(2)}
Height: ${cube.userData.height.toFixed(2)}
Depth: ${cube.userData.depth.toFixed(2)}`;
        
    } else {
        if (selectedCube) {
            selectedCube.material.emissive.setHex(0x000000);
            selectedCube.scale.set(1, 1, 1);
            selectedCube = null;
        }

        infoPanel.innerText = "No object selected.";
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
