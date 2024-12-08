import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';




// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Zet de camera extreem dicht bij het doel
camera.position.set(-25,5, -0.5);  // Camera dichterbij het model plaatsen
camera.lookAt(0, 0, 0);

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



// Ambient Light (for global illumination)
const ambientLight = new THREE.AmbientLight(0xffffff, 2); // Verhoog de intensiteit van het ambient light
scene.add(ambientLight);

// Directional Light (to simulate sunlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.castShadow = true;
directionalLight.position.set(-20, 50, -20); // Verhoog de Y-positie van het licht
directionalLight.target.position.set(0, 0, 0); // Stel de doelpositie van het licht in zodat het niet direct op de schoen schijnt

// Schaduwinstellingen voor Directional Light
directionalLight.shadow.mapSize.width = 4096;  // Verhoog de resolutie van de schaduwmap
directionalLight.shadow.mapSize.height = 4096; // Verhoog de resolutie van de schaduwmap

// Vergroot het zichtbare gebied van de schaduwcamera
directionalLight.shadow.camera.left = -50;    // Vergroot de linkerkant van de schaduw
directionalLight.shadow.camera.right = 50;    // Vergroot de rechterkant van de schaduw
directionalLight.shadow.camera.top = 50;      // Vergroot de bovenkant van de schaduw
directionalLight.shadow.camera.bottom = -50;  // Vergroot de onderkant van de schaduw
directionalLight.shadow.camera.near = 0.1;    // Verklein de afstand vanaf de camera voor schaduwen
directionalLight.shadow.camera.far = 200;     // Verhoog de verre afstand voor schaduwen

// Pas de bias aan om ongewenste artefacten in de schaduw te voorkomen
directionalLight.shadow.bias = -0.01; // Verhoog de bias iets meer om de schaduwen verder weg van het object te plaatsen


// Verlichting toevoegen aan de scene
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
document.addEventListener('DOMContentLoaded', () => {
  const sizeButtons = document.querySelectorAll('.size-btn');

  // Schalen per maat
  const sizeScaleMap = {
    '35 ½': { x: 44, y: 44, z: 44 },
    '36': { x: 45, y: 45, z: 45 },
    '36 ⅔': { x: 46, y: 46, z: 46},
    '37 ⅓': { x: 47, y: 47, z: 47 },
    '38': { x: 48, y: 48, z: 48 },
    '38 ⅓': { x: 49, y: 49, z: 49 },
    '39 ⅓': { x: 50, y: 50, z: 50},
    '40': { x: 51, y: 51, z: 51 },
    '40 ⅔': { x: 52, y: 52, z: 52 },
    '41 ⅓': { x: 53, y: 53, z: 53 },
    '42': { x: 54, y: 54, z: 54 },
    '42 ⅓': {x: 54.5, y: 54.5, z: 54.5 },
    '43': { x: 56, y: 56, z: 56 },
    '43 ⅓': { x: 56.5, y: 56.5, z: 56.5 },
    '44': { x: 58, y: 58, z: 58 },
  };

  // Haal de geselecteerde maat op uit localStorage
  const selectedSize = localStorage.getItem('selectedSize');

  // Functie om de geselecteerde maat te markeren
  const markSelectedSize = (size) => {
    sizeButtons.forEach((button) => {
      if (button.innerText === size) {
        button.classList.add('selected');
      } else {
        button.classList.remove('selected');
      }
    });
  };

  // Als er een maat is opgeslagen, markeer deze knop als geselecteerd
  if (selectedSize) {
    markSelectedSize(selectedSize);
  }

  // Voeg een klik-event listener toe aan elke knop
  sizeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const size = button.innerText; // Haal de maat van de aangeklikte knop op
      console.log('Geselecteerde maat:', size); // Log de geselecteerde maat
      localStorage.setItem('selectedSize', size); // Sla de geselecteerde maat op
      markSelectedSize(size); // Update de visuele selectie
      updateSneakerScale(size); // Pas de schaal aan
    });
  });

  // Functie om de schaal van de sneaker bij te werken
  const updateSneakerScale = (size) => {
    if (sneaker && sizeScaleMap[size]) {
      const scale = sizeScaleMap[size];
      sneaker.scale.set(scale.x, scale.y, scale.z);
      console.log(`Sneaker schaal aangepast voor maat ${size}:`, scale);
    } else {
      console.warn('Schaal of model niet gevonden voor maat:', size);
    }
  };

  // Laad het 3D-model
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/sneaker.glb',
    (gltf) => {
      sneaker = gltf.scene;

      // Stel de schaal in op basis van de opgeslagen maat of standaardmaat
      const size = localStorage.getItem('selectedSize') || '40'; // Default maat 40
      const scale = sizeScaleMap[size] || sizeScaleMap['40']; // Fallback naar default maat 40
      sneaker.scale.set(scale.x, scale.y, scale.z);

      sneaker.position.set(0, 4, -1.5);

      // Zet castShadow uit voor het hele model
      sneaker.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true; // Schaduwen werpen
          child.receiveShadow = false; // Schaduwen ontvangen uitgeschakeld
        }
      });

      // Voeg het model toe aan de scène
      scene.add(sneaker);
      console.log('Model geladen en toegevoegd aan scène:', sneaker);
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
    }
  );
});



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



