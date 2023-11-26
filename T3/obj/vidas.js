import * as THREE from '../../build/three.module.js';
import { createBall } from '../libs/util.js';

export function Vidas(max){

    this.RAIO = 0.4;
    this.COLOR = 'white';

    this.vidas = [];
    this.max = max;
    this.obj = new THREE.Object3D();

    for(let i = 0; i < max; i++){
        this.vidas.push(createBall(this.RAIO,this.COLOR));
        this.obj.add(this.vidas[i]);
        this.vidas[i].castShadow = false;
        this.vidas[i].position.set(((2 * this.RAIO + 0.4) * i),0,0);
    }
}

Vidas.prototype.attVidas = function(num_vidas){
    let i = 0;
    this.vidas.forEach(element => {
        if(i < num_vidas){
            element.visible = true;
        }else{
            element.visible = false;
        }
        i++;
    });
}