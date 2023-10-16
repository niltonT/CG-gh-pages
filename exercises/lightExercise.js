import * as THREE from  'three';
import GUI from '../libs/util/dat.gui.module.js'
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        setDefaultMaterial,
        initDefaultBasicLight,        
        onWindowResize, 
        createLightSphere,
        degreesToRadians} from "../libs/util/util.js";
import {loadLightPostScene} from "../libs/util/utilScenes.js";
import { SpotLight } from '../build/three.module.js';

let scene, renderer, camera, orbit;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
   renderer.setClearColor("rgb(30, 30, 42)");
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
   camera.lookAt(0, 0, 0);
   camera.position.set(5, 5, 5);
   camera.up.set( 0, 1, 0 );
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 3 );
  axesHelper.visible = false;
scene.add( axesHelper );

let dirPosition = new THREE.Vector3(0, 0, 1);
const dirLight = new THREE.DirectionalLight('white',0.5);
dirLight.position.copy(dirPosition);
dirLight.castShadow = true;
scene.add(dirLight);  

// Load default scene
loadLightPostScene(scene)

let color = "rgb(255,255,255)";

const ambientLight = new  THREE.AmbientLight("rgb(20,20,20)");
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(color);
spotLight.angle = degreesToRadians(40);
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
scene.add(spotLight);

spotLight.position.set(1.3,3,0);
spotLight.target.position.set(2.4,0,0);
spotLight.target.updateMatrixWorld();

let cubeGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
let cube = new THREE.Mesh(cubeGeometry, setDefaultMaterial());
cube.position.set(3.5, 0.5, -1);
cube.castShadow = true;
scene.add(cube);

let cube2 = new THREE.Mesh(cubeGeometry, setDefaultMaterial('green'));
cube2.position.set(3.5, 0.5, 1);
cube2.castShadow = true;
scene.add(cube2);

var cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 25);
var cylinder = new THREE.Mesh( cylinderGeometry, setDefaultMaterial('yellow') );
cylinder.position.set(2,0.5,-1.5);
cylinder.castShadow = true;
scene.add(cylinder);

let cylinder2 = new THREE.Mesh( cylinderGeometry, setDefaultMaterial('purple') );
cylinder2.position.set(1,0.5,3);
cylinder2.castShadow = true;
scene.add(cylinder2);



//---------------------------------------------------------
// Load external objects
buildInterface();
render();

function buildInterface()
{
  
  let controls = new function(){
    
    this.luzAmbiente = true;
    this.direcional = true;
    this.spotLight = true;

    this.changeluzAmbiente = function(){
        ambientLight.visible = this.luzAmbiente;
    }
    this.changeDirecional = function(){
        dirLight.visible = this.direcional;
    }
    this.changeSpot = function(){
        spotLight.visible = this.spotLight;
    }
  }
  
  // GUI interface
  let gui = new GUI();
  gui.add(controls, 'luzAmbiente', true)
    .name("Luz Ambiente")
    .onChange(function(e) { controls.changeluzAmbiente() });
  gui.add(controls, 'direcional', true)
    .name("Luz Direcional")
    .onChange(function(e) { controls.changeDirecional() });
  gui.add(controls, 'spotLight', true)
    .name("Spot Light")
    .onChange(function(e) { controls.changeSpot() });
}

function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera)
}
