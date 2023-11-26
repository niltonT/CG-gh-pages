import * as THREE from  'three';

import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
//scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
//scene.add(plane);

let loader = new THREE.TextureLoader();
function setMaterial(color, file = null, repeatU = 1, repeatV = 1,offsetX = 0,offsetY = 0){
  if(!color) color = 'rgb(255,255,255)';

  let mat;
  if(!file){
    mat = new THREE.MeshBasicMaterial ({color:color});
  } else {
    mat = new THREE.MeshBasicMaterial({ map: loader.load(file),color:color});
    mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
    mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;
    mat.map.repeat.set(repeatU,repeatV); 
    mat.map.offset.x = offsetX;
    mat.map.offset.y = offsetY;
  }
  return mat;
}

let repeat = 0.33333;

let materials = [setMaterial(null,"../assets/textures/tiles.jpg",repeat,repeat,0.66667,0),
                 setMaterial(null,"../assets/textures/tiles.jpg",repeat,repeat,0,0.33333),
                 setMaterial(null,"../assets/textures/tiles.jpg",repeat,repeat,0,0.66667),
                 setMaterial(null,"../assets/textures/tiles.jpg",repeat,repeat,0.33333,0),
                 setMaterial(null,"../assets/textures/tiles.jpg",repeat,repeat,0.33333,0.33333),
                 setMaterial(null,"../assets/textures/tiles.jpg",repeat,repeat,0.33333,0.66667)];

let cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
let cube = new THREE.Mesh(cubeGeometry, materials);
scene.add(cube);

// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}