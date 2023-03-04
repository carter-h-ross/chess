/* 3d model credits:

chess board: "Chess Board" (https://skfb.ly/6SAZ9) by danielpaulse is licensed under Creative Commons Attribution-ShareAlike (http://creativecommons.org/licenses/by-sa/4.0/).

*/

// function to help with radians
function degToRad(degrees) {
  var radians = degrees * (Math.PI / 180);
  return radians;
}

// variables used for js game logic
class Spot {
  constructor(r,c,id) {
    this.r = r;
    this.c = c;
    this.id = id;
    this.team = id[0];
    this.piece = id[1];
  }
}
var board = [
  // row 0
  [new Spot(0,0,"-="), new Spot(0,1,"-="), new Spot(0,2,"-="), new Spot(0,3,"-="),
   new Spot(0,4,"-="), new Spot(0,5,"-="), new Spot(0,6,"-="), new Spot(0,7,"-="),],
  // row 1
  [new Spot(1,0,"-="), new Spot(1,1,"-="), new Spot(1,2,"-="), new Spot(1,3,"-="),
   new Spot(1,4,"-="), new Spot(1,5,"-="), new Spot(1,6,"-="), new Spot(1,7,"-="),],
  // row 2
  [new Spot(2,0,"-="), new Spot(2,1,"-="), new Spot(2,2,"-="), new Spot(2,3,"-="),
   new Spot(2,4,"-="), new Spot(2,5,"-="), new Spot(2,6,"-="), new Spot(2,7,"-="),],
  // row 3
  [new Spot(3,0,"-="), new Spot(3,1,"-="), new Spot(3,2,"-="), new Spot(3,3,"-="),
   new Spot(3,4,"-="), new Spot(3,5,"-="), new Spot(3,6,"-="), new Spot(3,7,"-="),],
  // row 4
  [new Spot(4,0,"-="), new Spot(4,1,"-="), new Spot(4,2,"-="), new Spot(4,3,"-="),
   new Spot(4,4,"-="), new Spot(4,5,"-="), new Spot(4,6,"-="), new Spot(4,7,"-="),],
  // row 5
  [new Spot(5,0,"-="), new Spot(5,1,"-="), new Spot(5,2,"-="), new Spot(5,3,"-="),
   new Spot(5,4,"-="), new Spot(5,5,"-="), new Spot(5,6,"-="), new Spot(5,7,"-="),],
  // row 6
  [new Spot(6,0,"-="), new Spot(6,1,"-="), new Spot(6,2,"-="), new Spot(6,3,"-="),
   new Spot(6,4,"-="), new Spot(6,5,"-="), new Spot(6,6,"-="), new Spot(6,7,"-="),],
  // row 7
  [new Spot(7,0,"-="), new Spot(7,1,"-="), new Spot(7,2,"-="), new Spot(7,3,"-="),
   new Spot(7,4,"-="), new Spot(7,5,"-="), new Spot(7,6,"-="), new Spot(7,7,"-="),],
];

const opp = {
  "b" : "w",
  "w" : "b",
}

// game logic functions
function isCheck(r,c,b /* board row and collumn to be checked */) {

}

/*-------------------------------------- three js section ---------------------------------------*/

// threejs imports
import "./style.css"
import * as THREE from '/node_modules/three';
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "/node_modules/three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const gltfLoader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;
camera.position.y = 2;

// grid helper for development purposes ** remove when done **
const grid = new THREE.GridHelper(40,40);
scene.add(grid);

// orbit controls
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

// axes helper 
const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

// ambient scene light
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight);

// background 
const background_texture = new THREE.TextureLoader().load("white_background.jpeg");
scene.background = background_texture;

const BoxGeometry = new THREE.BoxGeometry();
const BoxMaterial = new THREE.MeshStandardMaterial( {color: 0x0000ff} );
const box = new THREE.Mesh(BoxGeometry, BoxMaterial);
scene.add(box);

gltfLoader.load("/chess_board/scene.gltf", function(gltf) {
  const model = gltf.scene;
  scene.add(model);
  model.position.set(0,0,0)
}, undefined, function(error) {
  console.error(error);
});

function animate() {
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);