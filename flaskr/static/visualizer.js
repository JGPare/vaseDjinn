
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let container, mynav;

let camera, stats, cameraTarget, scene, renderer;

var WIDTH, HEIGHT;

var vaseMesh;

var vaseColor = 0x560bad;

let params;

let rotationSpeed = 0.8;

const exporter = new STLExporter();

const exportStlParams = {
    exportASCII: exportASCII,
    exportBinary: exportBinary
    };

init();
animate();

export function removeMesh(){
    scene.remove(vaseMesh)
}

export function setApperance(color){
    vaseColor = Number(color);
    vaseMesh.material.color.setHex(vaseColor);
}

export function getApperance(){
    return vaseMesh.material.color.getHex();
}

export function addMesh(){
    const loader = new STLLoader();
    console.log(stl_path);
    loader.load( stl_path, function ( geometry ) {

        const material = new THREE.MeshPhongMaterial( { color: vaseColor, specular: 0x494949, shininess: 100 } );
        vaseMesh = new THREE.Mesh( geometry, material );

        vaseMesh.position.set( 0, 0, 0 );
        vaseMesh.rotation.set(0,0,0);
        vaseMesh.scale.set( 0.02, 0.02, 0.02 );
        vaseMesh.rotation.x = -Math.PI / 2;

        vaseMesh.castShadow = true;
        vaseMesh.receiveShadow = true;

        scene.add( vaseMesh );

    } );

}

function init() {

    container = document.getElementById('mycanvas');
    mynav = document.getElementById('mynav');

    WIDTH = container.offsetWidth;
    HEIGHT = window.innerHeight;

    camera = new THREE.PerspectiveCamera( 35, WIDTH / HEIGHT, 1, 15 );
    camera.position.set( 3, 0.15, 3 );
    camera.position.y = 3;

    cameraTarget = new THREE.Vector3( 0, 0.5, 0 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x596869 );
    scene.fog = new THREE.Fog( 0x596869, 8, 15 );

    const ground = new THREE.Mesh( 
        new THREE.PlaneGeometry( 2000, 2000 ), 
        new THREE.MeshPhongMaterial( { color: 0x363946, depthWrite: false } ) );
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add( ground );

    const grid = new THREE.GridHelper( 200, 400, 0x000000, 0x000000 );
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add( grid );


    // ASCII file
    addMesh()

    // Lights

    scene.add( new THREE.HemisphereLight( 0x8d7c7c, 0x494966 ) );

    addShadowedLight( 1, 1, 1, 0xffffff, 1 );
    addShadowedLight( 0, 1, 1, 0x90e0ef, 1 );
    addShadowedLight( 1, 1, 0, 0xf72585, 1 );
    // addShadowedLight( 0.5, 1, - 1, 0xf72585, 1 );
    // renderer

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( WIDTH, HEIGHT );

    renderer.shadowMap.enabled = true;

    container.appendChild( renderer.domElement );

    // stats

    // stats = new Stats();
    // container.appendChild( stats.dom );

    //

    // orbit controls

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0.5, 0 );
    controls.minDistance = 2;
    controls.maxDistance = 8;
    controls.update();

    // add resize listener 

    window.addEventListener( 'resize', onWindowResize );

    // GUI

    params  = {
        "spin" : 0.5,
    };
    const colorFormats = {
        color: 0x560bad,
        object: { r: 1, g: 1, b: 1 },
        array: [ 1, 1, 1 ]
    };
           

    const gui = new GUI();
    const sceneFolder = gui.addFolder('Model');
    const exportFolder = gui.addFolder('Export');
    sceneFolder.add( params, 'spin',0,1,0.01).onFinishChange( 
        function (newSpin) {
            rotationSpeed = newSpin;
    });

    // Create color pickers for multiple color formats
    sceneFolder.addColor( colorFormats, 'color' ).onChange(
        function (newColor){
            vaseColor = newColor;
            console.log(newColor);
            vaseMesh.material.color.setHex(newColor);
        }
        );
        
    exportFolder.add( exportStlParams, 'exportASCII' ).name( 'Export STL (ASCII)' );
    exportFolder.add( exportStlParams, 'exportBinary' ).name( 'Export STL (Binary)' );
}

function exportASCII() {

    const result = exporter.parse( vaseMesh );
    saveString( result, $("#inputName").val()+'.stl' );

}

function exportBinary() {

    const result = exporter.parse( vaseMesh, { binary: true } );
    saveArrayBuffer( result, $("#inputName").val()+'.stl' );

}

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
    mynav = document.getElementById('mynav');

    WIDTH = container.offsetWidth;
    HEIGHT = window.innerHeight;

    camera.aspect = WIDTH/ HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize( WIDTH, HEIGHT );

}

function animate() {

    requestAnimationFrame( animate );
    render();
    // stats.update();

}

function render() {

    const timer = Date.now() * 0.0005;

    camera.lookAt( cameraTarget );

    scene.traverse( function ( vaseMesh ) {

                    if ( vaseMesh.isMesh === true ) {
                        vaseMesh.rotation.z = timer * rotationSpeed;
                    }
                } );

    renderer.render( scene, camera );

}

