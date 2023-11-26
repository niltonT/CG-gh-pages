import * as THREE from '../../build/three.module.js';
import { Vector } from '../../libs/other/CSGMesh.js';
import { degreesToRadians, radiansToDegrees, setDefaultMaterial, getMaxSize } from '../../libs/util/util.js';
import { OBJLoader } from '../../build/jsm/loaders/OBJLoader.js';
import { MTLLoader } from '/../../build/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from '/../../build/jsm/loaders/GLTFLoader.js';
import { ConvexGeometry } from '../../build/jsm/geometries/ConvexGeometry.js';
import { loadingManager } from '../BrickBreaker.js';


export function initOrtographicCamera(altura) {
    let aspect = window.innerWidth / window.innerHeight;
    const ALTURA = altura
    const LARGURA = altura * aspect
    let camera = new THREE.OrthographicCamera(LARGURA / -2, LARGURA / 2, ALTURA / 2, ALTURA / -2, -500, 500);
    camera.position.copy(new THREE.Vector3(0, 1, 0));
    camera.lookAt(0, 0, 0);
    return camera;
}

export function initPerspectiveCamera() {
    // Y = 30
    // Z = 18
    const X = 0;
    const Y = 24;
    const Z = 10;
    const ANGULO = 45;
    let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.copy(new THREE.Vector3(X, Y, Z));
    let zlook = Y / Math.tan(degreesToRadians(ANGULO));
    camera.lookAt(0, 0, -3.6);
    return camera;
}

export function setCamera(altura, camera, renderer) {

    let aspect = window.innerWidth / window.innerHeight;
    if (camera instanceof THREE.OrthographicCamera) {
        let h = altura;
        let w = h * aspect;

        camera.left = w / -2;
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = h / -2;

    } else {
        camera.aspect = aspect;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
}

export function initLight(scene) {
    const color = 'white';
    let light = new THREE.DirectionalLight(color, 1.3);
    light.castShadow = true;
    scene.add(light);
    return light;
}

export function createBox(x, y, z, color = 'red') {
    let geometry = new THREE.BoxGeometry(x, y, z);
    let material = new THREE.MeshLambertMaterial({ color: color });
    let box = new THREE.Mesh(geometry, material)
    box.castShadow = true;
    box.receiveShadow = true;
    return box;
}

export function createBall(raio, color) {
    let geometry = new THREE.SphereGeometry(raio, 30, 30, 0, Math.PI * 2, 0, Math.PI);
    let material = new THREE.MeshPhongMaterial({ color: color });
    let ball = new THREE.Mesh(geometry, material);
    ball.castShadow = true;
    ball.receiveShadow = true;
    return ball;
};

export function createTorus(raio, tubo, color) {
    let material = new THREE.MeshPhongMaterial({ color: color });
    let geometry = new THREE.TorusKnotGeometry(raio, tubo, 50, 10);
    return new THREE.Mesh(geometry, material);
};

export function createEdges(geometry) {
    let edgeGeometry = new THREE.EdgesGeometry(geometry);
    return new THREE.LineSegments(edgeGeometry, setDefaultMaterial());
}

// Cria um rebatedor composto por 5 retangulos;
export function createRebatedor(tamanho) {
    let obj = new THREE.Object3D();
    let x = tamanho * 2;
    for (let i = -x; i <= x; i += tamanho) {
        let box = createBox(tamanho, 1, 1, 'orangered');
        obj.add(box);
        box.translateX(i);
    }
    return obj;
}

export function createCylinder(raio, altura, color) {
    let geometry = new THREE.CylinderGeometry(raio, raio, altura, 32);
    let material = new THREE.MeshLambertMaterial({ color: color });
    return new THREE.Mesh(geometry, material);
}

export function calcAnguloSaida(angulo_colisao, angulo_superficie) {
    let angle = 360 - angulo_colisao + (2 * angulo_superficie);
    return angle % 360;
}

export function anguloCirculo(position) {
    let raio = position.distanceTo(new THREE.Vector3(0, 0, 0));
    let angle = Math.floor(radiansToDegrees(Math.acos(position.x / raio)));
    return angle;
}

export function Timer(func, delay) {

    let timerId;
    let start;
    let restante = delay;

    this.pause = function () {
        window.clearTimeout(timerId);
        restante -= new Date() - start;
    }

    this.reset = function () {
        restante = delay;
    }

    let resume = function () {
        start = new Date();
        timerId = window.setTimeout(function () {
            restante = delay;
            resume();
            func();
        }, restante);
    }

    this.resume = resume;
}

export function setMaterial(color, file = null, repeatU = 1, repeatV = 1, offsetX = 0, offsetY = 0) {
    if (!color) color = 'rgb(255,255,255)';

    let mat;
    let loader = new THREE.TextureLoader();
    if (!file) {
        mat = new THREE.MeshLambertMaterial({ color: color });
    } else {
        mat = new THREE.MeshLambertMaterial({ map: loader.load(file), color: color });
        mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
        mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;
        mat.map.repeat.set(repeatU, repeatV);
        mat.map.offset.x = offsetX;
        mat.map.offset.y = offsetY;
    }
    mat.side =  THREE.DoubleSide;
    //mat.flatShading = true;
    return mat;
}

export function setSkyBox(path, format) {
    let urls = [path + "xpos" + format,
    path + "xneg" + format,
    path + "ypos" + format,
    path + "yneg" + format,
    path + "zpos" + format,
    path + "zneg" + format];
    return new THREE.CubeTextureLoader().load(urls);
}

export function loadGLBFile(scene, modelPath, modelName, visibility, desiredScale) {
    var loader = new GLTFLoader(loadingManager);
    loader.load(modelPath + modelName + '.gltf', function (gltf) {
        var obj = gltf.scene;
        obj.name = modelName;
        obj.visible = visibility;
        obj.traverse(function (child) {
            if (child.isMesh) child.castShadow = true;
            if (child.material) child.material.side = THREE.DoubleSide;
        });

        var obj = normalizeAndRescale(obj, desiredScale);
        var obj = fixPosition(obj);

        scene.add(obj);
    });
}

export function loadOBJFile(scene, modelPath, modelName, visibility, desiredScale) {
    var mtlLoader = new MTLLoader(loadingManager);
    mtlLoader.setPath(modelPath);
    mtlLoader.load(modelName + '.mtl', function (materials) {
        materials.preload();

        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(modelPath);
        objLoader.load(modelName + ".obj", function (obj) {
            obj.name = modelName;
            obj.visible = visibility;
            obj.traverse(function (child) {
                if (child.isMesh) child.castShadow = true;
                if (child.material) child.material.side = THREE.DoubleSide;
            });

            var obj = normalizeAndRescale(obj, desiredScale);
            var obj = fixPosition(obj);

            scene.add(obj);
        });
    });
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale) {
    var scale = getMaxSize(obj);
    obj.scale.set(newScale * (1.0 / scale),
        newScale * (1.0 / scale),
        newScale * (1.0 / scale));
    return obj;
}

function fixPosition(obj) {
    // Fix position of the object over the ground plane
    var box = new THREE.Box3().setFromObject(obj);
    if (box.min.y > 0)
        obj.translateY(-box.min.y);
    else
        obj.translateY(-1 * box.min.y);
    return obj;
}

export function createRebatedorGeometry(raio, num_points, altura) {
    let v = createPoints(raio, num_points, altura);
    let f = createTriangules(v.length/3 - 1);
    let uv = createUV(v,raio);
    const n = v;
    
      var vertices = new Float32Array( v );
      var normals = new Float32Array( n );  
      var indices = new Uint32Array( f );
    
      let geometry = new THREE.BufferGeometry();
    
      geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
      geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
      geometry.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array(uv), 2 ) );
      geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
      geometry.computeVertexNormals(); 

    return geometry;
}

