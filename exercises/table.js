import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        degreesToRadians} from "../libs/util/util.js";

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
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

let cubeGeometry = new THREE.BoxGeometry(11, 6, 0.2);
let cube = new THREE.Mesh(cubeGeometry, material);
scene.add(cube);

cube.translateY(3);
cube.rotateX(degreesToRadians(90));

let cylinderGeometry = new THREE.CylinderGeometry(0.2,0.2,3,32);
let cylinderMaterial = setDefaultMaterial();

let cylinder1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
let cylinder2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
let cylinder3 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
let cylinder4 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

scene.add(cylinder1);
scene.add(cylinder2);
scene.add(cylinder3);
scene.add(cylinder4);

cylinder1.translateY(1.5);
cylinder2.translateY(1.5);
cylinder3.translateY(1.5);
cylinder4.translateY(1.5);

cylinder1.translateZ(2.7);
cylinder2.translateZ(2.7);
cylinder3.translateZ(-2.7);
cylinder4.translateZ(-2.7);

cylinder1.translateX(5.2);
cylinder2.translateX(-5.2);
cylinder3.translateX(-5.2);
cylinder4.translateX(5.2);


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