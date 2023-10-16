import * as THREE from  'three';
import { OrbitControls } from '/../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        degreesToRadians} from "/../libs/util/util.js";
import { Rebatedor } from '../obj/rebatedor.js';
import { createBall } from '../libs/util.js';


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

const X = 2;
const Y = 2;
const Z = 6;

let rebatedor = new Rebatedor(1,1,'blue');
let obj = rebatedor.obj;
obj.translateY(Y);
obj.translateZ(Z);
obj.rotateY(degreesToRadians(90));
scene.add(obj);


let ball = createBall(0.3,'yellow');
ball.translateY(Y);
ball.rotateY(degreesToRadians(180));
scene.add(ball);


// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();



  
let inferior = new THREE.Vector3(9,Y,Z);
let superior = new THREE.Vector3(-9,Y,Z);
let alpha = 0.005;
let positivo = true;
  
render();
function render()
{

  if(positivo){
    if(ball.position.x < inferior.x - 1){
      ball.position.lerp(inferior,alpha);
    }else{
      positivo = false;
    }
  }else{
    if(ball.position.x > superior.x + 1){
      ball.position.lerp(superior,alpha);
    }else{
      positivo = true;
    }
  }

  if(rebatedor.checkCollision(ball,0.3)){
    rebatedor.obj.material.color = new THREE.Color('darkslategrey');
  }else{
    rebatedor.obj.material.color = new THREE.Color('blue');
  }

  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}


