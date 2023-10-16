import * as THREE from '../../build/three.module.js';
import { Vector } from '../../libs/other/CSGMesh.js';
import { radiansToDegrees, setDefaultMaterial } from '../../libs/util/util.js';

export function initOrtographicCamera(altura) {
    let aspect =  window.innerWidth / window.innerHeight;
    const ALTURA = altura
    const LARGURA = altura * aspect
    let camera = new THREE.OrthographicCamera(LARGURA / -2, LARGURA / 2, ALTURA / 2, ALTURA / -2, -500,500);
    camera.position.copy(new THREE.Vector3(0,1,0));
    camera.lookAt(0,0,0);
    return camera;
}

export function initPerspectiveCamera() {
    const Y = 48;
    const Z = -0.6;
    let camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1,100);
    camera.position.copy(new THREE.Vector3(0,Y,Z));
    camera.lookAt(0,0,Z);
    return camera;
}

export function setCamera(altura, camera, renderer) {
    
    let aspect =  window.innerWidth / window.innerHeight;
    if(camera instanceof THREE.OrthographicCamera){
        let h = altura;
        let w = h * aspect;
        
        camera.left = w / -2;   
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = h / -2;
        
    }else{
        camera.aspect = aspect;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
}

export function initLight(scene){
    const color = 'white';
    let light = new THREE.DirectionalLight(color,1.3);
    light.castShadow = true;
    scene.add(light);
    return light;
}

export function createBox(x,y,z,color = 'red'){
    let geometry = new THREE.BoxGeometry(x, y, z); 
    let material = new THREE.MeshLambertMaterial({color: color});
    let box = new THREE.Mesh( geometry, material)
    box.castShadow = true;
    box.receiveShadow = true;
    return box; 
}

export function createBall(raio, color){
    let geometry = new THREE.SphereGeometry(raio,30,30, 0, Math.PI * 2, 0, Math.PI);
    let material = new THREE.MeshPhongMaterial({color: color});
    let ball = new THREE.Mesh(geometry,material);
    ball.castShadow = true;
    ball.receiveShadow = true;
    return ball;
};

export function createTorus(raio,tubo,color){
    let material = new THREE.MeshPhongMaterial({color: color});
    let geometry = new THREE.TorusKnotGeometry(raio,tubo,50,10);
    return new THREE.Mesh(geometry,material);
};

export function createEdges(geometry){
    let edgeGeometry = new THREE.EdgesGeometry(geometry);
    return new THREE.LineSegments(edgeGeometry,setDefaultMaterial());
}

// Cria um rebatedor composto por 5 retangulos;
export function createRebatedor(tamanho){
    let obj = new THREE.Object3D();
    let x = tamanho * 2;
    for(let i = -x; i <= x; i += tamanho){
        let box = createBox(tamanho,1,1,'orangered');
        obj.add(box);
        box.translateX(i);
    }
    return obj;
}

export function createCylinder(raio, altura, color){
    let geometry = new THREE.CylinderGeometry(raio, raio, altura, 32);
    let material = new THREE.MeshLambertMaterial({color: color});
    return new THREE.Mesh(geometry, material);
}

export function calcAnguloSaida(angulo_colisao, angulo_superficie){
    let angle = 360 - angulo_colisao + (2 * angulo_superficie);
    return angle % 360;
}

export function anguloCirculo(position){
    let raio = position.distanceTo(new THREE.Vector3(0,0,0));
    let angle = Math.floor(radiansToDegrees(Math.acos(position.x / raio)));
    return angle;
}

export function Timer(func, delay){

    let timerId;
    let start;
    let restante = delay;

    this.pause = function(){
        window.clearTimeout(timerId);
        restante -= new Date() - start;
    }

    this.reset = function(){
        restante = delay;
    }

    let resume = function(){
        start = new Date();
        timerId = window.setTimeout(function(){
            restante = delay;
            resume();
            func();
        }, restante);
    }

    this.resume = resume;
}