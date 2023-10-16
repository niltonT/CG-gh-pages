import * as THREE from '../../build/three.module.js';
import { setDefaultMaterial } from '../../libs/util/util.js';

export function initCamera(altura) {
    let aspect =  window.innerWidth / window.innerHeight;
    const ALTURA = altura
    const LARGURA = altura * aspect
    let camera = new THREE.OrthographicCamera(LARGURA / -2, LARGURA / 2, ALTURA / 2, ALTURA / -2, -500,500);
    camera.position.copy(new THREE.Vector3(0,1,0));
    camera.lookAt(0,0,0);
    return camera;
}

export function setCamera(altura, camera, renderer) {
    let aspect =  window.innerWidth / window.innerHeight;
    let h = altura;
    let w = h * aspect;
    
    camera.left = w / -2;   
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = h / -2;
    
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function createBox(x,y,z,color = 'red'){
    let geometry = new THREE.BoxGeometry(x, y, z); 
    let material = setDefaultMaterial(color);
    return new THREE.Mesh( geometry, material); 
}

export function createBall(raio, color){
    let geometry = new THREE.SphereGeometry(raio,30,30, 0, Math.PI * 2, 0, Math.PI);
    let material = setDefaultMaterial(color);
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

export function calcAnguloSaida(angulo_colisao, angulo_superficie){
    let angle = 360 - angulo_colisao + (2 * angulo_superficie);
    return angle % 360;
}