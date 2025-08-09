// Create loading manager
const loadingManager = new THREE.LoadingManager();

// When all textures are loaded
loadingManager.onLoad = function () {
    document.getElementById("loadingScreen").style.display = "none";
};

// Show progress
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    let progress = (itemsLoaded / itemsTotal) * 100;
    document.getElementById("loadingText").innerText = `Loading ${Math.round(progress)}%`;
};

// When there’s an error
loadingManager.onError = function (url) {
    console.error(`Error loading ${url}`);
};



const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.z = 100;


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

h = window.innerHeight;
w = window.innerWidth;
renderer.setSize(w,h);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0;

const scene = new THREE.Scene();

camera.position.z = 500;
//loading textures

const paths = ["./2k_sun.jpg", "./2k_mercury.jpg", "./4k_venus_atmosphere.jpg", "./8k_earth_daymap.jpg", "./8k_mars.jpg", "./8k_jupiter.jpg", "./8k_saturn.jpg", "./2k_uranus.jpg", "./2k_neptune.jpg",];

const textureLoader = new THREE.TextureLoader(loadingManager);
const loadedTextures = paths.map((path) => {
  return textureLoader.load(path);
  
}
);

loadedTextures.forEach((texture) => {
texture.colorSpace = THREE.SRGBColorSpace;
}
)
const [sunTexture, mercureTexture, venusTexture, earthTexture, marsTexture, jupiterTexture, saturnTexture, uranusTexture, naptuneTexture] = loadedTextures;


const geometriesR = [
  50, 5, 10, 12, 9, 30, 27, 22, 20
]

 //sun geometry 
 
 const geometries = [];
 
 for(let i = 1; i < geometriesR.length; i++) {
   let geometry = new THREE.SphereGeometry(geometriesR[i], 32, 32);
   geometries.push(geometry)
 }
 
 const sunGeometry = new THREE.SphereGeometry(50, 32,32);
 const sunMaterial = new THREE.MeshBasicMaterial({
   map: sunTexture
 });
 
 const materials = [];
 
 for(let i = 0; i < loadedTextures.length; i++) {
  const texture = new THREE.MeshStandardMaterial({
    map: loadedTextures[i]
    
  })
  materials.push(texture)
  }


// declaring light source 

const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
const ambientLight = new THREE.AmbientLight(0xfffff, 0.3)

pointLight.position.set(0,0,0)


//orbits

const orbits = [];

for (let i = 0; i <= 7; i++) {
  const orbit = new THREE.Object3D();
  orbits.push(orbit);
}
// puting all together 

const sun = new THREE.Mesh(sunGeometry, sunMaterial
  
)
const meshes = [sun];

for (let i = 0; i < geometries.length; i++) {
  const mesh = new THREE.Mesh(geometries[i], materials[i + 1]);
  meshes.push(mesh);
}

const meshPositions = [110, 200, 290, 490, 550, 645, 800, 1000];

for (let i = 1; i < meshes.length; i++) {
  meshes[i].position.x = meshPositions[i - 1];
}
const [ s, mercury, venus, earth, mars, jupiter, saturn, uranus, naptune] = meshes;

// Load Saturn ring texture
const saturnRingTexture = textureLoader.load("./8k_saturn_ring_alpha.png");

// Create ring geometry (inner radius, outer radius, segments)
const ringGeometry = new THREE.RingGeometry(35, 50, 64);

// Rotate the ring so it's horizontal
const ringMaterial = new THREE.MeshBasicMaterial({
  map: saturnRingTexture,
  side: THREE.DoubleSide,
  transparent: true
});
const saturnRing = new THREE.Mesh(ringGeometry, ringMaterial);
saturnRing.rotation.x = Math.PI / 2;
// Attach to Saturn
saturn.add(saturnRing);
// setting positions 


// adding to the scene

scene.add(pointLight);
scene.add(ambientLight)
scene.add(sun);
orbits.forEach((orbit) => {
  scene.add(orbit);
});


for(let i = 0; i < orbits.length; i++) {
  orbits[i].add(meshes[i + 1])
}

const axisSpeed = [0.01, 0.008, 1.2, 1, 0.03, 0.007, 0.001, 0.005];

const angles = [0,0,0,0,0,0,0,0];

const angleToUpdate = [
  0.0415, // Mercury (~88 days)
  0.0162, // Venus (~225 days)
  0.01, // Earth (365 days)
  0.0053, // Mars (~687 days)
  0.00084, // Jupiter (~12 years)
  0.00034, // Saturn (~29 years)
  0.00012, // Uranus (~84 years)
  0.00006 // Neptune (~165 years)
];

const rotationsPerOrbit = [
  0.062,     // Mercury
  -0.004,    // Venus (retrograde)
  365,       // Earth
  669,       // Mars
  10537,     // Jupiter
  24174,     // Saturn
  -42658,    // Uranus (retrograde)
  54147      // Neptune
];

const axisToUpdate = rotationsPerOrbit.map((r, i) => angleToUpdate[i] * r);


function animate() {
  requestAnimationFrame(animate);
  
  controls.update();

for (let i = 0; i < angles.length; i++) {
  angles[i] += angleToUpdate[i];
}
  

  for (let i = 0; i < meshes.length - 1; i++) {
    meshes[i].rotation.y += axisToUpdate[i];
    meshes[i + 1].position.x = Math.cos(angles[i]) * meshPositions[i];
    meshes[i + 1].position.z = Math.sin(angles[i]) * meshPositions[i];
  
  }
  
  
  renderer.render(scene, camera);
}

animate();