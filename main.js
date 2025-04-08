/* Imports */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


/* Constants to set up the 3D scene with stars, images, and camera animation*/
const scene = new THREE.Scene();
const rotatingGroup = new THREE.Group();
scene.add(rotatingGroup);
const twinklingStars = [];
let twinklingCoefficient = 0.003;
const shootingStars = [];
const clickablePlanes = [];
let targetCameraPos = null;
let targetLookAt = null;
let chillMode = true;
let rotationSpeed = 0.0002;
let rotationDirection = Math.random() < 0.5 ? 1 : -1;

const imageFilenames = [
  "images/aquarium.jpeg",
  "images/aquariumselfie.jpeg",
  "images/aquariumstanding.jpeg",
  "images/aranscary.jpeg",
  "images/babycow.jpeg",
  "images/cafe.jpeg",
  "images/canteen.jpeg",
  "images/cheers.jpeg",
  "images/cidermill.jpeg",
  "images/colddate.jpeg",
  "images/colddate2.jpeg",
  "images/condado.jpeg",
  "images/elevator.jpeg",
  "images/floormeal.jpeg",
  "images/funnyselfie.jpeg",
  "images/gardens.jpeg",
  "images/hajilane.jpeg",
  "images/icecream.jpeg",
  "images/iceskating.jpeg",
  "images/lineleap.jpeg",
  "images/littleindia.jpeg",
  "images/livebar.jpeg",
  "images/mickeyds.jpeg",
  "images/monkeycostume.jpeg",
  "images/msubar.jpeg",
  "images/nicephototypeshit.jpeg",
  "images/photobooth.jpeg",
  "images/rainygame.jpeg",
  "images/rooftop.jpeg",
  "images/sentosa.jpeg",
  "images/shark.jpeg",
  "images/shreyaparty.jpeg",
  "images/sillyinbar.jpeg",
  "images/skeeps.jpeg",
  "images/tailgate.jpeg",
  "images/whitelie.jpeg",
  "images/zwestselfie.jpeg"
  ]

/* Renderer draws the scene on the canvas */
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 20;


const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

/* Responsive sizing to browser */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* OrbitControls allow for camera movement when the user clicks, drags, zooms, etc */
const controls = new OrbitControls(camera, renderer.domElement);

/* Set the camera to look at the center of the scene when the reset button is clicked */
const initialCameraPos = camera.position.clone();
const initialTarget = controls.target.clone();
document.getElementById('resetButton').addEventListener('click', () => {
    targetCameraPos = initialCameraPos.clone();
    targetLookAt = initialTarget.clone();
  });

/* Add event listener to handle clicks on the toggle button */
document.getElementById('chilltogglecontainer').addEventListener('click', () => {
  chillMode = !chillMode;

  const circle = document.getElementById('chilltogglecircle');
  const container = document.getElementById('chilltogglecontainer');

  if (chillMode) {
    rotationSpeed = 0.0002;
    twinklingCoefficient = 0.003;
    rotationDirection = Math.random() < 0.5 ? 1 : -1;
    circle.style.left = '3px';
    circle.textContent = '✨';

    container.style.background = 'rgba(173, 216, 230, 0.7)';
    circle.style.background = 'rgba(135, 206, 250, 0.7)';
  } else {
    rotationSpeed = 0.0015;
    twinklingCoefficient = 0.008;
    rotationDirection = Math.random() < 0.5 ? 1 : -1;
    circle.style.left = '31px';
    circle.textContent = '🔥';

    container.style.background = 'rgba(255, 165, 0, 0.7)';
    circle.style.background = 'rgba(255, 140, 0, 0.7)';
  }
});


/* Pointlight adds depth and shadows from one direction, and ambient light helps us avoid total darkness */
const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);


/* Create the stars with random colors, sizes, and positions */
function addStar() {
    
  const radius = THREE.MathUtils.randFloat(0.5, 0.75);
  const geometry = new THREE.SphereGeometry(radius, 12, 12);
  const starColors = [0xffffff, 0xfff0a5, 0xa5cfff, 0xffb3f3];
  const color = starColors[Math.floor(Math.random() * starColors.length)];

  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: Math.random() * 0.8 + 0.2
  });

  const star = new THREE.Mesh(geometry, material);
  //spread is the range of random positions for the stars
  const spread = 900;
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(spread));
  star.position.set(x, y, z);
  rotatingGroup.add(star);


  twinklingStars.push({ mesh: star, baseIntensity: material.emissiveIntensity });
}

Array(400).fill().forEach(addStar);

