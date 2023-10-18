import * as THREE from 'three';
import { PlaneGeometry} from '../build/three.module.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {
  initRenderer,
  setDefaultMaterial,
  createGroundPlaneXZ,
  degreesToRadians
} from "../libs/util/util.js";
import {
  initPerspectiveCamera,
  initLight,
  setCamera,
  Timer
} from './libs/util.js';
import { Rebatedor } from './obj/rebatedor.js';
import { Bolas } from './obj/bola.js';
import { Paredes } from './obj/paredes.js';
import { Blocos } from './obj/blocos.js';
import { DoubleBall ,Powerup } from './obj/powerup.js';

/* === TO DO
  - Criar uma classe abstrata para a classe powerup
*/

// --- Constantes -----------

const ALTURA = 56;               // Altura tela
const LARGURA = ALTURA / 2;      // Largura tela

const REBATEDOR_Z = 30;          // Z inicial rebatedor
const REBATEDOR_Y = 1;           // Y inicial rebatedor

const BOLA_Y = 1;                // Y inicial bola
const RAIO_BOLA = 0.6;            
const BOLA_ANGLE = 90;           // Angulo incial da bola
const VELOCIDADE_BOLA = 0.45;
const VEL_MAX = 2;
const COR_BOLA = 'darkorange';

const VELOCIDADE_POWERUP = 0.4;
const DOUBLE_BALL = 2;          // A cada quantos blocos o powerup é liberado
const MAX_BALL = 2;             // Numero maximo de bolas na fase

const LEVELMAX = 2;
const ALTURALEVELS = [10,20];

// --- Elementos básicos ----

let scene = new THREE.Scene();
let renderer = initRenderer();
let light = initLight(scene);
let camera = initPerspectiveCamera();

let pause = false;
let start = false;
let level = 1;
let blocos_quebrados = 0;
let velocidade_bola = VELOCIDADE_BOLA;
let interval = ((VELOCIDADE_BOLA * VEL_MAX) - VELOCIDADE_BOLA) / 14;
let chamada = false;

let keyboard = new KeyboardState();

let label = document.getElementById("#label");
let timer = new Timer(function(){
  if(start && !pause){
    if(velocidade_bola < (VELOCIDADE_BOLA * VEL_MAX)){
      velocidade_bola += interval;
      attLabel();
    }
  }
},1000);


// --- Light -----------------------

light.position.copy(new THREE.Vector3(LARGURA / 2, 27, -ALTURA / 2));
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0;
light.shadow.camera.far = 100;
light.shadow.camera.left = -LARGURA;
light.shadow.camera.right = LARGURA;
light.shadow.camera.top = ALTURA;
light.shadow.camera.bottom = -ALTURA;

let ambientLight = new THREE.AmbientLight('gray',0.7);
scene.add(ambientLight);

// --- Raycaster ------------------

let raycaster = new THREE.Raycaster();
let planeMaterial = setDefaultMaterial();

planeMaterial.side = THREE.DoubleSide;
planeMaterial.transparent = true;
planeMaterial.opacity = 0.8;

let raycasterPlane = new THREE.Mesh(new PlaneGeometry(LARGURA * 3, ALTURA, 10, 10), planeMaterial);
raycasterPlane.rotateX(degreesToRadians(90));
raycasterPlane.visible = false;
scene.add(raycasterPlane);

// --- Obj ------------------------

let plane = createGroundPlaneXZ(LARGURA, ALTURA, 10, 10, 'midnightblue');
scene.add(plane);

let paredes = new Paredes(ALTURA, LARGURA, 2.3, 1);
paredes.addToScene(scene);

let rebatedor = new Rebatedor(1.2,1,'red');
scene.add(rebatedor.obj);
rebatedor.setPosition(0, REBATEDOR_Y, REBATEDOR_Z);

let bolas = new Bolas(scene);
bolas.add(RAIO_BOLA,COR_BOLA);
reiniciaBola();

let blocos = new Blocos(level, ALTURALEVELS[level - 1], LARGURA);
blocos.addToScene(scene);
blocos.setPosition(0, 0, -15);

let powerups = new Powerup(scene);

// --- Colisão -------------------

function checkCollision() {
  bolas.bolas.forEach(bola => {
    if (bola.move) {
      bola.setRotation(paredes.calcAnguloSaida(bola.angle, bola.bb));
      bola.setRotation(rebatedor.calcAnguloSaida(bola));

      let bloco = blocos.checkCollision(bola.bb);
      if(bloco != null){
        bola.setRotation(blocos.calcAngulo(bola,bloco));
        if(bolas.getNum() < MAX_BALL){
          blocos_quebrados++;
          if(blocos_quebrados == DOUBLE_BALL){
            powerups.addDouble(bloco.obj.position);
            blocos_quebrados = 0;
          }
        }
      }
    }
  });

  powerups.powerups.forEach(powerup => {
    if(rebatedor.checkCollision(powerup.obj.position,powerups.RAIO)){
      if(powerup instanceof DoubleBall){
        if(bolas.getNum() < MAX_BALL){
          let position = bolas.bolas[0].position;
          let angle = bolas.bolas[0].angle;
          let bola = bolas.add(RAIO_BOLA,COR_BOLA);
          bola.setPosition(position.x,position.y,position.z);
          bola.setRotation(angle + 35);
          blocos_quebrados = 0;
        }
      }
      powerups.remove(powerup);
    }
  });

}

