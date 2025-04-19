/* Imports */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


/* Constants and variables to set up the 3D scene with stars, images, and camera animation*/
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
let presentationAudio = null;
let presentationQueue = [];
let isPresenting = false;
let selectedSongs = [];
let selectedButtons = [];
let currentSongIndex = 0;
const clock = new THREE.Clock();
let isTransitioning = false;


const imageFilenames = [
  "images/anshdormparty.jpeg",
  "images/aquarium.jpeg",
  "images/aquariumselfie.jpeg",
  "images/aquariumstanding.jpeg",
  "images/aranscary.jpeg",
  "images/babycow.jpeg",
  "images/bdubs.jpeg",
  "images/bears.jpeg",
  "images/birthdaycook.jpeg",
  "images/blurrylivepicture.jpeg",
  "images/cafe.jpeg",
  "images/canteen.jpeg",
  "images/carselfie.jpeg",
  "images/cheers.jpeg",
  "images/cidermill.jpeg",
  "images/colddate.jpeg",
  "images/colddate2.jpeg",
  "images/colddate3.jpeg",
  "images/condado.jpeg",
  "images/cornfield.jpeg",
  "images/daveshotchicken.jpeg",
  "images/detroit.jpeg",
  "images/elevator.jpeg",
  "images/firstfrat.jpeg",
  "images/firstmeeting.jpeg",
  "images/floormeal.jpeg",
  "images/freshmanfootballgame.jpeg",
  "images/funnyselfie.jpeg",
  "images/gardens.jpeg",
  "images/glasses.jpeg",
  "images/hahahahahablurrypicture.jpeg",
  "images/hajilane.jpeg",
  "images/hat.jpeg",
  "images/icecream.jpeg",
  "images/iceskating.jpeg",
  "images/inthecar.jpeg",
  "images/joes.jpeg",
  "images/kinesebereal.jpeg",
  "images/lineleap.jpeg",
  "images/littleindia.jpeg",
  "images/livebar.jpeg",
  "images/luckyandhaley.jpeg",
  "images/malaysia.jpeg",
  "images/mickeyds.jpeg",
  "images/monkeycostume.jpeg",
  "images/msubar.jpeg",
  "images/msuselfie.jpeg",
  "images/mum.jpeg",
  "images/namaste.jpeg",
  "images/nicephototypeshit.jpeg",
  "images/onthestreet.jpeg",
  "images/outsiderocketfizz.jpeg",
  "images/outsideross.jpeg",
  "images/pasta.jpeg",
  "images/photobombed.jpeg",
  "images/photobooth.jpeg",
  "images/rainygame.jpeg",
  "images/rakiluckyram.jpeg",
  "images/rangnight.jpeg",
  "images/redlips.jpeg",
  "images/redtoungues.jpeg",
  "images/rooftop.jpeg",
  "images/sentosa.jpeg",
  "images/shark.jpeg",
  "images/shreyaparty.jpeg",
  "images/sillyinbar.jpeg",
  "images/sillyinbar2.jpeg",
  "images/skeeps.jpeg",
  "images/sleep.jpeg",
  "images/snap.jpeg",
  "images/southbasement.jpeg",
  "images/studyinross.jpeg",
  "images/tailgate.jpeg",
  "images/tailgate2.jpeg",
  "images/tomatocurry.jpeg",
  "images/tomatocurry2.jpeg",
  "images/whitelie.jpeg",
  "images/zwestselfie.jpeg"
]


let imagesLoaded = 0;
const totalImages = imageFilenames.length;
let readyForPresentation = false;

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
  isPresenting = false;
  presentationQueue = [];
  selectedSongs = [];
  selectedButtons = [];

  // Remove overlays
  songButtons.forEach((btn) => {
    const overlay = btn.querySelector('.songOrder');
    if (overlay) overlay.remove();
  });

  // Stop music if playing
  if (presentationAudio) {
    presentationAudio.pause();
    presentationAudio.currentTime = 0;
  }
  targetCameraPos = initialCameraPos.clone();
  targetLookAt = initialTarget.clone();
  document.getElementById('skip').style.display = 'none';
  document.getElementById('startPresentation').classList.add('hidden');
});

