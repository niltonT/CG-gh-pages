import * as THREE from '../../build/three.module.js';
import { degreesToRadians } from "../../libs/util/util.js";
import { createCapsule, setMaterial } from '../libs/util.js';


// --- Powerup que dublica a bola

export function DoubleBall(raio, largura){

    this.obj = createCapsule(raio,largura,'./assets/T.png','rgb(92,255,230)');
    this.bb = new THREE.Box3().setFromObject(this.obj,true);
    this.bbHelper = new THREE.Box3Helper(this.bb,'white');

    this.obj.castShadow = true;
    this.obj.reciveShadow = true;
    this.bbHelper.visible = false;

};

DoubleBall.prototype.addToScene = function(scene){
    scene.add(this.obj);
    scene.add(this.bbHelper);
}

DoubleBall.prototype.setPosition = function(x,y,z){
    this.obj.position.set(x,y,z); 
    this.bbHelper.position.set(x,y,z); 
    this.bb.setFromObject(this.obj);
}

DoubleBall.prototype.move = function(velocidade){
    this.obj.translateZ(velocidade);
    this.obj.children[0].rotateY(degreesToRadians(5));
    this.bb.setFromObject(this.obj);
}

// --- Powerup que deixa a bola sem colisão

export function GhostBall(raio, largura){

    this.obj = createCapsule(raio,largura,'./assets/S.png','rgb(203,108,230)');
    this.bb = new THREE.Box3().setFromObject(this.obj,true);
    this.bbHelper = new THREE.Box3Helper(this.bb,'white');

    this.obj.castShadow = true;
    this.obj.reciveShadow = true;
    this.bbHelper.visible = false;

};

GhostBall.prototype.addToScene = function(scene){
    scene.add(this.obj);
    scene.add(this.bbHelper);
}

GhostBall.prototype.setPosition = function(x,y,z){
    this.obj.position.set(x,y,z); 
    this.bbHelper.position.set(x,y,z); 
    this.bb.setFromObject(this.obj);
}

GhostBall.prototype.move = function(velocidade){
    this.obj.translateZ(velocidade);
    this.obj.children[0].rotateY(degreesToRadians(5));
    this.bb.setFromObject(this.obj);
}

// --- Classe que gerencia os powerups

export function Powerup(scene){

    this.RAIO = 0.5;
    this.TUBO = 1.8;
    this.COLOR = "yellow";
    
    this.powerups = [];
    this.scene = scene;
    this.move = true;
};

Powerup.prototype.addDouble = function(position = new THREE.Vector3(0,1,0)){
    let powerup = new DoubleBall(this.RAIO,this.TUBO);
    powerup.addToScene(this.scene);
    powerup.setPosition(position.x,position.y,position.z);
   // powerup.obj.rotateX(degreesToRadians(90));
    //powerup.obj.rotateZ(degreesToRadians(90));
    this.powerups.push(powerup);
}

Powerup.prototype.addGhost = function(position = new THREE.Vector3(0,1,0)){
    let powerup = new GhostBall(this.RAIO,this.TUBO);
    powerup.addToScene(this.scene);
    powerup.setPosition(position.x,position.y,position.z);
   // powerup.obj.rotateX(degreesToRadians(90));
    //powerup.obj.rotateZ(degreesToRadians(90));
    this.powerups.push(powerup);
}

Powerup.prototype.atualizaEstado = function(velocidade){
    if(this.move){
        this.powerups.forEach(element => {
            element.move(velocidade);
        });
    }
}

Powerup.prototype.remove = function(element){
    let object = this.scene.getObjectById(element.obj.id);
    let index = this.powerups.indexOf(element);
    this.scene.remove(object);
    this.powerups.splice(index,1);
}

Powerup.prototype.checkCollision = function(object){
    if(this.move){
        for(let i = 0; i < this.powerups.length; i++){
            if(object.intersectsBox(this.powerups[i].bb)){
                return this.powerups[i];
            }
        }
    }
    return undefined;
}

Powerup.prototype.getNum = function(){
    return this.powerups.length;
}

Powerup.prototype.clear = function(){
    while(this.getNum() > 0){
        this.remove(this.powerups[0]);
    }
}



