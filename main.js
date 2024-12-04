import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


let orders = []; // Definieer de variabele orders als een lege array

window.onload = async () => {
  try {
    const response = await fetch('https://sneakers-api-ouat.onrender.com/api/v1/orders');
    const data = await response.json();
    orders = data.data.orders; // Gebruik de variabele orders om de data op te slaan
    console.log('Fetch request succesful:', orders);
  } catch (error) {
    console.error('Fetch request failed:', error);
  }
};

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load the 360 panorama environment
const loader = new THREE.TextureLoader();
const texture360 = loader.load('/hangar.png', () => {
  console.log('Texture loaded with success');
}, undefined, (err) => {
  console.error('Error loading texture:', err);
});

// Create a sphere for the environment (360-degree panorama)
const sphereGeometry = new THREE.SphereGeometry(500, 60, 40); // Large sphere
const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture360, side: THREE.BackSide }); // Texture on inside
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.update();

// Set camera position
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

// Directional Light instellingen
const directionalLight = new THREE.DirectionalLight(0xffffff, 5); // Intensiteit verhoogd naar 5
directionalLight.castShadow = true;
directionalLight.position.set(0, 20, 20);
directionalLight.shadow.mapSize.width = 4096; // Schaduwresolutie verhogen
directionalLight.shadow.mapSize.height = 4096; // Schaduwresolutie verhogen

// Vergroot het zichtbare gebied van de schaduw
directionalLight.shadow.camera.left = -50;  
directionalLight.shadow.camera.right = 50;  
directionalLight.shadow.camera.top = 50;    
directionalLight.shadow.camera.bottom = -50; 
directionalLight.shadow.camera.near = 0.1;   
directionalLight.shadow.camera.far = 200;    

scene.add(directionalLight);

// Ambient Light toevoegen voor meer algemene verlichting
const ambientLight = new THREE.AmbientLight(0xffffff, 2); // Voeg wat ambient light toe
scene.add(ambientLight);

// Spotlight instellingen
const spotLight2 = new THREE.SpotLight(0xffffff, 5, 100, Math.PI / 10, 0.5); // Intensiteit verhoogd naar 5
spotLight2.position.set(0, 20, 20);
spotLight2.castShadow = true;
spotLight2.shadow.mapSize.width = 2048;  
spotLight2.shadow.mapSize.height = 2048;  

// Vergroot het zichtbare gebied van de spotlight schaduw
spotLight2.shadow.camera.left = -50;  
spotLight2.shadow.camera.right = 50;  
spotLight2.shadow.camera.top = 50;    
spotLight2.shadow.camera.bottom = -50; 
spotLight2.shadow.camera.near = 0.1;   
spotLight2.shadow.camera.far = 100;    

scene.add(spotLight2);


// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add a rounded platform
const platformGeometry = new THREE.CylinderGeometry(12, 20, 200, 64);
const platformMaterial = new THREE.MeshStandardMaterial({
  //color white
  color: 0xffffff,
  metalness: 0,
  roughness: 0,
});
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.position.set(0, -100, 0);
scene.add(platform);
//receive shadow on platform
platform.receiveShadow = true;

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Load GLB model of the sneaker
const gltfLoader = new GLTFLoader();
let sneaker;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Voor zachtere schaduwen

// Platform ontvangt schaduw
platform.receiveShadow = true;
gltfLoader.load(
  '/sneaker.glb',
  (gltf) => {
    sneaker = gltf.scene;
    sneaker.scale.set(50, 50, 50);
    sneaker.position.set(0, 4, -1.5);
    sneaker.castShadow = false; // Sneaker werpt schaduwen

    // Zorg ervoor dat alle delen van de sneaker schaduwen werpen
    sneaker.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true; // Schaduw werpen
      }
    });

    scene.add(sneaker);
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
  
      if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        if (firstIntersect.object.isMesh) {
          firstIntersect.object.material.emissive.setHex(0x0000ff); // Highlight color
          firstIntersect.object.material.emissiveIntensity = 0.3; // Intensiteit van de emissive kleur

          selectSneakerPart(firstIntersect.object.name); // Update de titel van het geselecteerde item
        }
      }
    }
  });