// Functie om een snapshot te maken en op te slaan in localStorage
function captureAndStoreSneakerSnapshot() {
  renderer.render(scene, camera); // Render de huidige scène

  // Maak een snapshot als base64 PNG-afbeelding
  const snapshot = renderer.domElement.toDataURL('image/png');

  // Bereid de sneakergegevens voor om op te slaan
  const sneakerData = {
    order: {
      sneakerConfigs: sneakerSettings,
      snapshot: snapshot,
    },
  };

  // Sla de gegevens op in localStorage
  localStorage.setItem('sneakerData', JSON.stringify(sneakerData));
  console.log("Sneaker snapshot en data opgeslagen in localStorage:", sneakerData);
}

// Functie om sneakerinstellingen bij te werken
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
    textureName: textureName || null,
    name: partDisplayName,
    colorName: colorName || null,
  };

  console.log(`Updated part: ${partDisplayName}`);
  console.log(`Color: ${color}, Texture: ${textureName}`);

  // Maak een snapshot nadat de sneaker is bijgewerkt
  captureAndStoreSneakerSnapshot();
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

// Event listener voor de "save" knop
document.querySelector('.save').addEventListener('click', () => {
  // Maak een snapshot en sla de configuratie op
  captureAndStoreSneakerSnapshot();
});




// Functie om de rotatie van de gehele schoen te animeren
function animateShoeRotation(partName) {
  const targetRotation = new THREE.Euler();

  const selectedShoe = scene.getObjectByName('sneaker'); // Hier wordt aangenomen dat de hele schoen een object is genaamd 'sneaker'
  if (!selectedShoe) return;

  // Stel de doelrotatie in op basis van het geselecteerde onderdeel
  if (partName === 'outside_1') {
    targetRotation.set(Math.PI / 14, Math.PI / -4, Math.PI / 12, Math.PI / 12); // Alleen Y-as
  } else if (partName === 'outside_2') {
    targetRotation.set(0, -Math.PI / -4, 0); // Alleen Y-as
  } else if (partName === 'outside_3') {
    targetRotation.set(0, Math.PI / 5, 0); // Alleen Y-as
  } else if (partName === 'inside') {
    targetRotation.set(Math.PI / -16, Math.PI / 8,Math.PI / 3); // X, Y en Z-assen
  } else if (partName === 'laces') {
    targetRotation.set(Math.PI / 8, Math.PI / -4, Math.PI / 8, Math.PI / 8);
  } else if (partName === 'sole_top') {
    targetRotation.set(0, Math.PI / -4, -Math.PI / -10, Math.PI / 12);; // X, Y en Z-assen
  } else if (partName === 'sole_bottom') {
    targetRotation.set(0, Math.PI / -4, -Math.PI / 8, Math.PI / 12);; // X, Y en Z-assen
  }

  const animationDuration = 1000; // Duur van de animatie in milliseconden
  const startTime = performance.now();
  const originalRotation = selectedShoe.rotation.clone(); // Bewaar de originele rotatie

  function animateRotation() {
    const currentTime = performance.now();
    const progress = Math.min((currentTime - startTime) / animationDuration, 1);

    // Interpoleer de rotatie van de schoen naar de doelrotatie langs alle assen
    selectedShoe.rotation.x = THREE.MathUtils.lerp(originalRotation.x, targetRotation.x, progress);
    selectedShoe.rotation.y = THREE.MathUtils.lerp(originalRotation.y, targetRotation.y, progress);
    selectedShoe.rotation.z = THREE.MathUtils.lerp(originalRotation.z, targetRotation.z, progress);

    // Stop de animatie als de rotatie klaar is
    if (progress < 1) {
      requestAnimationFrame(animateRotation);
    }
  }

  animateRotation();
}


// Functie om het geselecteerde onderdeel van de schoen te highlighten
function highlightSelectedPart(partName) {
  const selectedObject = scene.getObjectByName(partName);
  if (selectedObject) {
    const material = selectedObject.material;
    const originalEmissiveColor = material.emissive.getHex();
    material.emissive.setHex(0xffffff); // Zet de emissive kleur naar wit (highlight)
    material.emissiveIntensity = 0.1;

    setTimeout(() => {
      material.emissive.setHex(originalEmissiveColor); // Zet de emissive kleur terug naar de originele kleur
      material.emissiveIntensity = 0.1; // Zet de emissive intensiteit terug naar normaal
    }, 300);
  }
}

