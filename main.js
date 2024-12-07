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

// Ambient Light (for global illumination)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Verlichting voor de hele scene
scene.add(ambientLight);

// Directional Light (to simulate sunlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.castShadow = true;
directionalLight.position.set(0, 10, 0); // Positie van het licht

// Schaduwinstellingen voor Directional Light
directionalLight.shadow.mapSize.width = 4096; // Verhoog de resolutie van de schaduwmap
directionalLight.shadow.mapSize.height = 4096; // Verhoog de resolutie van de schaduwmap

// Vergroot het zichtbare gebied van de schaduwcamera
directionalLight.shadow.camera.left = -50;    // Vergroot de linkerkant van de schaduw
directionalLight.shadow.camera.right = 50;    // Vergroot de rechterkant van de schaduw
directionalLight.shadow.camera.top = 50;      // Vergroot de bovenkant van de schaduw
directionalLight.shadow.camera.bottom = -50;  // Vergroot de onderkant van de schaduw
directionalLight.shadow.camera.near = 0.1;    // Verklein de afstand vanaf de camera voor schaduwen
directionalLight.shadow.camera.far = 200;     // Verhoog de verre afstand voor schaduwen

// Pas de bias aan om ongewenste artefacten in de schaduw te voorkomen
directionalLight.shadow.bias = -0.005; // Kleine negatieve waarde voorkomt artefacten

scene.add(directionalLight);



// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load the texture

// Initialize the TextureLoader
const textureLoader2 = new THREE.TextureLoader();

// Load the texture
const platformTexture = textureLoader2.load('/concrete_layers_diff_4k.jpg');

// Add a rounded platform
const platformGeometry = new THREE.CylinderGeometry(12, 20, 200, 64);
const platformMaterial = new THREE.MeshStandardMaterial({
  map: platformTexture, // Use the loaded texture
  color: 0x999999 , // Apply a dark tint
  metalness: 0,    // Ensure non-metallic look
  roughness: 0.6,  // Keep it rough for a realistic feel
});
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.position.set(0, -100, 0);
scene.add(platform);

// Receive shadow on platform
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

    // Zet castShadow uit voor het hele model
    sneaker.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;  // Schaduwen werpen is uitgeschakeld
        child.receiveShadow = false;  // Schaduwen ontvangen is ook uitgeschakeld
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
const sneakerSettings = {}; // Object to store selected colors, textures, names, and color names for each part

function selectSneakerPart() {
  const partName = document.querySelector('.part__name');
  const partNumber = document.querySelector('.part__number');

  partName.textContent = sneakerParts[sneakerPartsIndex].name;
  partNumber.textContent = `${sneakerPartsIndex + 1}-${sneakerParts.length}`;
}



// Function to update sneaker settings
function updateSneakerPart(color, texture, colorName, textureName) {
  const partName = sneakerParts[sneakerPartsIndex].part;
  const partDisplayName = sneakerParts[sneakerPartsIndex].name;

  // Update 3D model visuals
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

  // Save only the necessary data in sneakerSettings
  sneakerSettings[partName] = {
    color: color || null,
    textureName: textureName || null, // Only save the textureName, not the whole object
    name: partDisplayName,
    colorName: colorName || null,
  };

  console.log(`Updated part: ${partDisplayName}`);
  console.log(`Color: ${color}, Texture: ${textureName}`);
}


const colorOptions = document.querySelectorAll('.color__option');
colorOptions.forEach((option) => {
  option.addEventListener('click', () => {
    const color = option.getAttribute('data-color'); 
    const colorName = option.querySelector('.color__name').textContent; 
    
    // If both color and texture are selected, update together
    const texture = sneakerSettings[sneakerParts[sneakerPartsIndex].part]?.texture;
    updateSneakerPart(color, texture, colorName, sneakerSettings[sneakerParts[sneakerPartsIndex].part]?.textureName);
    
  });
});

const textureOptions = document.querySelectorAll('.texture__option');
textureOptions.forEach((option) => {
  option.addEventListener('click', () => {
    const texture = option.getAttribute('data-texture');
    const textureName = option.querySelector('.texture__name') ? option.querySelector('.texture__name').textContent.trim() : option.textContent.trim();

    let selectedTexture = null;
    
    // Check which texture is selected and assign the corresponding texture object
    if (texture === 'leather') {
      selectedTexture = leatherTexture; 
    } else if (texture === 'denim') {
      selectedTexture = denimTexture; 
    } else if (texture === 'crocodile') {
      selectedTexture = crocodileTexture; 
    }

    if (selectedTexture) {
      // Save texture to sneakerSettings for this part
      sneakerSettings[sneakerParts[sneakerPartsIndex].part] = {
        texture: selectedTexture,
        textureName: textureName
      };

      // If color is also selected, update together
      const color = sneakerSettings[sneakerParts[sneakerPartsIndex].part]?.color;
      updateSneakerPart(color, selectedTexture, sneakerSettings[sneakerParts[sneakerPartsIndex].part]?.colorName, textureName);
      
    }
  });
});
document.querySelector('.save').addEventListener('click', () => {
  console.log(sneakerSettings);

  // Prepare data to be stored in localStorage
  const sneakerData = {
    order: {
      sneakerConfigs: sneakerSettings, // Add the general color or color you need
    },
  };

  // Save sneakerData to localStorage
  localStorage.setItem('sneakerData', JSON.stringify(sneakerData));
  console.log("Sneaker data saved to localStorage:", sneakerData);

  // Redirect to checkout page
  window.location.href = 'checkout.html';
});





