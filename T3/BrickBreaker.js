import * as THREE from 'three';
import { PlaneGeometry} from '../build/three.module.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
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
  Timer,
  setSkyBox,
  getRandomIntInclusive,
  playAudio
} from './libs/util.js';
import { Rebatedor } from './obj/rebatedor.js';
import { Bolas } from './obj/bola.js';
import { Paredes } from './obj/paredes.js';
import { Blocos } from './obj/blocos.js';
import { Vidas } from './obj/vidas.js';
import { DoubleBall ,Powerup, GhostBall} from './obj/powerup.js';

// --- Constantes -----------

const ALTURA = 56;              // Altura tela
const LARGURA = ALTURA / 2;      // Largura tela

const REBATEDOR_Z = 4;          // Z inicial rebatedor
const REBATEDOR_Y = 1;           // Y inicial rebatedor

const BOLA_Y = 1;                // Y inicial bola
const RAIO_BOLA = 0.6;            
const BOLA_ANGLE = 90;           // Angulo incial da bola
const VELOCIDADE_BOLA = 0.45;
const VEL_MAX = 2;
const COR_BOLA = 'white';

const VELOCIDADE_POWERUP = 0.4;
const DOUBLE_BALL = 10;          // A cada quantos blocos o powerup é liberado
const MAX_BALL = 2;             // Numero maximo de bolas na fase

const LEVELMAX = 3;
const ALTURALEVELS = [15,22,22];

const VIDAS = 5;

// --- Elementos básicos ----

let scene = new THREE.Scene();
let renderer = initRenderer();
let light = initLight(scene);
let camera = initPerspectiveCamera();

let audioListener = new THREE.AudioListener();

const bloco1  = './assets/sounds/bloco1.mp3';
const bloco2  = './assets/sounds/bloco2.mp3';
const bloco3  = './assets/sounds/bloco3.mp3';
const som_rebatedor  = './assets/sounds/rebatedor.mp3';

let sound_1 = null;
let sound_2 = null;
let sound_3 = null;
let sound_rebatedor = null;

let pause = false;
let start = false;
let level = 1;
let blocos_quebrados = 0;
let velocidade_bola = VELOCIDADE_BOLA;
let interval = ((VELOCIDADE_BOLA * VEL_MAX) - VELOCIDADE_BOLA) / 14;
let chamada = false;
let num_ghost = 0;
let num_double = 0;
let ghost = false;
let vidas = VIDAS;
let loadScreen = true;

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

scene.background = setSkyBox("./assets/space/",".png");

export const loadingManager = new THREE.LoadingManager( () => {
  let button  = document.getElementById("myBtn")
  button.style.backgroundColor = 'Green';
  button.innerHTML = 'Play';
  button.addEventListener("click", onPlayPressed);
});

// --- Controles Debug ------

let orbit = false;

// --- Light -----------------------

light.position.copy(new THREE.Vector3(LARGURA / 1.6, 15, 10));
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0;
light.shadow.camera.far = 100;
light.shadow.camera.left = -LARGURA;
light.shadow.camera.right = LARGURA;
light.shadow.camera.top = ALTURA;
light.shadow.camera.bottom = -ALTURA;

let ambientLight = new THREE.AmbientLight('white',0.25);
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
plane.material.transparent = true;
plane.material.opacity = 0;

let paredes = new Paredes(ALTURA, LARGURA, 2.3, 1);
paredes.addToScene(scene);

let rebatedor = new Rebatedor(1.2,1.5,"rgb(12,110,209)");
scene.add(rebatedor.obj);
rebatedor.setPosition(0, REBATEDOR_Y, REBATEDOR_Z);

let bolas = new Bolas(scene);
bolas.add(RAIO_BOLA,COR_BOLA);

let blocos = new Blocos(level, ALTURALEVELS[level - 1], LARGURA);
blocos.addToScene(scene);
blocos.setPosition(0, 0, -15);

let powerups = new Powerup(scene);

let life_bar = new Vidas(vidas);
life_bar.obj.position.set(12,8,-10);
scene.add(life_bar.obj);

let timerGhost = new Timer(function(){
  if(num_ghost == 0){
    num_ghost++;
  }else{
    ghost = false;
  }
},7000);

timerGhost.pause();

// --- Colisão -------------------