function createPoints(raio, num_points, altura) {
    let altura_relativa = raio - altura;
    let points = [0.0,-1,0.0];
    let comp = 180 / (num_points);
    for (let i = 0; i <= 180; i += comp) {
        let x = parseFloat((Math.cos(degreesToRadians(i)) * raio).toFixed(2));
        let y = parseFloat((Math.sin(degreesToRadians(i)) * raio).toFixed(2));
        if(y > altura_relativa){
            points.push(x);
            points.push(y);
            points.push(0.0);
            if(points[1] == -1){
                points[1] = y;
            }
        }
    }
    return points;
}

function createTriangules(num_points){
    let f = [];
    for(let i = 1; i < num_points; i++){
        f.push(i);
        f.push(0);
        f.push(i + 1);
    }
    return f;
}

function createUV(points,raio){
    let uv = [];
    for(let i = 0; i < points.length; i += 3){
        uv.push(points[i] * (0.5 / raio));
        uv.push(points[i + 1] * (0.5 / raio));
    }
    return uv;

}

export function createSuperior(raio,num_points,altura){
    let geometry = createRebatedorGeometry(raio,num_points,altura);
    let material = new THREE.MeshPhongMaterial({color:'white'});
    material.side =  THREE.DoubleSide;
    material.flatShading = true;
    return new THREE.Mesh(geometry,material);
}

export function createCapsule(raio,largura,asset,color){
    let obj = new THREE.Object3D();
    let sphere1 = createBall(raio,color);
    //sphere1.material = setMaterial(color);
    let sphere2 = createBall(raio,color);
    //sphere2.mateirial = setMaterial(color);

    let cylinder = createCylinder(raio,largura,color);
    cylinder.material = setMaterial(null,asset,1,1.3,0,-0.15);

    obj.add(cylinder);
    cylinder.rotateZ(degreesToRadians(-90));

    cylinder.add(sphere1,sphere2);
    sphere1.translateY(largura/2);
    sphere2.translateY(-largura/2);

    return obj;
}

export function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function playAudio(asset,listener){
    const audioLoader = new THREE.AudioLoader();
    const sound = new THREE.Audio(listener);
    audioLoader.load( asset, function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( false );
	sound.setVolume( 0.5 );
    sound.play();
    });
    return sound;
}