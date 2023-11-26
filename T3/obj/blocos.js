import * as THREE from '../../build/three.module.js';
import { calcAnguloSaida, createBox, createEdges, setMaterial } from '../libs/util.js';

const COMPRIMENTO_BLOCO = 1;
const ALTURA_BLOCO = 1.2;
const INDESTRUTIVEL = -1;

const LV1 = [[2,2,2,2,2,2,2,2,2,2,2],
             [1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1],
             [1,1,1,1,1,1,1,1,1,1,1]];

const LV2 = [[0,2,1,1,1,0,1,1,1,2,0],
             [0,1,1,1,1,0,1,1,2,1,0],
             [0,1,1,1,1,0,1,2,1,1,0],
             [0,1,1,1,1,0,2,1,1,1,0],
             [0,1,1,1,1,0,1,1,1,1,0],
             [0,1,1,1,2,0,1,1,1,1,0],
             [0,1,1,2,1,0,1,1,1,1,0],
             [0,1,2,1,1,0,1,1,1,1,0],
             [0,2,1,1,1,0,1,1,1,2,0],
             [0,1,1,1,1,0,1,1,2,1,0],
             [0,1,1,1,1,0,1,2,1,1,0],
             [0,1,1,1,1,0,2,1,1,1,0],
             [0,1,1,1,1,0,1,1,1,1,0],
             [0,1,1,1,2,0,1,1,1,1,0]];

const LV3 = [[1,0,1,0,1,0,1,0,1,0,1],
             [1,0,1,0,1,0,1,0,1,0,1],
             [1,0,1,0,1,0,1,0,1,0,1],
             [1,0,INDESTRUTIVEL,1,INDESTRUTIVEL,1,INDESTRUTIVEL,1,INDESTRUTIVEL,0,1],
             [1,0,1,0,1,0,1,0,1,0,1],
             [1,0,1,0,1,0,1,0,1,0,1],
             [1,0,1,0,1,0,1,0,1,0,1],
             [1,0,1,0,1,0,1,0,1,0,1],
             [1,0,1,0,1,0,1,0,1,0,1],
             [1,0,INDESTRUTIVEL,0,INDESTRUTIVEL,0,INDESTRUTIVEL,0,INDESTRUTIVEL,0,1],
             [1,0,1,0,1,0,1,0,1,0,1]];

const LV1LINHAS = 6;
const LV1COLUNAS = 11;
const LV2LINHAS = 14;
const LV2COLUNAS = 11;
const LV3LINHAS = 11;
const LV3COLUNAS = 11;

const TEXTURE = "./assets/metal-plate2.jpg";

export function Blocos(nivel, altura, largura){

    this.altura = altura;
    this.largura = largura;
    this.constroiLevel(nivel);
    this.posicionaBlocos();
    this.coloreBlocos();
}

Blocos.prototype.constroiLevel = function (level){
    
    switch (level) {
        case 1: 
            this.num_linhas = LV1LINHAS;
            this.num_colunas = LV1COLUNAS;
            break;
        case 2:
            this.num_linhas = LV2LINHAS;
            this.num_colunas = LV2COLUNAS;
            break;
        case 3:
            this.num_linhas = LV3LINHAS;
            this.num_colunas = LV3COLUNAS;
            break;
    }
    
    this.altura_bloco = ALTURA_BLOCO;
    this.largura_bloco = this.largura / this.num_colunas;
    this.matrix = new Array(this.num_linhas);
    this.iniciaMatrix(level); 
}

Blocos.prototype.iniciaMatrix = function(level){
    
    let layout;
    switch (level) {
        case 1: 
            layout = LV1;
            break;
        case 2:
            layout = LV2;
            break;
        case 3:
            layout = LV3;
            break;
    }
    
    for(let i = 0; i < this.num_linhas; i++){
        this.matrix[i] = new Array(this.num_colunas);
        for(let j = 0; j < this.num_colunas; j++){
            let dureza = layout[i][j];
            let bloco = new Bloco(this.largura_bloco, COMPRIMENTO_BLOCO, this.altura_bloco,'red',dureza);
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
            if(collision && bloco.dureza != 0){
                if(bloco.dureza != INDESTRUTIVEL){
                    bloco.dureza--;
                }
                if(bloco.dureza == 1){
                    bloco.obj.material = setMaterial(null, null);
                    bloco.obj.material.color = new THREE.Color('grey');
                }
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

 
    //colisao esquerda
    if(angle > 90 && angle < 270){
        if(bola_position.x > blocos_position.x + this.largura_bloco/2){
            if(bola_position.z <= blocos_position.z + this.altura/2 + bola.raio){
                if(bola_position.z >= blocos_position.z - this.altura/2 - bola.raio){
                    return calcAnguloSaida(angle,90);
                }
            }
        }
        return calcAnguloSaida(angle,0);
    }
    
    //colisao direita
    if(bola_position.x < blocos_position.x - this.largura_bloco/2){
        if(bola_position.z <= blocos_position.z + this.altura/2 + bola.raio){
            if(bola_position.z >= blocos_position.z - this.altura/2 - bola.raio){
                return calcAnguloSaida(angle,270);
            }
        }
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
            if(bloco.dureza == 0){
                bloco.obj.material.visible = false;
                bloco.edges.material.visible = false;  
            }
        }
    }
    this.coloreBlocos();
}

Blocos.prototype.clear = function(){
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            let bloco = this.matrix[i][j];
            bloco.obj.material.visible = false;
            bloco.edges.material.visible = false;
            bloco.dureza = 0;
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
            let dureza = this.matrix[i][j].dureza;
            if(dureza != 0 && dureza != INDESTRUTIVEL){
                return false;
            }
        }
    }
    return true;
}

Blocos.prototype.blocosQuebrados = function(){
    let quebrados = 0;
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            if(this.matrix[i][j].dureza == 0){
                quebrados++;
            }
        }
    }
    return quebrados;
}

Blocos.prototype.coloreBlocos = function(){

    let colors = ['cyan','red','yellow','dodgerblue','fuchsia','lime'];
    let repeatU = 0.5;
    let repeatV = 0.25;
    let offsetX = 0.5;
    let offsetY = 0;
    for(let i = 0; i < this.num_linhas; i++){
        for(let j = 0; j < this.num_colunas; j++){
            let bloco = this.matrix[i][j].obj;
            if(this.matrix[i][j].dureza == 1){
                let color = colors[i % 6];
                bloco.material.color = new THREE.Color(color);
            }
            if(this.matrix[i][j].dureza == 2){
                bloco.material = setMaterial(null, TEXTURE,repeatU, repeatV,offsetX,offsetY);
            }
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
    this.obj.receiveShadow = false;

    if(dureza == 2){
        //this.obj.material.color = new THREE.Color('gray');
    }

    if(dureza == INDESTRUTIVEL){
        this.obj.material.color = new THREE.Color('goldenrod');
    }

    if(dureza == 0){
        this.obj.material.visible = false;
        this.edges.material.visible = false;  
    }
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