// --- Listeners -----------------

window.addEventListener('resize', function () { setCamera(ALTURA, camera, renderer) }, false);
window.addEventListener('click', function () { iniciaGame() }, false);
window.addEventListener('mousemove', onMouseMove);

// --- Funções ---------------------


function onMouseMove(event) {
  if (!pause) {
    let pointer = new THREE.Vector2();
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    let intersects = raycaster.intersectObject(raycasterPlane);

    if (intersects.length > 0) {
      let point = intersects[0].point;
      if (point.x < LARGURA / -2 + (rebatedor.getComprimento()/2)) {
        rebatedor.setPosition(LARGURA / -2 + (rebatedor.getComprimento()/2), REBATEDOR_Y, REBATEDOR_Z);
      } else {
        if (point.x > LARGURA / 2 - (rebatedor.getComprimento()/2)) {
          rebatedor.setPosition(LARGURA / 2 - (rebatedor.getComprimento()/2), REBATEDOR_Y, REBATEDOR_Z);
        } else {
          rebatedor.setPosition(point.x, REBATEDOR_Y, REBATEDOR_Z);
        }
      }
      if (!start) {
        reiniciaBola();
      }
    }
  }
};

function atualizaEstado(){
  atualizaMove();
  checkRemove();
  checkFinish();
}

function atualizaMove(){
  if (!start) {
    powerups.move = false;
    powerups.clear();
    bolas.setMove(false);
  } else {
    if (pause) {
      powerups.move = false;
      bolas.setMove(false);
      timer.pause();
      chamada = false;
    } else {
      powerups.move = true;
      bolas.setMove(true);
      if(!chamada){
        timer.resume();
        chamada = true;
      }
    }
  }
}

function checkRemove(){
  powerups.powerups.forEach(element => {
    let z = element.obj.position.z;
    if(z > (ALTURA / 2) + 3){
      powerups.remove(element);
    }
  });

  bolas.bolas.forEach(element => {
    if(element.obj.position.z > ALTURA / 2){
      bolas.remove(element);
    }
  });
}

function iniciaGame() {
  if (!start) {
    start = true;
    pause = false;
  }
}

function reiniciaGame() {
  start = false;
  pause = false;
  atualizaEstado();
  blocos.reiniciaBlocos();
  reiniciaBola();
}

function atualizaKeyboard() {
  keyboard.update();

  if (keyboard.down('space')) {
    if (!blocos.verificaWin()) {
      pause = !pause;
    }
  }

  if (keyboard.down('enter')) {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  if (keyboard.down('R')) reiniciaGame();

  if (keyboard.down('G')) {
    if (level == 1) {
      nextLevel();
    }
  }
}

function checkFinish() {
  if(start){
    if (bolas.getNum() == 0) {
      start = false;
      pause = false;
      reiniciaBola();
      atualizaEstado();
    }else{
      if (blocos.verificaWin()) {
        nextLevel();
      }
    }
  }
}

function nextLevel() {
  if (level < LEVELMAX) {
    if (!blocos.verificaWin()) {
      blocos.clear();
    }
    level++;
    blocos_quebrados = 0;
    blocos = new Blocos(level, ALTURALEVELS[level - 1], LARGURA);
    blocos.addToScene(scene);
    blocos.setPosition(0, 0, -15);

    start = false;
    pause = false;

    reiniciaBola();
  } else {
    pause = true;
  }
}

function reiniciaBola() {
  let bola;
  if(bolas.getNum() == 1){
    bola = bolas.bolas[0];
  }else{
    bolas.clear();
    bola = bolas.add(RAIO_BOLA,COR_BOLA);
  }
  let position = rebatedor.position;
  let x = position.x;
  let z = REBATEDOR_Z - rebatedor.raio - bola.raio;
  bola.setPosition(x, BOLA_Y, z);
  bola.setRotation(BOLA_ANGLE);
  velocidade_bola = VELOCIDADE_BOLA;
  attLabel();
  
  timer.pause();
  timer.reset();
  chamada = false;
}

function attLabel(){
  label.textContent = "Velocidade: " + (velocidade_bola/VELOCIDADE_BOLA).toFixed(1) + "x";
}

function render() {
  atualizaEstado();
  atualizaKeyboard();
  checkCollision();

  bolas.atualizaEstado(velocidade_bola);
  powerups.atualizaEstado(VELOCIDADE_POWERUP);

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

// ---------------------------------

render();