// Load GLTF textures 
const textureLoader = new GLTFLoader();
let leatherTexture, crocodileTexture, denimTexture;

textureLoader.load('/leather/leather.gltf', (gltf) => {
  leatherTexture = gltf.scene.children[0].material.map;
});

textureLoader.load('/denim/denim.gltf', (gltf) => {
  denimTexture = gltf.scene.children[0].material.map;
});

textureLoader.load('/crocodile/crocodile.gltf', (gltf) => {
  crocodileTexture = gltf.scene.children[0].material.map;
});

const sneakerParts = [
  { part: 'outside_1', name: 'Tip' },
  { part: 'outside_2', name: 'Heel' },
  { part: 'outside_3', name: 'Sides' },
  { part: 'inside', name: 'Lining' },
  { part: 'laces', name: 'Laces' },
  { part: 'sole_top', name: 'Midsole' },
  { part: 'sole_bottom', name: 'Outsole' },
];

let sneakerPartsIndex = 0;

function selectSneakerPart() {
  const partName = document.querySelector('.part__name');
  const partNumber = document.querySelector('.part__number');

  partName.textContent = sneakerParts[sneakerPartsIndex].name;
  partNumber.textContent = `${sneakerPartsIndex + 1}-${sneakerParts.length}`;
}

document.querySelector('.prev').addEventListener('click', () => {
  sneakerPartsIndex = (sneakerPartsIndex - 1 + sneakerParts.length) % sneakerParts.length;
  selectSneakerPart();
});

document.querySelector('.next').addEventListener('click', () => {
  sneakerPartsIndex = (sneakerPartsIndex + 1) % sneakerParts.length;
  selectSneakerPart();
});

// Function to give the selected sneaker part a color
function updateSneakerPart(color, texture) {
  const partName = sneakerParts[sneakerPartsIndex].part;
  if (sneaker) {
    sneaker.traverse((child) => {
      if (child.isMesh && child.name === partName) {
        if (color) {
          child.material.color.set(color);
        }
        if (texture) {
          child.material.map = texture;
        }
        child.material.needsUpdate = true;
      }
    });
  }
}

const colorOptions = document.querySelectorAll('.color__option');
colorOptions.forEach((option) => {
  option.addEventListener('click', () => {
    const color = option.getAttribute('data-color');
    updateSneakerPart(color, null);
  });
});

const textureOptions = document.querySelectorAll('.texture__option');
textureOptions.forEach((option) => {
  option.addEventListener('click', () => {
    const texture = option.getAttribute('data-texture');
    if (texture === 'leather') {
      updateSneakerPart(null, leatherTexture);
    } else if (texture === 'denim') {
      updateSneakerPart(null, denimTexture);
    } else if (texture === 'crocodile') {
      updateSneakerPart(null, crocodileTexture);
    }
  });
});


