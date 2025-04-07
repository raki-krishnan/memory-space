/* Imports */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


/* Constants to set up the 3D scene with stars, images, and camera animation*/
const scene = new THREE.Scene();
const twinklingStars = [];
const clickablePlanes = [];
let targetCameraPos = null;
let targetLookAt = null;

const imageFilenames = [
    'images/shark.jpeg',
    'images/littleindia.jpeg',
    'images/sillyinbar.jpeg',
];

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


/* Pointlight adds depth and shadows from one direction, and ambient light helps us avoid total darkness */
const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);


/* Create the stars with random colors, sizes, and positions */
function addStar() {
  const geometry = new THREE.SphereGeometry(0.2, 12, 12);
  const starColors = [0xffffff, 0xfff0a5, 0xa5cfff, 0xffb3f3];
  const color = starColors[Math.floor(Math.random() * starColors.length)];

  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: Math.random() * 0.8 + 0.2
  });

  const star = new THREE.Mesh(geometry, material);
  const spread = 300;
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(spread));
  star.position.set(x, y, z);
  scene.add(star);

  twinklingStars.push({ mesh: star, baseIntensity: material.emissiveIntensity });
}

Array(400).fill().forEach(addStar);


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

  const centerOffset = (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x) / 2;
  textMesh.position.set(-centerOffset, 0, 0);

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
    2. Update the orbit controls to keep the camera in sync with the mouse
    3. Make the stars twinkle by adjusting their emissive intensity
    4. Make the "Ilakiya" text float up and down
    5. If the user clicks an image, move the camera and look at the image
    6. Draw the scene with the camera
*/

function animate() {
  //1
  requestAnimationFrame(animate);
  //2
  controls.update();

  //3
  const time = Date.now() * 0.002;
  twinklingStars.forEach(({ mesh, baseIntensity }, index) => {
    mesh.material.emissiveIntensity = baseIntensity + Math.sin(time + index) * 0.3;
  });

  //4
  if (textMesh) {
    textMesh.position.y = Math.sin(Date.now() * 0.001) * 0.5;
  }

  //5
  if (targetCameraPos && targetLookAt) {
    camera.position.lerp(targetCameraPos, 0.02);
    controls.target.lerp(targetLookAt, 0.02);
    controls.update();

    if (camera.position.distanceTo(targetCameraPos) < 0.1) {
      targetCameraPos = null;
      targetLookAt = null;
    }
  }

  //6
  renderer.render(scene, camera);
}

animate();