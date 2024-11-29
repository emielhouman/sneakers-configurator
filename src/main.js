import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load the background
const textureLoader = new THREE.TextureLoader();
const texture360 = textureLoader.load('hangar.png');
scene.background = texture360;

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.update();

// Set camera position
camera.position.set(-20, 5, -20);
camera.lookAt(0, 0, 0);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.castShadow = true;
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Load GLB model of the sneaker
const gltfLoader = new GLTFLoader();
let sneaker;

gltfLoader.load(
  '/sneaker.glb',
  (gltf) => {
    sneaker = gltf.scene;
    sneaker.scale.set(50, 50, 50);
    sneaker.position.set(0, 0, 0);
    sneaker.rotation.x = Math.PI / 12;

    scene.add(sneaker);

    // Apply a standard material
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xFFFFFF,
          roughness: 0.5,
        });
      }
    });
  },
  undefined,
  (error) => {
    console.error('Error loading model:', error);
  }
);

// Mouse move event listener
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (sneaker) {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(sneaker.children, true);

    sneaker.traverse((child) => {
      if (child.isMesh) {
        child.material.emissive.setHex(0x000000); // Reset color
      }
    });

    intersects.forEach((intersect) => {
      if (intersect.object.isMesh) {
        intersect.object.material.emissive.setHex(0xff0000); // Highlight color
      }
    });
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();