import './style.css'
import * as THREE from 'three';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

THREE.Cache.enabled = true;

let container;

let camera, cameraTarget, scene, renderer;

let group, textMesh1, textMesh2, textGeo, materials;

let firstLetter = true;

let text = 'こんにちはのはの~',

  bevelEnabled = true,

  font = undefined
const height = 20,
  size = 70,
  hover = 30,

  curveSegments = 4,

  bevelThickness = 2,
  bevelSize = 1.5;

const mirror = true;

let targetRotation = 0;
let targetRotationOnPointerDown = 0;

let pointerX = 0;
let pointerXOnPointerDown = 0;

let windowHalfX = window.innerWidth / 2;

init();
animate();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  // CAMERA

  let aspRatio = window.innerWidth / window.innerHeight;
  let fov;
  if (aspRatio > 1) {
    fov = 45;
  } else if (aspRatio > 0.8) {
    fov = 55;
  } else if (aspRatio > 0.6) {
    fov = 70;
  } else if (aspRatio > 0.5) {
    fov = 80;
  } else {
    fov = 90;
  }
  camera = new THREE.PerspectiveCamera(fov, aspRatio, 1, 1500);
  camera.position.set(0, 400, 700);

  cameraTarget = new THREE.Vector3(0, 150, 0);

  // SCENE

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 250, 100);

  // LIGHTS

  const pointLight = new THREE.PointLight(0xffffff, 5, 0, 0);
  pointLight.position.set(0, 100, 500);
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);

  materials = [
    new THREE.MeshPhongMaterial({ color: 0xf28fbc, flatShading: true }), // front
    new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
  ];

  group = new THREE.Group();
  group.position.y = 120;

  scene.add(group);

  loadFont();

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
  );
  plane.position.y = 100;
  plane.rotation.x = - Math.PI / 2;
  scene.add(plane);

  // RENDERER

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // EVENTS

  container.style.touchAction = 'none';
  container.addEventListener('pointerdown', onPointerDown);

  document.addEventListener('keypress', onDocumentKeyPress);
  document.addEventListener('keydown', onDocumentKeyDown);
  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function onDocumentKeyDown(event) {

  if (firstLetter) {

    firstLetter = false;
    text = '';

  }

  const keyCode = event.keyCode;

  // backspace

  if (keyCode == 8) {

    event.preventDefault();

    text = text.substring(0, text.length - 1);
    refreshText();

    return false;

  }

}

function onDocumentKeyPress(event) {

  const keyCode = event.which;

  // backspace

  if (keyCode == 8) {

    event.preventDefault();

  } else {

    const ch = String.fromCharCode(keyCode);
    text += ch;

    refreshText();

  }

}

function loadFont() {

  const loader = new FontLoader();
  loader.load('/fonts/cherry_bomb_one_regular.json', function (response) {

    font = response;

    refreshText();

  });

}

function createText() {

  textGeo = new TextGeometry(text, {

    font: font,

    size: size,
    height: height,
    curveSegments: curveSegments,

    bevelThickness: bevelThickness,
    bevelSize: bevelSize,
    bevelEnabled: bevelEnabled

  });

  textGeo.computeBoundingBox();

  const centerOffset = - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

  textMesh1 = new THREE.Mesh(textGeo, materials);

  textMesh1.position.x = centerOffset;
  textMesh1.position.y = hover;
  textMesh1.position.z = 0;

  textMesh1.rotation.x = 0;
  textMesh1.rotation.y = Math.PI * 2;

  group.add(textMesh1);

  if (mirror) {

    textMesh2 = new THREE.Mesh(textGeo, materials);

    textMesh2.position.x = centerOffset;
    textMesh2.position.y = - hover;
    textMesh2.position.z = height;

    textMesh2.rotation.x = Math.PI;
    textMesh2.rotation.y = Math.PI * 2;

    group.add(textMesh2);

  }

}

function refreshText() {

  group.remove(textMesh1);
  if (mirror) group.remove(textMesh2);

  if (!text) return;

  createText();

}

function onPointerDown(event) {

  if (event.isPrimary === false) return;

  pointerXOnPointerDown = event.clientX - windowHalfX;
  targetRotationOnPointerDown = targetRotation;

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);

}

function onPointerMove(event) {

  if (event.isPrimary === false) return;

  pointerX = event.clientX - windowHalfX;

  targetRotation = targetRotationOnPointerDown + (pointerX - pointerXOnPointerDown) * 0.02;

}

function onPointerUp(event) {

  if (event.isPrimary === false) return;

  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerUp);

}

//

function animate() {

  requestAnimationFrame(animate);

  render();

}

function render() {

  group.rotation.y += (targetRotation - group.rotation.y) * 0.05;

  camera.lookAt(cameraTarget);

  renderer.clear();
  renderer.render(scene, camera);

}
