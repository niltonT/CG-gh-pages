import * as THREE from '../../build/three.module.js';
import { calcAnguloSaida, createBox, createEdges } from '../libs/util.js';

const COMPRIMENTO_BLOCO = 1;

export function Blocos(altura, largura, num_linhas, num_colunas){

    this.matrix = new Array(num_linhas);
    this.num_linhas = num_linhas;
    this.num_colunas = num_colunas;
    this.altura = altura;
    this.largura = largura;
    this.altura_bloco = altura / num_linhas;
    this.largura_bloco = largura / num_colunas;

    this.iniciaMatrix();
    this.posicionaBlocos();
    this.coloreBlocos();
}

Blocos.prototype.iniciaMatrix = function(){
    for(let i = 0; i < this.num_linhas; i++){
        this.matrix[i] = new Array(this.num_colunas);
        for(let j = 0; j < this.num_colunas; j++){
            let bloco = new Bloco(this.largura_bloco, COMPRIMENTO_BLOCO, this.altura_bloco);
            this.matrix[i][j] = bloco;
        }
    }
}

Blocos.prototype.posicionaBlocos = function(){
    let z = (this.altura/-2) + (this.altura_bloco / 2);
    for(let i = 0; i < this.num_linhas; i++){
        let x = (this.largura/-2) + (this.largura_bloco / 2);
        for(let j = 0; j < this.num_colunas; j++){
            this.matrix[i][j].obj.translateZ(z);
            this.matrix[i][j].obj.translateX(x);
            this.matrix[i][j].obj.translateY(COMPRIMENTO_BLOCO);
            this.matrix[i][j].setBB();
            x += this.largura_bloco;
        }
        z += this.altura_bloco;
    }
}

Blocos.prototype.checkCollision = function(object){
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            let bloco = this.matrix[i][j];
            let collision = bloco.bb.intersectsBox(object);
            if(collision && bloco.dureza > 0){
                bloco.dureza--;
                if(bloco.dureza == 0){
                    bloco.obj.material.visible = false;
                    bloco.edges.material.visible = false;
                }
                return bloco;
            }
        }
    }
    return null;
}

Blocos.prototype.calcAngulo = function(bola, bloco){

    let blocos_position = new THREE.Vector3();
    let bola_position = new THREE.Vector3();
    let angle = bola.angle;
    
    bloco.obj.getWorldPosition(blocos_position);
    bola.obj.getWorldPosition(bola_position);

    if(angle > 90 && angle < 270){
        //colisao esquerda
        if(bola_position.x > blocos_position.x + this.largura_bloco/2 + bola.raio/3){
            return calcAnguloSaida(angle,90);
        }
        return calcAnguloSaida(angle,0);
    }
    
    if(bola_position.x < blocos_position.x - this.largura_bloco/2 - bola.raio/3){
        //colisao direita
        return calcAnguloSaida(angle,270);
    }
    
    return calcAnguloSaida(angle,0);
}

Blocos.prototype.calcAnguloSaida = function(bola){
    let bloco = this.checkCollision(bola.bb);
    if(bloco != null){
        return this.calcAngulo(bola,bloco);
    }
    return bola.angle;
}



Blocos.prototype.reiniciaBlocos = function(){
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            let bloco = this.matrix[i][j];
            bloco.obj.material.visible = true;
            bloco.edges.material.visible = true;
            bloco.dureza = bloco.durezaTotal;
        }
    }
}

Blocos.prototype.setPosition = function(x,y,z){
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            this.matrix[i][j].obj.translateX(x);
            this.matrix[i][j].obj.translateY(y);
            this.matrix[i][j].obj.translateZ(z);
            this.matrix[i][j].setBB();
        }
    }
}

Blocos.prototype.addToScene = function(scene){
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            this.matrix[i][j].addToScene(scene);
        }
    }
}

Blocos.prototype.getBBs = function(){
    let array = [];
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            array.push(this.matrix[i][j].bb);
        }
    }
    return array;
}

Blocos.prototype.changeHelpersVisible = function(visible){
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            this.matrix[i][j].bbHelper.visible = visible;
        }
    }
}

Blocos.prototype.verificaWin = function(){
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            if(this.matrix[i][j].dureza > 0){
                return false;
            }
        }
    }
    return true;
}

Blocos.prototype.coloreBlocos = function(){

    let colors = ['dimgrey','red','yellow','dodgerblue','fuchsia','lime'];
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            let color = colors[i % 6];
            this.matrix[i][j].obj.material.color = new THREE.Color(color);
        }
    }

}

// ------------------------------

function Bloco(x, y, z, color = 'red', dureza = 1){
    this.obj = createBox(x,y,z,color);
    this.edges = createEdges(this.obj.geometry); 
    this.bb = new THREE.Box3().setFromObject(this.obj);
    this.bbHelper = new THREE.Box3Helper(this.bb);
    this.dureza = dureza;
    this.durezaTotal = dureza;

    this.bbHelper.visible = false;
    this.obj.add(this.edges);
}

Bloco.prototype.setPosition = function(x,y,z){
    this.obj.position.set(x,y,z);
    this.bb.setFromObject(this.obj);
}

Bloco.prototype.addToScene = function(scene){
    scene.add(this.obj);
    scene.add(this.bbHelper);
}

Bloco.prototype.setBB = function(){
    this.bb.setFromObject(this.obj);
}