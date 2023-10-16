import * as THREE from '../../build/three.module.js';
import { degreesToRadians} from '../../libs/util/util.js';
import { createBall, createBox } from '../libs/util.js';


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
    this.bb.setFromObject(this.obj,true);
}

Bola.prototype.setRotation = function(angle){
    let diff = angle - this.angle;
    this.obj.rotateY(degreesToRadians(diff));
    if(angle == 360){
        angle = 0;
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