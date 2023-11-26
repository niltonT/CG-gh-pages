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

let materials = [setMaterial(null,"../assets/textures/wood.png"),
                 setMaterial(null,"../assets/textures/woodtop.png"),
                 setMaterial(null,"../assets/textures/woodtop.png")];


let geometry = new THREE.CylinderGeometry( 2, 2, 8, 32 );
let cylinder = new THREE.Mesh(geometry,materials);
scene.add(cylinder);

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