/*Configure comet themed mouse cursor*/
const cursor = document.getElementById('cursor-dot');
document.addEventListener('mousemove', (e) => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

const trailLength = 15;
const trail = [];

document.addEventListener('mousemove', (e) => {
  const trailDot = document.createElement('div');
  trailDot.className = 'trail-dot';
  trailDot.style.left = `${e.clientX}px`;
  trailDot.style.top = `${e.clientY}px`;
  document.body.appendChild(trailDot);
  trail.push(trailDot);

  if (trail.length > trailLength) {
    const oldDot = trail.shift();
    oldDot.remove();
  }
});



/* Add event listener to handle clicks on the toggle button */
document.getElementById('chilltogglecontainer').addEventListener('click', () => {
  chillMode = !chillMode;

  const circle = document.getElementById('chilltogglecircle');
  const container = document.getElementById('chilltogglecontainer');
  const shuffleButton = document.getElementById('shuffle');
  const presentationButton = document.getElementById('presentation');
  const skipButton = document.getElementById('skip');

  if (chillMode) {
    rotationSpeed = 0.0002;
    twinklingCoefficient = 0.003;
    rotationDirection = Math.random() < 0.5 ? 1 : -1;
    circle.style.left = '3px';
    circle.textContent = '✨';

    shuffleButton.style.background = 'rgba(173, 216, 230, 0.7)';
    container.style.background = 'rgba(173, 216, 230, 0.7)';
    circle.style.background = 'rgba(135, 206, 250, 0.7)';
    presentationButton.style.background = 'rgba(173, 216, 230, 0.7)';
    skipButton.style.background = 'rgba(173, 216, 230, 0.7)';
  } 
  else {
    rotationSpeed = 0.0015;
    twinklingCoefficient = 0.008;
    rotationDirection = Math.random() < 0.5 ? 1 : -1;
    circle.style.left = '31px';
    circle.textContent = '🪩';

    shuffleButton.style.background = 'rgba(255, 165, 0, 0.7)';
    container.style.background = 'rgba(255, 165, 0, 0.7)';
    circle.style.background = 'rgba(255, 140, 0, 0.7)';
    presentationButton.style.background = 'rgba(255, 165, 0, 0.7)';
    skipButton.style.background = 'rgba(255, 165, 0, 0.7)';
  }
});


/* Add event listener for shuffle button */
document.getElementById('shuffle').addEventListener('click', () => {
  if (clickablePlanes.length === 0) return;
  const target = clickablePlanes[Math.floor(Math.random() * clickablePlanes.length)];
  const direction = new THREE.Vector3();
  target.getWorldDirection(direction);
  const offset = direction.multiplyScalar(10);
  targetCameraPos = new THREE.Vector3().copy(target.position).add(offset);
  targetLookAt = new THREE.Vector3().copy(target.position);
});

/* Add event listener for presentation close button */
const presentationScreen = document.getElementById("presentationScreen");
const presentationClose = document.getElementById("presentationClose");
presentationClose.addEventListener("click", () => {
  presentationScreen.classList.add("hidden");
  presentationScreen.classList.remove("show");
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    presentationScreen.classList.add('hidden');
    presentationScreen.classList.remove('show');
  }
  else if (event.key === 'Enter') {
    presentationScreen.classList.add('hidden');
    presentationScreen.classList.remove('show');

    currentSongIndex = 0;
    presentationAudio = new Audio(selectedSongs[currentSongIndex]);
    presentationAudio.play();
    presentationAudio.addEventListener('ended', () => {
      playNextSongInQueue();
    });

    const waitUntilReady = () => {
      if (readyForPresentation) {
        startPresentationMode();
      } else {
        setTimeout(waitUntilReady, 100);
      }
    };
    waitUntilReady();
  }
});

/* Add event listener for presentation start button */
document.getElementById('startPresentation').addEventListener('click', () => {
  document.getElementById('presentationScreen').classList.add('hidden');

  currentSongIndex = 0;
  presentationAudio = new Audio(selectedSongs[currentSongIndex]);
  presentationAudio.play();
  presentationAudio.addEventListener('ended', () => {
    playNextSongInQueue();
  });

  const waitUntilReady = () => {
    if (readyForPresentation) {
      startPresentationMode();
    } else {
      setTimeout(waitUntilReady, 100);
    }
  };
  waitUntilReady();
});

/* Add event listener for presentation button */
document.getElementById('presentation').addEventListener('click', () => {
  //If already presenting, we want to reset everything
  if (isPresenting) {
    isPresenting = false;
    presentationQueue = [];
    selectedSongs = [];
    selectedButtons = [];

    songButtons.forEach((btn) => {
      const overlay = btn.querySelector('.songOrder');
      if (overlay) overlay.remove();
    });

    if (presentationAudio) {
      presentationAudio.pause();
      presentationAudio.currentTime = 0;
    }

    targetCameraPos = initialCameraPos.clone();
    targetLookAt = initialTarget.clone();
    document.getElementById('skip').style.display = 'none';
  }
  presentationScreen.classList.remove('hidden');
  document.getElementById('startPresentation').classList.remove('hidden');
});

/* logic for presentation mode */
function updateSongLabels() {
  songButtons.forEach((btn) => {
    const overlay = btn.querySelector('.songOrder');
    if (overlay) overlay.remove();
  });

  selectedButtons.forEach((btn, i) => {
    const overlay = document.createElement('div');
    overlay.className = 'songOrder';
    overlay.textContent = `${i + 1}`;
    btn.appendChild(overlay);
  });
}


function playNextSongInQueue() {
  if (selectedSongs.length === 0) return;

  currentSongIndex = (currentSongIndex + 1) % selectedSongs.length;

  presentationAudio = new Audio(selectedSongs[currentSongIndex]);
  presentationAudio.play();
  presentationAudio.addEventListener('ended', playNextSongInQueue);
}

