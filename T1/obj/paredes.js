import * as THREE from '../../build/three.module.js';
import { createBox,
         calcAnguloSaida } from '../libs/util.js';


const COR = 'grey';


export function Paredes(altura, largura, altura_parede = 1, largura_parede = 1){

    this.obj = new THREE.Object3D();

    this.largura_parede = largura_parede;
    this.altura_parede = altura_parede;

    this.paredeDireita  = this.criaParedeDireita(altura,largura);
    this.paredeEsquerda = this.criaParedeEsquerda(altura,largura);
    this.paredeCima     = this.criaParedeCima(altura,largura);

    this.bbParedeDireita  = new THREE.Box3().setFromObject(this.paredeDireita);
    this.bbParedeEsquerda = new THREE.Box3().setFromObject(this.paredeEsquerda);
    this.bbParedeCima     = new THREE.Box3().setFromObject(this.paredeCima);

    this.helpers = [];
    this.iniciaHelpers();

};

Paredes.prototype.iniciaHelpers = function(){
    this.helpers.push(new THREE.Box3Helper(this.bbParedeDireita,'white'));
    this.helpers.push(new THREE.Box3Helper(this.bbParedeEsquerda,'white'));
    this.helpers.push(new THREE.Box3Helper(this.bbParedeCima,'white'));
    this.changeHelpersVisible(false);
}

Paredes.prototype.changeHelpersVisible = function(visible){
    this.helpers.forEach(element => {
        element.visible = visible;
    })
}

Paredes.prototype.calcAnguloSaida = function(angle,object){

    let direita = object.intersectsBox(this.bbParedeDireita);
    let esquerda = object.intersectsBox(this.bbParedeEsquerda);
    let cima = object.intersectsBox(this.bbParedeCima);

    if(direita && cima) return calcAnguloSaida(angle,315);
    if(esquerda && cima) return calcAnguloSaida(angle,225);
    
    if(direita){
        if(angle < 90 || (angle > 270 && angle < 360)){
            return calcAnguloSaida(angle,270);
        }
    }

    if(esquerda){
        if(angle > 90 && angle < 270){
            return calcAnguloSaida(angle,90);
        } 
    }
    
    if(cima){
        if(angle < 180){
            return calcAnguloSaida(angle,0);
        }
    }   

    return angle;
}

Paredes.prototype.addToScene = function(scene){
    scene.add(this.obj);
    this.helpers.forEach(element => {
        scene.add(element);
    });
}

Paredes.prototype.criaParedeDireita = function(altura, largura){
    let box = createBox(this.largura_parede,this.altura_parede,altura,COR);
    box.translateY(0.5);
    box.translateX(largura/2 + 0.5);
    this.obj.add(box);
    return box;
}

Paredes.prototype.criaParedeEsquerda = function(altura, largura){
    let box = createBox(this.largura_parede,this.altura_parede,altura,COR);
    box.translateY(0.5);
    box.translateX(largura/-2 - 0.5);
    this.obj.add(box);
    return box;
}

Paredes.prototype.criaParedeCima = function(altura, largura){
    let box = createBox(largura + 2,this.altura_parede,this.largura_parede,COR);
    box.translateY(0.5);
    box.translateZ(altura/-2 + 0.5);
    this.obj.add(box);
    return box;
}

Paredes.prototype.criaParedeBaixo = function(altura, largura){
    let box = createBox(largura + 2,this.altura_parede,this.largura_parede);
    box.translateY(0.5);
    box.translateZ(altura/2 + 0.5);
    this.obj.add(box);
    return box;
}
