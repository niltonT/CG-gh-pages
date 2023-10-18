import * as THREE from '../../build/three.module.js';
import { degreesToRadians} from '../../libs/util/util.js';
import { createBall, createBox } from '../libs/util.js';

export function Bolas(scene){
    this.bolas = [];
    this.scene = scene;
}

Bolas.prototype.add = function(raio,color){
    let bola = new Bola(raio,color);
    this.bolas.push(bola);
    bola.addToScene(this.scene);
    return bola;
}

Bolas.prototype.atualizaEstado = function(velocidade){
    this.bolas.forEach(element => {
        element.moveBola(velocidade);
    });
}

Bolas.prototype.setMove = function(move){
    this.bolas.forEach(element => {
        element.move = move;
    }); 
}

Bolas.prototype.getNum = function(){
    return this.bolas.length;
}

Bolas.prototype.remove = function(element){
    let object = this.scene.getObjectById(element.obj.id);
    let index = this.bolas.indexOf(element);
    this.scene.remove(object);
    this.bolas.splice(index,1);
}

Bolas.prototype.clear = function(){
    while(this.getNum() > 0){
        this.remove(this.bolas[0]);
    }
}

// ----
export function Bola(raio = 0.7, color = 'yellow'){

    this.obj = createBall(raio,color);
    this.raio = raio;
    this.bb = new THREE.Box3().setFromObject(this.obj,true);
    this.bbHelper = new THREE.Box3Helper(this.bb,'white');
    this.position = new THREE.Vector3(0,0,0);
    this.angle = 90;
    this.move = false;

    this.obj.rotateY(degreesToRadians(180));
    this.bbHelper.visible = false;

};

Bola.prototype.addToScene = function(scene){
    scene.add(this.obj);
    scene.add(this.bbHelper);
}

Bola.prototype.setPosition = function(x,y,z){
    this.position.set(x,y,z);
    this.obj.position.set(x,y,z);
    this.bbHelper.position.set(x,y,z);
    this.bb.setFromObject(this.obj,true);
}

Bola.prototype.setRotation = function(angle){
    
    let diff = angle - this.angle;
    this.obj.rotateY(degreesToRadians(diff));
    
    if(angle < 0){
        angle += 360;
    }
    
    if(angle >= 360){
        angle -= 360;
    }

    this.angle = angle;
}

Bola.prototype.lerp = function(alpha){
    
    this.obj.translateZ(0.3);
    this.position.copy(this.obj.position);
    this.obj.translateZ(0.3);
    
    this.obj.position.lerp(this.position, alpha);
}

Bola.prototype.moveBola = function(velocidade){
    if(this.move){
        this.obj.translateZ(velocidade);
        this.position.copy(this.obj.position);
        this.bb.setFromObject(this.obj,true);

    }
}