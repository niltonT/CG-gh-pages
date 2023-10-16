import * as THREE from  'three';
import GUI from '../libs/util/dat.gui.module.js'
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { PlaneGeometry } from '../build/three.module.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {initRenderer, 
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        degreesToRadians} from "../libs/util/util.js";

import { initCamera, setCamera, calcAnguloSaida, createBox } from './libs/util.js';
import { Rebatedor } from './obj/rebatedor.js';
import { Bola } from './obj/bola.js';
import { Paredes } from './obj/paredes.js';
import { Blocos } from './obj/blocos.js';


// --- Constantes -----------

const ALTURA = 56;               // Altura tela
const LARGURA = ALTURA / 2;      // Largura tela
const REBATEDOR_Z = 25;          // Z inicial rebatedor
const REBATEDOR_Y = 1;           // Y inicial rebatedor
const BOLA_Y = 1;                // Y inicial bola
const RAIO_BOLA = 0.6;
const TAM_REBATEDOR = 1.5;
const BOLA_ANGLE = 37;
const VELOCIDADE_BOLA = 0.75;

// --- Elementos básicos ----

let scene = new THREE.Scene();    
let renderer = initRenderer();    
let light = initDefaultBasicLight(scene);

let pause = false;
let start = false;

let keyboard = new KeyboardState();

// --- Câmera ---------------

let camera = initCamera(ALTURA);

// --- Controles Debug ------

let orbit = new OrbitControls( camera, renderer.domElement );
orbit.enabled = false;
let axesHelper = new THREE.AxesHelper( 12 );
axesHelper.visible = false;
scene.add( axesHelper );

// --- Raycaster ------------------

let raycaster = new THREE.Raycaster();
let planeMaterial = setDefaultMaterial();

planeMaterial.side = THREE.DoubleSide;
planeMaterial.transparent = true;
planeMaterial.opacity = 0.8;

let raycasterPlane = new THREE.Mesh(new PlaneGeometry(LARGURA * 3,ALTURA,10,10),planeMaterial);
raycasterPlane.rotateX(degreesToRadians(90));
raycasterPlane.visible = false;
scene.add(raycasterPlane);

// --- Obj ------------------------

let plane = createGroundPlaneXZ(LARGURA,ALTURA);
scene.add(plane);

let paredes = new Paredes(ALTURA,LARGURA,2.3,1);
paredes.addToScene(scene);

let rebatedor = new Rebatedor(TAM_REBATEDOR);
rebatedor.addToScene(scene);
rebatedor.setPosition(0,REBATEDOR_Y,REBATEDOR_Z);

let bola = new Bola(RAIO_BOLA);
bola.addToScene(scene);
posicionaBola();

let blocos = new Blocos(10,LARGURA,5,8);
blocos.addToScene(scene);
blocos.setPosition(0,0,-15);

// --- Colisão -------------------

function checkCollision(){
  if(bola.move){
    bola.setRotation(paredes.calcAnguloSaida(bola.angle, bola.bb));
    bola.setRotation(rebatedor.calcAnguloSaida(bola.angle, bola.bb));
    bola.setRotation(blocos.calcAnguloSaida(bola));
  }
}

// --- Listeners -----------------

window.addEventListener( 'resize', function(){setCamera(ALTURA ,camera, renderer)}, false );
window.addEventListener('click', function(){iniciaGame()}, false );
window.addEventListener('mousemove', onMouseMove);

// --- Funções ---------------------

let debugConfig =  new function(){

  this.visible = true;
  this.axesHelper = false;
  this.orbitControls = false;
  this.raycasterPlaneVisible = false;
  this.bbHelper = false;
  this.angle = bola.angle;

  this.changeAxesHelper = function(){
    axesHelper.visible = this.axesHelper;
  }

  this.changeOrbitControls = function(){
    orbit.enabled = this.orbitControls;
    orbit.update();
    if(!this.orbitControls){
      setCamera();
    }
  }

  this.raycasterPlane = function(){
    raycasterPlane.visible = this.raycasterPlaneVisible;
  }

  this.changeBBHelper = function(){
    bola.bbHelper.visible = this.bbHelper;
    paredes.changeHelpersVisible(this.bbHelper);
    rebatedor.changeHelpersVisible(this.bbHelper);
    blocos.changeHelpersVisible(this.bbHelper);
  }

};