// Event listener voor klikken op de "prev" knop
document.querySelector('.prev').addEventListener('click', () => {
  sneakerPartsIndex = (sneakerPartsIndex - 1 + sneakerParts.length) % sneakerParts.length;
  const currentPart = sneakerParts[sneakerPartsIndex].part;
  selectSneakerPart(currentPart);
  animateShoeRotation(currentPart); // Rotatie van de gehele schoen animeren
  
  // Highlight het geselecteerde onderdeel
  highlightSelectedPart(currentPart);
});

// Event listener voor klikken op de "next" knop
document.querySelector('.next').addEventListener('click', () => {
  sneakerPartsIndex = (sneakerPartsIndex + 1) % sneakerParts.length;
  const currentPart = sneakerParts[sneakerPartsIndex].part;
  selectSneakerPart(currentPart);
  animateShoeRotation(currentPart); // Rotatie van de gehele schoen animeren

  // Highlight het geselecteerde onderdeel
  highlightSelectedPart(currentPart);
});

// Event listener voor het klikken op een specifiek onderdeel via raycasting
const parts = ['outside_1', 'outside_2', 'outside_3', 'inside', 'laces', 'sole_top', 'sole_bottom'];
parts.forEach(part => {
  const partObject = scene.getObjectByName(part);
  if (partObject) {
    partObject.on('click', () => {
      animateShoeRotation(part); // Rotatie van de gehele schoen bij klikken op een onderdeel
      highlightSelectedPart(part); // Highlight het geselecteerde onderdeel
    });
  }
});

// Stel een lijst van de schoenonderdelen in waarop we willen raycasten
const shoeParts = ['outside_1', 'outside_2', 'outside_3', 'inside', 'laces', 'sole_top', 'sole_bottom'];

// Raycasting voor muisklikken op een specifiek onderdeel
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Zoek alleen naar de onderdelen die in de schoen zitten, niet naar het platform of andere objecten
  const intersects = raycaster.intersectObjects(shoeParts.map(part => scene.getObjectByName(part)), true);

  const firstIntersect = intersects[0];

  if (firstIntersect) {
    const partName = firstIntersect.object.name;

    // Roep de animatie van de rotatie van de hele schoen aan bij klikken op een onderdeel
    animateShoeRotation(partName); // Deze regel zorgt ervoor dat de rotatie van de schoen geanimeerd wordt

    // Highlight het aangeklikte onderdeel
    const material = firstIntersect.object.material;
    const originalEmissiveColor = material.emissive.getHex(); // Bewaar de originele emissive kleur
    material.emissive.setHex(0xffffff); // Zet de emissive kleur naar wit (highlight)
    material.emissiveIntensity = 0.1; // Verhoog de intensiteit van de emissive kleur

    // Zet na een korte tijd de highlight weer terug naar de oorspronkelijke kleur
    setTimeout(() => {
      material.emissive.setHex(originalEmissiveColor); // Zet de emissive kleur terug naar de originele kleur
      material.emissiveIntensity = 0.3; // Zet de emissive intensiteit terug naar normaal
    }, 300); // 300ms voor het highlight effect
  }
});




// Raycasting voor muisklikken op een specifiek onderdeel
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Zoek alleen naar de onderdelen die in de schoen zitten
  const intersects = raycaster.intersectObjects(shoeParts.map(part => scene.getObjectByName(part)), true);

  const firstIntersect = intersects[0];

  if (firstIntersect) {
    const partName = firstIntersect.object.name;

    // Update de sneakerPartsIndex en selecteer het juiste onderdeel
    for (let i = 0; i < sneakerParts.length; i++) {
      if (sneakerParts[i].part === partName) {
        sneakerPartsIndex = i;
        break;
      }
    }

    // Roep de animatie van de rotatie van de hele schoen aan bij klikken op een onderdeel
    animateShoeRotation(partName); // Deze regel zorgt ervoor dat de rotatie van de schoen geanimeerd wordt

    // Highlight het aangeklikte onderdeel
    const material = firstIntersect.object.material;
    const originalEmissiveColor = material.emissive.getHex(); // Bewaar de originele emissive kleur
    material.emissive.setHex(0xffffff); // Zet de emissive kleur naar wit (highlight)
    material.emissiveIntensity = 0.1; // Verhoog de intensiteit van de emissive kleur

    // Zet na een korte tijd de highlight weer terug naar de oorspronkelijke kleur
    setTimeout(() => {
      material.emissive.setHex(originalEmissiveColor); // Zet de emissive kleur terug naar de originele kleur
      material.emissiveIntensity = 0.3; // Zet de emissive intensiteit terug naar normaal
    }, 300); // 300ms voor het highlight effect
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


  renderer.render(scene, camera);
}

animate();