/* Function to randomly spawn shooting stars */
function spawnShootingStar() {
  const geometry = new THREE.SphereGeometry(0.15, 8, 8);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 3
  });

  const star = new THREE.Mesh(geometry, material);

  const start = new THREE.Vector3(
    THREE.MathUtils.randFloat(-500, 500),
    THREE.MathUtils.randFloat(200, 300),
    THREE.MathUtils.randFloat(-500, 500)
  );

  const end = start.clone().add(new THREE.Vector3(
    THREE.MathUtils.randFloat(100, 300),
    THREE.MathUtils.randFloat(-300, -400),
    THREE.MathUtils.randFloat(-100, -200)
  ));

  star.position.copy(start);
  scene.add(star);

  shootingStars.push({
    mesh: star,
    start,
    end,
    progress: 0
  });
}



/* Create a plane for each image and places these planes randomly in space*/
function addImagePlane(url) {
    const loader = new THREE.TextureLoader();
  
    loader.load(url, (texture) => {
      const imageAspect = texture.image.height / texture.image.width;
      const baseWidth = 8;
      const width = baseWidth;
      const height = baseWidth * imageAspect;
  
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const plane = new THREE.Mesh(geometry, material);
  
      const spread = 300;
      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(spread));
      plane.position.set(x, y, z);
      plane.lookAt(0, 0, 0);
  
      scene.add(plane);
      clickablePlanes.push(plane);
    });
  }

let textMesh = null;

/* Load the font and create the text mesh "Ilakiya" */
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/optimer_regular.typeface.json', function (font) {
  const textGeometry = new TextGeometry('Ilakiya', {
    font: font,
    size: 3,
    height: 1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.1,
    bevelSegments: 3,
  });

  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0xff66cc,
    emissive: 0xff66cc,
    emissiveIntensity: 1
  });

  textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textGeometry.computeBoundingBox();
  const centerOffsetX = -(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x) / 2;
  const centerOffsetY = -(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y) / 2;
  textMesh.position.set(centerOffsetX, centerOffsetY, 0);

  scene.add(textMesh);
  imageFilenames.forEach(addImagePlane);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/* Add event listener to handle clicks on the planes. When the user clicks and image it will gently float to the image */

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickablePlanes);

  if (intersects.length > 0) {
    const target = intersects[0].object;

    // Fix direction: rotate 180 degrees to face the front of the plane
    const direction = new THREE.Vector3();
    target.getWorldDirection(direction);
    const offset = direction.multiplyScalar(10);

    targetCameraPos = new THREE.Vector3().copy(target.position).add(offset);
    targetLookAt = new THREE.Vector3().copy(target.position);
  }
});

/* Animation loop:
    1. Call animate on the next frame to create a loop
    2. Spawn a shooting star with a small probability
    3. Update the orbit controls to keep the camera in sync with the mouse
    4. Update the shooting stars' positions and remove them when they reach their end position
    5. Make the stars twinkle by adjusting their emissive intensity
    6. Make the "Ilakiya" text float up and down
    7. If the user clicks an image, move the camera and look at the image
    8. If the camera is close to the initial position, hide the reset button
    9. Display the toggle button to switch between modes
    10. Rotate the group of stars based
    11. Draw the scene with the camera
*/

function animate() {
  //1
  requestAnimationFrame(animate);

  //2
  if (Math.random() < 0.003) { 
    spawnShootingStar();
  }

  //3
  controls.update();

  //4
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    star.progress += 0.01;

    star.mesh.position.lerpVectors(star.start, star.end, star.progress);

    star.mesh.material.emissiveIntensity = 3 * (1 - star.progress);

    if (star.progress >= 1) {
      scene.remove(star.mesh);
      shootingStars.splice(i, 1);
    }
  }


  //5
  const time = Date.now() * twinklingCoefficient;
  twinklingStars.forEach(({ mesh, baseIntensity }, index) => {
    mesh.material.emissiveIntensity = baseIntensity + Math.sin(time + index) * 0.3;
  });

  //6
  if (textMesh) {
    textMesh.position.y = Math.sin(Date.now() * 0.001) * 0.5;
  }

  //7
  if (targetCameraPos && targetLookAt) {
    camera.position.lerp(targetCameraPos, 0.02);
    controls.target.lerp(targetLookAt, 0.02);
    controls.update();

    if (camera.position.distanceTo(targetCameraPos) < 0.1) {
      targetCameraPos = null;
      targetLookAt = null;
    }
  }

  //8
  if (camera.position.distanceTo(initialCameraPos) > 0.5) {
    document.getElementById('resetButton').style.display = 'block';
  } else {
    document.getElementById('resetButton').style.display = 'none';
  }

  //9
  document.getElementById('chilltogglecircle').style.display = 'block';

  //10
  rotatingGroup.rotation.x += (rotationDirection * rotationSpeed);
  rotatingGroup.rotation.y += (rotationDirection * rotationSpeed);
  
  //11
  renderer.render(scene, camera);
}

animate();
