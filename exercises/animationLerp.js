import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js'
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initDefaultSpotlight,
        initCamera,
        createGroundPlane,
        onWindowResize} from "../libs/util/util.js";

let scene    = new THREE.Scene();    // Create main scene
let renderer = initRenderer();    // View function in util/utils
let light    = initDefaultSpotlight(scene, new THREE.Vector3(7.0, 7.0, 7.0)); 
let camera   = initCamera(new THREE.Vector3(3.6, 4.6, 8.2)); // Init camera in this position
let trackballControls = new TrackballControls(camera, renderer.domElement );

// Show axes 
let axesHelper = new THREE.AxesHelper( 5 );
  axesHelper.translateY(0.1);
scene.add( axesHelper );

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

let groundPlane = createGroundPlane(10, 10, 40, 40); // width, height, resolutionW, resolutionH
  groundPlane.rotateX(THREE.MathUtils.degToRad(-90));
scene.add(groundPlane);

let initialBall1 = new THREE.Vector3(-3,0.2,2);
let initialBall2 = new THREE.Vector3(-3,0.2,-2);

// Create sphere
let geometry = new THREE.SphereGeometry( 0.2, 32, 16 );
let material = new THREE.MeshPhongMaterial({color:"red", shininess:"200"});
let ball1 = new THREE.Mesh(geometry, material);
  ball1.castShadow = true;
  ball1.position.copy(initialBall1);
scene.add(ball1);

let ball2 = new THREE.Mesh(geometry, material);
  ball2.castShadow = true;
  ball2.position.copy(initialBall2);
scene.add(ball2);

// Variables that will be used for linear interpolation
const moveConfig = {
  destination1: new THREE.Vector3(4, 0.2, 2),
  destination2: new THREE.Vector3(4, 0.2, -2),
  alpha1: 0.02,
  alpha2: 0.01,
  move1: false,
  move2: false
}

buildInterface();
render();

function buildInterface()
{   
  var controls = new function ()
  {
    this.animationBall1 = function(){
     moveConfig.move1 = true;
    };

    this.animationBall2 = function(){
      moveConfig.move2 = true;
    };

    this.reset = function(){
      ball1.position.copy(initialBall1);
      ball2.position.copy(initialBall2);
      moveConfig.move1 = false;
      moveConfig.move2 = false;
    };

  };
  let gui = new GUI();
  let folder = gui.addFolder("Move Options");
    folder.open();
    folder.add(controls, 'animationBall1',true).name("Esfera 1");
    folder.add(controls, 'animationBall2',true).name("Esfera 2");
    folder.add(controls, 'reset',true).name("Reset");


}

function render()
{
  trackballControls.update();
  if(moveConfig.move1) ball1.position.lerp(moveConfig.destination1, moveConfig.alpha1);
  if(moveConfig.move2) ball2.position.lerp(moveConfig.destination2, moveConfig.alpha2);
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}