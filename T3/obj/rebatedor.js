import * as THREE from '../../build/three.module.js';
import { anguloCirculo, calcAnguloSaida, createBox, createEdges, createRebatedor, createRebatedorGeometry, loadGLBFile, setMaterial, createSuperior } from '../libs/util.js';
import { CSG } from '../../libs/other/CSGMesh.js'  
import { degreesToRadians } from '../../libs/util/util.js';

const ALTURA_RELATIVA = 0.15;
const FOLGA = 20;
const ANGULO_MAX = 180 - FOLGA;
const ANGULO_MIN = FOLGA;

function createCSGRebatedor(raio, largura, altura_relativa = 0.5,color){
  let altura = raio * altura_relativa;
  let auxMat = new THREE.Matrix4();
  let cylinderMesh = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, largura, 32));
  let cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(2 * raio, largura, 2 * raio));
  cubeMesh.position.set(0,0, altura);
  updateObject(cubeMesh);
  let cylinderCSG = CSG.fromMesh(cylinderMesh);
  let cubeCSG = CSG.fromMesh(cubeMesh);
  let obj = CSG.toMesh(cylinderCSG.subtract(cubeCSG),auxMat);
  obj.material = new THREE.MeshLambertMaterial({color: color});
  obj.castShadow = true;
  obj.receiveShadow = true;

  return obj;
}

function updateObject(mesh){
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
  mesh.matrixAutoUpdate = true;
}

export function Rebatedor(altura, largura, color){
    
  this.raio = altura / ALTURA_RELATIVA;
  this.altura = altura;
  this.largura = largura;

  this.obj = new THREE.Object3D();
  this.objCSG = createCSGRebatedor(this.raio,largura,ALTURA_RELATIVA,color);
  this.objLoaded =  new THREE.Object3D();
  loadGLBFile(this.objLoaded,'./assets/starchip/','scene',true,this.raio);

    this.obj.add(this.objCSG);
    this.obj.add(this.objLoaded);

    this.objLoaded.position.set(0,-0.3,0);
    this.objCSG.position.set(0,0,this.raio/1.35);

  this.position = new THREE.Vector3();
  this.setTexture();
}

Rebatedor.prototype.setTexture = function(){
    let traseira = createBox(this.getComprimento() - 0.02,this.largura,0.001,'white');
    traseira.material = setMaterial('white','./assets/force_field.jpg',0.9,0.15,0.1,0.1);
    this.objCSG.add(traseira);
    traseira.position.set(0,0,-(this.raio - this.altura - 0.001));

    let superior = createSuperior(this.raio,720,this.altura + 0.02);
    superior.rotateX(degreesToRadians(-90));
    superior.position.set(0,this.largura/2 + 0.001,0.01);
    superior.material = setMaterial(null,'./assets/force_field.jpg',1.8,1.8,-0.2,-0.5);
    this.objCSG.add(superior);
}

Rebatedor.prototype.checkCollision = function(position, raio){
  
  let position_rebatedor = new THREE.Vector3();
  this.objCSG.getWorldPosition(position_rebatedor);
  let distance = position_rebatedor.distanceTo(position);
  let position_object = position.clone();
  position_object = this.objCSG.worldToLocal(position_object);
  if(distance <= this.raio + raio){
      if(position_object.z < (0 - this.raio + this.altura + raio)){
         return true;
    }
  }
  return false;
}

Rebatedor.prototype.setPosition = function(x,y,z){
    this.obj.position.set(x,y,z);
    this.position.set(x,y,z);
}

Rebatedor.prototype.calcAnguloSaida = function(bola){
    
    if(!this.checkCollision(bola.obj.position,bola.raio)){
        return bola.angle;
    }

    if(bola.angle < 180){
        return bola.angle;
    }

    let position = this.obj.worldToLocal(bola.position);
    let normal = anguloCirculo(position);
    normal -= 90;

    if(normal < 0){
        normal = 360 + normal;
    }

    let angle = calcAnguloSaida(bola.angle,normal);
    
    if(angle > ANGULO_MAX){
        if(angle <= 270){
            angle = ANGULO_MAX;
        }else{
            angle = ANGULO_MIN;
        }
    }

    if(angle < ANGULO_MIN){
        angle = ANGULO_MIN;
    }

    return angle;
}


Rebatedor.prototype.getComprimento = function(){
    let comp = Math.sqrt((Math.pow(this.raio,2) - Math.pow((this.raio - this.altura),2)));
    return 2 * comp;
}

// =============================


const ANGULO_0 = 20;
const ANGULO_1 = 10;
const ANGULO_2 = 0;
const ANGULO_3 = 350;
const ANGULO_4 = 340;

export function RebatedorOld(tamanho = 1.3){

    this.tamanho = tamanho;    
    this.obj = createRebatedor(tamanho);
    this.position = new THREE.Vector3(0,0,0);
    this.bbs = [];
    this.helpers = [];

    this.iniciaBBs();
};

RebatedorOld.prototype.addToScene = function(scene){
    scene.add(this.obj);
    this.helpers.forEach(element => {
        scene.add(element);
    });
}

RebatedorOld.prototype.iniciaBBs = function(){
    this.obj.children.forEach(element => {
        let bb = new THREE.Box3().setFromObject(element);
        let helper = new THREE.Box3Helper(bb,'white');
        helper.visible = false;
        this.bbs.push(bb);
        this.helpers.push(helper);
    });
}

RebatedorOld.prototype.setPosition = function(x ,y, z){
    this.obj.position.set(x,y,z);
    this.position.set(x,y,z);
    this.setBBs();
}

RebatedorOld.prototype.setBBs = function(){
    let i = 0;
    this.obj.children.forEach(element => {
        this.bbs[i].setFromObject(element);
        i++;
    });
}

RebatedorOld.prototype.lerp = function(alpha) {
    
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


RebatedorOld.prototype.checkCollision = function(object){
    let indice = 0;
    for(;indice < this.bbs.length; indice++){
        if(this.bbs[indice].intersectsBox(object)){
            return indice;
        }

    }
    return -1;
}

RebatedorOld.prototype.calcAnguloSaida = function(bola){
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

RebatedorOld.prototype.changeHelpersVisible = function(visible){
    this.helpers.forEach(element => {
        element.visible = visible;
    });
}