function buildInterface()
{     
  let gui = new GUI();
  let folder = gui.addFolder("Debug Options");
    folder.open();   
    folder.add(debugConfig, "axesHelper",  true)
          .onChange(function(e) {debugConfig.changeAxesHelper()})
          .name("Exes Helper");
    folder.add(debugConfig, "orbitControls",  true)
          .onChange(function(e) {debugConfig.changeOrbitControls()})
          .name("Orbit Controls");
    folder.add(debugConfig, "raycasterPlaneVisible",  true)
          .onChange(function(e) {debugConfig.raycasterPlane()})
          .name("Raycaster Plane");
    folder.add(debugConfig, "bbHelper",  true)
          .onChange(function(e) {debugConfig.changeBBHelper()})
          .name("BB Helper");
    folder.add(debugConfig, "angle",  0, 360)
          .onChange(function(e) {bola.setRotation(debugConfig.angle)})
          .name("Ângulo Bola");
}

function onMouseMove(event) 
{
  if(!pause){
    let pointer = new THREE.Vector2();
    pointer.x =  (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
 
    raycaster.setFromCamera(pointer, camera);
    let intersects = raycaster.intersectObject(raycasterPlane);
    
    if(intersects.length > 0)
    {      
      let point = intersects[0].point;
      if(point.x < LARGURA/-2 + (TAM_REBATEDOR * 2.5)){
        rebatedor.setPosition(LARGURA/-2 + (TAM_REBATEDOR * 2.5), REBATEDOR_Y, REBATEDOR_Z);
      }else{
        if(point.x > LARGURA/2 - (TAM_REBATEDOR * 2.5)){
          rebatedor.setPosition(LARGURA/2 - (TAM_REBATEDOR * 2.5), REBATEDOR_Y, REBATEDOR_Z);
        }else{
          rebatedor.setPosition(point.x, REBATEDOR_Y, REBATEDOR_Z);
        }
      }
      if(!start){
        posicionaBola();
      }
    }
  }
};

function atualizaEstado(){
  rebatedor.setBBs();
  if(!start){
    bola.move = false;
  }else{
    if(pause){
      bola.move = false;
    }else{
      bola.move = true;
    }
  }
  checkFinish();
}

function iniciaGame(){
  if(!start){
    start = true;
    pause = false;
    bola.move = true;
  }
}

function reiniciaGame(){
  start = false;
  pause = false;
  bola.move = false;
  blocos.reiniciaBlocos();
  posicionaBola();
}

function atualizaTeclado(){
  keyboard.update();
  if(keyboard.down('space')){
    if(!blocos.verificaWin()){
      pause = !pause;
    }
  }
    
  if(keyboard.down('enter')){
    if(document.fullscreenElement){
      document.exitFullscreen();
    }else{
      document.documentElement.requestFullscreen();
    }
  } 

  if(keyboard.down('R')) reiniciaGame();
}

function checkFinish(){
  if(bola.position.z > ALTURA/2 + 3){
    reiniciaGame();
  }
  
  if(blocos.verificaWin()){
    pause = true;
  }
}

function posicionaBola(){
    let position = rebatedor.position;
    let x = position.x + TAM_REBATEDOR;
    let z = REBATEDOR_Z - 0.5 - bola.raio;
    bola.setPosition(x,BOLA_Y,z);
    bola.setRotation(BOLA_ANGLE);
}

function render()
{
  atualizaEstado();
  atualizaTeclado();
  checkCollision();

  bola.moveBola(VELOCIDADE_BOLA);

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

// ---------------------------------

buildInterface();
onMouseMove(document);
render();