const songButtons = document.querySelectorAll('.songChoice');

songButtons.forEach(button => {
  button.addEventListener('click', () => {
    const songSrc = button.dataset.src;
    const index = selectedSongs.indexOf(songSrc);

    if (index !== -1) {
      // Song already selected: unselect
      selectedSongs.splice(index, 1);
      selectedButtons.splice(index, 1);
      updateSongLabels();
    } else if (selectedSongs.length < 18) {
      selectedSongs.push(songSrc);
      selectedButtons.push(button);
      updateSongLabels();

      if (selectedSongs.length === 18) {
        // Hide the menu and start presentation after short delay
        setTimeout(() => {
          document.getElementById('presentationScreen').classList.add('hidden');
          currentSongIndex = 0;
          presentationAudio = new Audio(selectedSongs[currentSongIndex]);
          presentationAudio.play();
          presentationAudio.addEventListener('ended', () => {
            playNextSongInQueue();
          });
          const waitUntilReady = () => {
            if (readyForPresentation) {
              startPresentationMode();
            } else {
              setTimeout(waitUntilReady, 100);
            }
          };
          waitUntilReady();
        }, 500);
      }
    }
  });
});


function startPresentationMode() {
  if (clickablePlanes.length === 0) return;

  //first return to initial position
  targetCameraPos = initialCameraPos.clone();
  targetLookAt = initialTarget.clone();
  // Create shuffled queue of image planes
  presentationQueue = [...clickablePlanes];
  for (let i = presentationQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [presentationQueue[i], presentationQueue[j]] = [presentationQueue[j], presentationQueue[i]];
  }

  isPresenting = true;
  document.getElementById('skip').style.display = 'flex';
  goToNextImage();
}

function goToNextImage() {
  if (!isPresenting) {
    isPresenting = false;
    return;
  }
  if(presentationQueue.length === 0){
    targetCameraPos = initialCameraPos.clone();
    targetLookAt = initialTarget.clone();
    isPresenting = false;
    document.getElementById('skip').style.display = 'none';
    return;
  }

  const target = presentationQueue.shift();

  const direction = new THREE.Vector3();
  target.getWorldDirection(direction);
  const offset = direction.multiplyScalar(10);

  targetCameraPos = new THREE.Vector3().copy(target.position).add(offset);
  targetLookAt = new THREE.Vector3().copy(target.position);

  // Wait ~11 seconds then go to next
  setTimeout(goToNextImage, 11000);
}

document.getElementById('skip').addEventListener('click', () => {
  //When clicked, we skip to the next song in the queue
  if (presentationAudio) {
    presentationAudio.pause();
    presentationAudio.currentTime = 0;

    currentSongIndex = (currentSongIndex + 1) % selectedSongs.length;
    presentationAudio = new Audio(selectedSongs[currentSongIndex]);
    presentationAudio.loop = true;
    presentationAudio.play();
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
  const spread = 1000;
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
  
      const spread = 850;
      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(spread));
      plane.position.set(x, y, z);
      plane.lookAt(0, 0, 0);
  
      scene.add(plane);
      clickablePlanes.push(plane);
      scene.add(plane);

      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        readyForPresentation = true;
      }
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
  // If in presentation mode, do not allow clicking on images
  if (isPresenting) {
    return;
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickablePlanes);

  if (intersects.length > 0) {
    const target = intersects[0].object;
    controls.target.copy(controls.target);

    const direction = new THREE.Vector3();
    target.getWorldDirection(direction);
    const offset = direction.multiplyScalar(10);

    targetCameraPos = new THREE.Vector3().copy(target.position).add(offset);
    targetLookAt = new THREE.Vector3().copy(target.position);

    isTransitioning = true;
    clock.getDelta();
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
    // let lerpSpeed = isPresenting ? 0.01 : 0.02;
    // camera.position.lerp(targetCameraPos, lerpSpeed);
    // controls.target.lerp(targetLookAt, lerpSpeed);

    const delta = clock.getDelta();
    const speedPerSecond = 10.0;
    const alpha = 1 - Math.pow(1 - 0.1, delta * speedPerSecond);
    let lerpSpeed = isPresenting ? (alpha / 2): alpha / 2;

    camera.position.set(
      THREE.MathUtils.lerp(camera.position.x, targetCameraPos.x, lerpSpeed),
      THREE.MathUtils.lerp(camera.position.y, targetCameraPos.y, lerpSpeed),
      THREE.MathUtils.lerp(camera.position.z, targetCameraPos.z, lerpSpeed)
    );
  
    controls.target.set(
      THREE.MathUtils.lerp(controls.target.x, targetLookAt.x, lerpSpeed),
      THREE.MathUtils.lerp(controls.target.y, targetLookAt.y, lerpSpeed),
      THREE.MathUtils.lerp(controls.target.z, targetLookAt.z, lerpSpeed)
    );
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