function animateCameraToPart(partName) {
  const targetPosition = new THREE.Vector3();
  let targetQuaternion = new THREE.Quaternion();

  const selectedPart = scene.getObjectByName(partName);
  if (!selectedPart) return;

  targetPosition.copy(selectedPart.position);

  // Stel hier de specifieke camera-instellingen in per onderdeel
  if (partName === 'outside_1') {
    targetPosition.x += -5;
    targetPosition.y += 10;
    targetPosition.z += 10;
    targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6);
  } else if (partName === 'outside_2') {
    targetPosition.x += -30;
    targetPosition.y += 5;
    targetPosition.z -= 10;
    targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI);
  } else if (partName === 'outside_3') {
    targetPosition.x += -30;
    targetPosition.y += 5;
    targetPosition.z -= 10;
    targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6);
  } else if (partName === 'inside') {
    targetPosition.x += 0;
    targetPosition.y += 20;
    targetPosition.z += -5;
    targetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  } else if (partName === 'laces') {
    targetPosition.x = 0;
    targetPosition.y = 15;
    targetPosition.z = 15;
    targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
  } else if (partName === 'sole_top') {
    targetPosition.x += -5;
    targetPosition.y += 10;
    targetPosition.z += 10;
    targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 6);
    targetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 3);
  } else if (partName === 'sole_bottom') {
    targetPosition.x += -5;
    targetPosition.y += 10;
    targetPosition.z += 10;
    targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    targetQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 3);
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
}


document.querySelector('.prev').addEventListener('click', () => {
  sneakerPartsIndex = (sneakerPartsIndex - 1 + sneakerParts.length) % sneakerParts.length;
  const currentPart = sneakerParts[sneakerPartsIndex].part;
  selectSneakerPart(currentPart);
  animateCameraToPart(currentPart);
  
  // Highlight het geselecteerde onderdeel
  const selectedObject = scene.getObjectByName(currentPart); // Haal het object op via de naam van het onderdeel
  if (selectedObject) {
    const material = selectedObject.material;
    const originalEmissiveColor = material.emissive.getHex(); // Bewaar de originele emissive kleur
    material.emissive.setHex(0xffffff); // Zet de emissive kleur naar geel (highlight)
    material.emissiveIntensity = 0.1; // Verhoog de intensiteit van de emissive kleur

    // Zet na een korte tijd de highlight weer terug naar de oorspronkelijke kleur
    setTimeout(() => {
      material.emissive.setHex(originalEmissiveColor); // Zet de emissive kleur terug naar de originele kleur
      material.emissiveIntensity = 0.1; // Zet de emissive intensiteit terug naar normaal
    }, 300); // 300ms voor het highlight effect
  }
});

document.querySelector('.next').addEventListener('click', () => {
  sneakerPartsIndex = (sneakerPartsIndex + 1) % sneakerParts.length;
  const currentPart = sneakerParts[sneakerPartsIndex].part;
  selectSneakerPart(currentPart);
  animateCameraToPart(currentPart);
  
  // Highlight het geselecteerde onderdeel
  const selectedObject = scene.getObjectByName(currentPart); // Haal het object op via de naam van het onderdeel
  if (selectedObject) {
    const material = selectedObject.material;
    const originalEmissiveColor = material.emissive.getHex(); // Bewaar de originele emissive kleur
    material.emissive.setHex(0xffffff); // Zet de emissive kleur naar geel (highlight)
    material.emissiveIntensity = 0.1; // Verhoog de intensiteit van de emissive kleur

    // Zet na een korte tijd de highlight weer terug naar de oorspronkelijke kleur
    setTimeout(() => {
      material.emissive.setHex(originalEmissiveColor); // Zet de emissive kleur terug naar de originele kleur
      material.emissiveIntensity = 0.1; // Zet de emissive intensiteit terug naar normaal
    }, 300); // 300ms voor het highlight effect
  }
});


window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);
  const firstIntersect = intersects[0];

  if (firstIntersect) {
    for (let i = 0; i < sneakerParts.length; i++) {
      if (sneakerParts[i].part === firstIntersect.object.name) {
        sneakerPartsIndex = i;
        const partName = firstIntersect.object.name;
        selectSneakerPart(partName); // Update de UI of logica
        animateCameraToPart(partName); // Camera-animatie
        
        // Highlight het aangeklikte onderdeel
        const material = firstIntersect.object.material;
        const originalEmissiveColor = material.emissive.getHex(); // Bewaar de originele emissive kleur
        material.emissive.setHex(0xffffff); // Zet de emissive kleur naar geel (highlight)
        material.emissiveIntensity = 0.1; // Verhoog de intensiteit van de emissive kleur

        // Zet na een korte tijd de highlight weer terug naar de oorspronkelijke kleur
        setTimeout(() => {
          material.emissive.setHex(originalEmissiveColor); // Zet de emissive kleur terug naar de originele kleur
          material.emissiveIntensity = 0.3; // Zet de emissive intensiteit terug naar normaal
        }, 300); // 300ms voor het highlight effect
        break;
      }
    }
  }
});



// Define the selectSize function
window.selectSize = function(size) {
  // Save the selected size in localStorage
  localStorage.setItem('selectedSize', size);

  // Mark the selected button
  const sizeButtons = document.querySelectorAll('.size-btn');
  sizeButtons.forEach(button => {
    if (button.innerText === size) {
      button.classList.add('selected'); // Add 'selected' class to the clicked button
    } else {
      button.classList.remove('selected'); // Remove 'selected' class from the unclicked buttons
    }
  });
};

// Ensure that the page loads with the selected size (if any)
document.addEventListener('DOMContentLoaded', () => {
  const selectedSize = localStorage.getItem('selectedSize');
  
  // If a size is stored, mark the button with that size as selected
  if (selectedSize) {
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(button => {
      if (button.innerText === selectedSize) {
        button.classList.add('selected');
      }
    });
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