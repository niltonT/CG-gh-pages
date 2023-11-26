import * as THREE from  'three';
import KeyboardState from '../libs/util/KeyboardState.js'
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

const Z = 10;

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 0, Z)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene,true,new THREE.Vector3(0,0,Z)); // Create a basic light to illuminate the scene
//orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

let keyboard = new KeyboardState();



let loader = new THREE.TextureLoader();
function setMaterial(color, file = null, repeatU = 1, repeatV = 1){
  if(!color) color = 'rgb(255,255,255)';

  let mat;
  if(!file){
    mat = new THREE.MeshBasicMaterial ({color:color});
  } else {
    mat = new THREE.MeshBasicMaterial({ map: loader.load(file),color:color});
    mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
    mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;
    mat.map.repeat.set(repeatU,repeatV); 
  }
  return mat;
}

let top = "../assets/textures/NormalMapping/crossTop.png";
let side = "../assets/textures/NormalMapping/crossSide.png";
let tex = "../assets/textures/NormalMapping/cross.png";
let nmap = "../assets/textures/NormalMapping/crossNormal.png";

let materials = [
                setMaterial(null,side),
                setMaterial(null,side),
                setMaterial(null,top),
                setMaterial(null,top),
                new THREE.MeshPhongMaterial({
                  map: new THREE.TextureLoader().load(tex),
                  normalMap: new THREE.TextureLoader().load(nmap)
                }
                ),
                new THREE.MeshPhongMaterial({
                  map: new THREE.TextureLoader().load(tex),
                  normalMap: new THREE.TextureLoader().load(nmap)
                }
                )
];


let cubeGeometry = new THREE.BoxGeometry(5, 5, 0.5);
let cube = new THREE.Mesh(cubeGeometry,materials);
scene.add(cube);


function keyboardUpdate() {

  keyboard.update();

     var rotate = 0.1; 

     if ( keyboard.pressed("A") ) cube.rotateY(-rotate);
     if ( keyboard.pressed("D") ) cube.rotateY(rotate);
     if ( keyboard.pressed("W") ) cube.rotateX(rotate);
     if ( keyboard.pressed("S") ) cube.rotateX(-rotate);

}

render();

function render()
{
  requestAnimationFrame(render);
  keyboardUpdate();
  renderer.render(scene, camera) // Render scene
}