
import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { generateGeometry } from './vaseGenerator.js';

let container;

let camera, stats, cameraTarget, scene, renderer;

let WIDTH, HEIGHT;

let vaseMesh;

// 3JS UI

let params;
let vaseColor = 0x560bad;
let rotationSpeed = 0.8;

const clock = new THREE.Clock()

let scale = 0.02;

const exporter = new STLExporter();

const exportStlParams = {
    exportASCII: exportASCII,
    exportBinary: exportBinary
    };

init();
animate();

export function removeMesh(){
    scene.remove(vaseMesh);
}

export function setApperance(color){
    vaseColor = Number(color);
    vaseMesh.material.color.setHex(vaseColor);
}

export function getApperance(){
    return vaseMesh.material.color.getHex();
}

export function addMesh(vaseData){
    
    const geometry = generateGeometry(vaseData)
    geometry.computeBoundingBox()
    console.log(geometry.boundingBox);
    const material = new THREE.MeshPhongMaterial( { 
        color: vaseColor, 
        emissive: 0x000000,
        specular: 0x111111,
        shininess: 0.5,
        flatShading: true, } )

    vaseMesh = new THREE.Mesh( geometry, material );

    vaseMesh.scale.set( scale, scale, scale );
    vaseMesh.position.set( 0, scale*-geometry.boundingBox.min.y, 0);
    vaseMesh.rotation.set(0,0,0);

    vaseMesh.castShadow = true;
    vaseMesh.receiveShadow = true;

    scene.add( vaseMesh )

}

function init() {

    container = document.getElementById('mycanvas');

    WIDTH = container.offsetWidth;
    HEIGHT = window.innerHeight;

    // Scene

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x596869 );
    scene.fog = new THREE.Fog( 0x596869, 8, 15 );

    // Ground

    const ground = new THREE.Mesh( 
        new THREE.PlaneGeometry( 2000, 2000 ), 
        new THREE.MeshPhongMaterial( { 
            color: 0x363946,
            depthWrite: false } ) );
    
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add( ground );

    // Grid

    const grid = new THREE.GridHelper( 200, 400, 0x000000, 0x000000 );
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add( grid );

    // Camera

    camera = new THREE.PerspectiveCamera( 35, WIDTH / HEIGHT, 1, 15 );
    camera.position.set( 3, 3, 3 );
    cameraTarget = new THREE.Vector3( 0, 0.5, 0 );
    camera.lookAt( cameraTarget );

    // Axes Helper

    // const axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper );

    // Lights

    scene.add( new THREE.HemisphereLight( 0x8d7c7c, 0x494966 ) );

    addShadowedLight( 1, 1, 1, 0xffffff, 1 );
    addShadowedLight( 0, 1, 1, 0x90e0ef, 1 );
    addShadowedLight( 1, 1, 0, 0xf72585, 1 );
    
    // Renderer

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( WIDTH, HEIGHT );
    renderer.shadowMap.enabled = true;

    container.appendChild( renderer.domElement );

    // Stats

    // stats = new Stats();
    // container.appendChild( stats.dom );

    // Orbit Controls

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0.5, 0 );
    controls.minDistance = 2;
    controls.maxDistance = 8;
    controls.update();

    // Resize listener 

    window.addEventListener( 'resize', onWindowResize );

    // GUI

    params  = {
        rotationSpeed : 0.5,
        color: 0x560bad,
    }

    const gui = new GUI();
    const sceneFolder = gui.addFolder('Model');
    const exportFolder = gui.addFolder('Export');

    sceneFolder.add( params, 'rotationSpeed',0,1,0.01).onFinishChange( 
        function (newRotationSpeed) {
            rotationSpeed = newRotationSpeed;
    });

    sceneFolder.addColor( params, 'color' ).onChange(
        function (newColor){
            vaseColor = newColor;
            vaseMesh.material.color.setHex(newColor);
        }
        );
        
    exportFolder.add( exportStlParams, 'exportASCII' ).name( 'Export STL (ASCII)' );
    exportFolder.add( exportStlParams, 'exportBinary' ).name( 'Export STL (Binary)' );
}

function exportASCII() {

    const tempMesh = new THREE.Mesh( vaseMesh.geometry, vaseMesh.material );

    tempMesh.scale.set( 1/scale, 1/scale, 1/scale );

    const result = exporter.parse( tempMesh );
    saveString( result, $("#inputName").val()+'.stl' );

}

function exportBinary() {

    const tempMesh = new THREE.Mesh( vaseMesh.geometry, vaseMesh.material );

    tempMesh.scale.set( 1/scale, 1/scale, 1/scale );

    const result = exporter.parse( tempMesh, { binary: true } );
    saveArrayBuffer( result, $("#inputName").val()+'.stl' );

}

// Export functionality

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );

function save( blob, filename ) {

    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();

}

function saveString( text, filename ) {

    save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}

function saveArrayBuffer( buffer, filename ) {

    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}

function addShadowedLight( x, y, z, color, intensity ) {

    const directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set( x, y, z );
    scene.add( directionalLight );

    directionalLight.castShadow = true;

    const d = 2;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.bias = - 0.002;

}

function onWindowResize() {

    container = document.getElementById('mycanvas');

    WIDTH = container.offsetWidth;
    HEIGHT = window.innerHeight;

    camera.aspect = WIDTH/ HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize( WIDTH, HEIGHT );

}

function animate() {

    requestAnimationFrame( animate );
    render();

}

function render() {

    const elapsedTime = clock.getElapsedTime()

    if ( vaseMesh ) {
        vaseMesh.rotation.y = elapsedTime * rotationSpeed;
    }

    renderer.render( scene, camera );
}