function checkCollision() {
  bolas.bolas.forEach(bola => {
    if (bola.move) {
      if(bola.setRotation(rebatedor.calcAnguloSaida(bola))){
        if(sound_rebatedor){sound_rebatedor.stop();}
        sound_rebatedor =  playAudio(som_rebatedor,audioListener);
      }
      
      bola.setRotation(paredes.calcAnguloSaida(bola.angle, bola.bb));

      let bloco = blocos.checkCollision(bola.bb);
      if(bloco != null){
        if(!ghost){
          bola.setRotation(blocos.calcAngulo(bola,bloco));
          if(bloco.dureza == 0){
            if(sound_1){sound_1.stop();}
            sound_1 = playAudio(bloco1,audioListener);
          }else{
            if(sound_2){sound_2.stop();}
            sound_2 = playAudio(bloco2,audioListener);
          }
        }else{
        if(sound_3){sound_3.stop();}
          sound_3 = playAudio(bloco3,audioListener);
        }
        
        if(bloco.dureza == 0){
          if(bolas.getNum() < MAX_BALL && num_double < 1 && !ghost){
            blocos_quebrados++;
          }
          
          if(blocos_quebrados == DOUBLE_BALL){
            blocos_quebrados = 0;
            num_double = 1;
            let random = getRandomIntInclusive(0,1);
            if(random == 0){
              powerups.addDouble(bloco.obj.position);
            }else{
              powerups.addGhost(bloco.obj.position);
            }
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
          bola = bolas.add(RAIO_BOLA,COR_BOLA);
          bola.setPosition(position.x,position.y,position.z);
          bola.setRotation(angle - 35);
          blocos_quebrados = 0;
        }
      }
      if(powerup instanceof GhostBall){
        ghost = true;
        num_ghost = 0;
        timerGhost.resume();
        bolas.setColor('red');
      }
      num_double = 0;
      powerups.remove(powerup);
    }
  });

}

// --- Listeners -----------------

window.addEventListener('resize', function () { setCamera(ALTURA, camera, renderer) }, false);
window.addEventListener('click', function () { iniciaGame() }, false);
window.addEventListener('mousemove', onMouseMove);

// --- Funções ---------------------


function onPlayPressed() {
  const loadingScreen = document.getElementById( 'loading-screen' );
  loadingScreen.transition = 0;
  loadingScreen.classList.add( 'fade-out' );
  loadingScreen.addEventListener( 'transitionend', (e) => {
    const element = e.target;
    //speed.style.opacity = 1;
    element.remove();  
    loadScreen = false;
  });  
  const speed = document.getElementById( 'container' );
  speed.classList.add( 'fade-in' );

}

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
    num_double = 0;
    bolas.setMove(false);
  } else {
    if (pause) {
      powerups.move = false;
      bolas.setMove(false);
      timer.pause();
      chamada = false;
      timerGhost.pause();
      
    } else {
      powerups.move = true;
      bolas.setMove(true);
      if(!chamada){
        timer.resume();
        chamada = true;
        if(num_ghost > 0){
          timerGhost.resume();
        }
      }
    }
  }
}

function checkRemove(){
  powerups.powerups.forEach(element => {
    let z = element.obj.position.z;
    if(z > (ALTURA / 2) + 3){
      num_double = 0;
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
  if (!start && !loadScreen) {
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
  blocos_quebrados = 0;
}

function atualizaKeyboard() {
  keyboard.update();

  if (keyboard.down('space')) {
    if (!blocos.verificaWin()) {
      pause = !pause;
    }
  }

  if (keyboard.down('enter')) {
    let container = document.getElementById("container");
    if (document.fullscreenElement) {
      document.exitFullscreen();
      container.style.left = "10%";
    } else {
      document.documentElement.requestFullscreen();
      container.style.left = "15%";
    }
  }

  if (keyboard.down('R')) reiniciaGame();

  if (keyboard.down('G')) {
    if (level <= LEVELMAX) {
      nextLevel();
    }
  }

  if(keyboard.down('O')) changeOrbitControls();
}

function changeOrbitControls(){
  orbit = !orbit;
  if(!orbit){
    camera = initPerspectiveCamera();
    pause = false;
  }else{
    new OrbitControls( camera, renderer.domElement );
    camera.rotateZ(degreesToRadians(180));
    pause = true;
  }
}

function checkFinish() {
  if(start){
    if (bolas.getNum() == 0) {
      start = false;
      pause = false;
      vidas--;
      life_bar.attVidas(vidas);
      if(vidas > 0){
        reiniciaBola();
        atualizaEstado();
      }else{
        level = 0;
        nextLevel();
        life_bar.attVidas(vidas = 5);
      }
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
    const telaFinal = document.getElementById("gameover-screen");
    const container = document.getElementById("container");
    telaFinal.style.opacity = 1;
    container.style.opacity = 0;


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

  let position_rebatedor = new THREE.Vector3();
  rebatedor.objCSG.getWorldPosition(position_rebatedor);
  let x = rebatedor.position.x;
  let z = position_rebatedor.z - rebatedor.raio - bola.raio;
  bola.setPosition(x, BOLA_Y, z);
  bola.setRotation(BOLA_ANGLE);
  velocidade_bola = VELOCIDADE_BOLA;
  attLabel();
  
  timer.pause();
  timer.reset();
  chamada = false;
  ghost = false;
  timerGhost.reset();
  timerGhost.pause();
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

  if(!ghost){
    timerGhost.pause();
    timerGhost.reset();
    bolas.setColor('white');
  }

  requestAnimationFrame(render);
  renderer.render(scene, camera);

}

// ---------------------------------
reiniciaBola();
render();
