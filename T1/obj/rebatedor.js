import * as THREE from '../../build/three.module.js';
import { calcAnguloSaida, createRebatedor } from '../libs/util.js';

const ANGULO_0 = 20;
const ANGULO_1 = 10;
const ANGULO_2 = 0;
const ANGULO_3 = 350;
const ANGULO_4 = 340;

export function Rebatedor(tamanho = 1.3){

    this.tamanho = tamanho;    
    this.obj = createRebatedor(tamanho);
    this.position = new THREE.Vector3(0,0,0);
    this.bbs = [];
    this.helpers = [];

    this.iniciaBBs();
};

Rebatedor.prototype.addToScene = function(scene){
    scene.add(this.obj);
    this.helpers.forEach(element => {
        scene.add(element);
    });
}

Rebatedor.prototype.iniciaBBs = function(){
    this.obj.children.forEach(element => {
        let bb = new THREE.Box3().setFromObject(element);
        let helper = new THREE.Box3Helper(bb,'white');
        helper.visible = false;
        this.bbs.push(bb);
        this.helpers.push(helper);
    });
}

Rebatedor.prototype.setPosition = function(x ,y, z){
    this.obj.position.set(x,y,z);
    this.position.set(x,y,z);
    this.setBBs();
}

Rebatedor.prototype.setBBs = function(){
    let i = 0;
    this.obj.children.forEach(element => {
        this.bbs[i].setFromObject(element);
        i++;
    });
}

Rebatedor.prototype.lerp = function(alpha) {
    
    let i = 0;
    let translate = (this.position.x - this.obj.position.x) * alpha;
    this.obj.children.forEach(element => {
        let center = new THREE.Vector3();
        let size = new THREE.Vector3(); 
        element.getWorldPosition(center);
        this.bbs[i].getSize(size);
        center.x += translate;
        this.bbs[i].setFromCenterAndSize(center,size);
        i++;
    });

    this.obj.translateX(translate);
}


Rebatedor.prototype.checkCollision = function(object){
    let indice = 0;
    for(;indice < this.bbs.length; indice++){
        if(this.bbs[indice].intersectsBox(object)){
            return indice;
        }

    }
    return -1;
}

Rebatedor.prototype.calcAnguloSaida = function(bola){
    let indice = this.checkCollision(bola.bb);
    let angle_saida = bola.angle;

    if(angle_saida <= 180){
        return angle_saida;
    }

    switch(indice){
      case 0:
            if(bola.angle > 180 + 2 * ANGULO_0){
                return calcAnguloSaida(bola.angle,ANGULO_0);
            }
            return  180 -  2 * ANGULO_0;
      case 1:
            if(bola.angle > 180 + 2 * ANGULO_1){
                return calcAnguloSaida(bola.angle,ANGULO_1);
            }
            return 180 - 2 * ANGULO_1;  
      case 2: return calcAnguloSaida(bola.angle,ANGULO_2);
      case 3: 
            if(bola.angle < 360 - 2 * (360 - ANGULO_3)){
                return calcAnguloSaida(bola.angle,ANGULO_3);
            } 
            return 360 - 2 * (360 - ANGULO_3);  
      case 4: 
            if(bola.angle < 360 - 2 * (360 - ANGULO_4)){
                return calcAnguloSaida(bola.angle,ANGULO_4);
            } 
            return 360 - 2 * (360 - ANGULO_4);
      default: return bola.angle;
    }
}

Rebatedor.prototype.changeHelpersVisible = function(visible){
    this.helpers.forEach(element => {
        element.visible = visible;
    });
}

