import * as THREE from  'three';
import { PlaneGeometry } from '../build/three.module.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {initRenderer, 
        initDefaultBasicLight,
        setDefaultMaterial,
        createGroundPlaneXZ,
        degreesToRadians} from "../libs/util/util.js";

import { initCamera, setCamera} from './libs/util.js';
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
const BOLA_ANGLE = 80;
const VELOCIDADE_BOLA = 0.75;

// --- Elementos básicos ----

let scene = new THREE.Scene();    
let renderer = initRenderer();    
let light = initDefaultBasicLight(scene);
let camera = initCamera(ALTURA);

let pause = false;
let start = false;

let keyboard = new KeyboardState();

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

let plane = createGroundPlaneXZ(LARGURA,ALTURA,10,10,'midnightblue');
scene.add(plane);

let paredes = new Paredes(ALTURA,LARGURA,2.3,1);
paredes.addToScene(scene);

let rebatedor = new Rebatedor(TAM_REBATEDOR);
rebatedor.addToScene(scene);
rebatedor.setPosition(0,REBATEDOR_Y,REBATEDOR_Z);

let bola = new Bola(RAIO_BOLA);
bola.addToScene(scene);
posicionaBola();

let blocos = new Blocos(10,LARGURA,6,8);
blocos.addToScene(scene);
blocos.setPosition(0,0,-15);

// --- Colisão -------------------

function checkCollision(){
  if(bola.move){
    bola.setRotation(paredes.calcAnguloSaida(bola.angle, bola.bb));
    bola.setRotation(rebatedor.calcAnguloSaida(bola));
    bola.setRotation(blocos.calcAnguloSaida(bola));
  }
}

// --- Listeners -----------------

window.addEventListener( 'resize', function(){setCamera(ALTURA ,camera, renderer)}, false );
window.addEventListener('click', function(){iniciaGame()}, false );
window.addEventListener('mousemove', onMouseMove);

// --- Funções ---------------------

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
    start = false;
    pause = false;
    bola.move = false;
    posicionaBola();
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

render();