// Mouse click event listener
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    const firstIntersect = intersects[0];

    for (let i = 0; i < sneakerParts.length; i++) {
        if (sneakerParts[i].part === firstIntersect.object.name) {
          sneakerPartsIndex = i;
          selectSneakerPart(firstIntersect.object.name);
          const material = firstIntersect.object.material;
          material.emissive.setHex(0xffffff); // Blauwe kleur
          material.emissiveIntensity = 0.2; // Intensiteit van de emissive kleur
          setTimeout(() => {
            material.emissive.setHex(0x0000ff); // Rode kleur (terug naar de hover kleur)
            material.emissiveIntensity = 0.3; // Intensiteit van de emissive kleur
            setTimeout(() => {
              // Animeer de camera naar het geselecteerde onderdeel
              const targetPosition = new THREE.Vector3();
              targetPosition.copy(firstIntersect.object.position);
              let targetQuaternion = new THREE.Quaternion();
              if (firstIntersect.object.name === 'outside_1') {
                targetPosition.x += -5; // Verplaats de camera 10 eenheden naar rechts
                targetPosition.y += 10; // Verhoog de camera 10 eenheden
                targetPosition.z += 10; // Verhoog de camera 10 eenheden
                targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6); // Draai de camera 30 graden naar rechts
              } else if (firstIntersect.object.name === 'outside_2') {
                targetPosition.x += -30; // Verplaats de camera 20 eenheden naar links
                targetPosition.y += 5; // Houd de hoogte van de camera hetzelfde
                targetPosition.z -= 10; // Verplaats de camera 10 eenheden naar achteren
                targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI); // Draai de camera 180 graden rond de y-as
              } else if (firstIntersect.object.name === 'outside_3') {
                targetPosition.x += -30; // Verplaats de camera 20 eenheden naar links
                targetPosition.y += 5; // Houd de hoogte van de camera hetzelfde
                targetPosition.z -= 10; // Verplaats de camera 10 eenheden naar achteren
                targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6); // Draai de camera 30 graden omlaag
              }else if (firstIntersect.object.name === 'inside') {
                // Camera positie aanpassen
                targetPosition.x += 0; // Geen verandering in de x-richting
                targetPosition.y += 20; // Verplaats de camera omhoog (boven de schoen)
                targetPosition.z += -5; // Verplaats de camera iets naar achteren
                
                // Camera oriëntatie aanpassen om naar beneden te kijken
                targetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2); // Kijk 90 graden naar beneden
                targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0); // Geen rotatie rond de y-as
              }else if (firstIntersect.object.name === 'laces') {
                targetPosition.x = 0; // Zet de camera recht voor de schoen
                targetPosition.y = 15; // Verhoog de camera iets meer
                targetPosition.z = 15; // Verplaats de camera naar voren en uitzoomen
                targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4); // Draai de camera 45 graden omhoog
              } else if (firstIntersect.object.name === 'sole_top') {
                targetPosition.x += -5; // Verplaats de camera 10 eenheden naar rechts
                targetPosition.y += 10; // Verhoog de camera 10 eenheden
                targetPosition.z += 10; // Verhoog de camera 10 eenheden
                targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6); // Draai de camera 30 graden naar recht
                targetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 3); // Kijk van beneden naar boven op de schoen
              }else if (firstIntersect.object.name === 'sole_bottom') {
                targetPosition.x += -5; // Verplaats de camera 10 eenheden naar rechts
                targetPosition.y += 10; // Verhoog de camera 10 eenheden
                targetPosition.z += 10; // Verhoog de camera 10 eenheden
                targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2); // Draai de camera 90 graden naar links
                targetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 3); // Kijk van beneden naar boven op de schoen
              }
              const animationDuration = 1000; // Duur van de animatie in milliseconden
              const startTime = performance.now();
              function animateCamera() {
                const currentTime = performance.now();
                const progress = (currentTime - startTime) / animationDuration;
                camera.position.lerpVectors(camera.position, targetPosition, progress);
                camera.quaternion.slerpQuaternions(camera.quaternion, targetQuaternion, progress);
                if (progress < 1) {
                  requestAnimationFrame(animateCamera);
                }
              }
              animateCamera();
            }, 300); // Wacht 100ms voordat je de emissive kleur uit zet
          }, 300); // Wacht 100ms voordat je de emissive kleur uit zet
        }
    }
});
// Animation loop
let clock = new THREE.Clock();


function animate() {
  requestAnimationFrame(animate);

  // Tijd bijhouden
  let elapsedTime = clock.getElapsedTime();

  // Controleren of het sneaker-object geladen is
  if (sneaker) {
    sneaker.position.y = 4 + Math.sin(elapsedTime * 2) * 0.5; // Frequentie en amplitude aanpassen
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();