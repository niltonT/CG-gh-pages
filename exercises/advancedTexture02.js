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
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene,true,new THREE.Vector3(0, 15, 30)); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
let loader = new THREE.TextureLoader();
function setMaterial(color, file = null, repeatU = 1, repeatV = 1){
  if(!color) color = 'rgb(255,255,255)';

  let mat;
  if(!file){
    mat = new THREE.MeshLambertMaterial({color:color});
  } else {
    mat = new THREE.MeshLambertMaterial({ map: loader.load(file),color:color});
    mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
    mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;
    mat.map.repeat.set(repeatU,repeatV); 
  }
  return mat;
}

// create the ground plane
let plane = createGroundPlaneXZ(20, 20);
plane.material = setMaterial("white","../assets/textures/floor-wood.jpg");
plane.receiveShadow = true;
scene.add(plane);

let keyboard = new KeyboardState();




let tex =  "../assets/textures/displacement/rockWall.jpg";
let nmap = "../assets/textures/displacement/rockWall_Normal.jpg";
let dmap = "../assets/textures/displacement/rockWall_Height.jpg";


let geometry = new THREE.SphereGeometry(3, 64, 64);
let sphere = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
  color: "white",
  map: new THREE.TextureLoader().load(tex),
  normalMap: new THREE.TextureLoader().load(nmap),
  displacementMap: new THREE.TextureLoader().load(dmap),
  displacementScale: 0.2
}
));
sphere.translateY(3)
sphere.castShadow = true;
scene.add(sphere);
setTextureOptions(sphere.material, 4, 3);

function setTextureOptions(material, repu, repv){
	material.map.repeat.set(repu,repv);
	material.displacementMap.repeat.set(repu,repv);
	material.normalMap.repeat.set(repu,repv);
	
	material.map.wrapS = material.displacementMap.wrapS = material.normalMap.wrapS = THREE.RepeatWrapping;
	material.map.wrapT = material.displacementMap.wrapT = material.normalMap.wrapT = THREE.RepeatWrapping;	
}


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