
import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { STLExporter } from 'three/addons/exporters/STLExporter.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import Experience from '../Experience.js'
import VaseGenerator from './VaseGenerator.js'
import Sizes from '../Utility/Sizes.js'

// aliased
const VG = VaseGenerator

// treated as static
const exporter = new STLExporter()
const exportStlParams = {
  exportASCII: exportASCII,
  exportBinary: exportBinary
}

let instance = null
let link = null

export default class Visualizer {
  constructor() {
    this.experience = new Experience()
    this.controlPanelVM = this.experience.controlPanelVM
    instance = this

    this.currentVase = null
    this.renderClock = new THREE.Clock()
    this.scale = 0.02
    this.currentVase = null
    this.camera = null
    
    this.vaseColor = 0x560bad
    this.gridColor = 0x363946

    // used by GUI top right
    this.params = {
      rotationSpeed: 0.5,
      color: this.vaseColor,
    }

    this.init()

    window.requestAnimationFrame( () =>
      {
        this.animate()
      })
  }

  init() {

    const gui = new GUI()
    const sceneFolder = gui.addFolder('Model')
    const exportFolder = gui.addFolder('Export')

    this.container = document.getElementById('mycanvas')

    this.WIDTH = this.container.offsetWidth
    this.HEIGHT = window.innerHeight

    // Scene

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x596869)
    this.scene.fog = new THREE.Fog(0x596869, 8, 15)

    // Ground

    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({
        color: this.gridColor,
        depthWrite: false
      }))

    this.ground.rotation.x = -Math.PI / 2
    this.ground.receiveShadow = true
    this.scene.add(this.ground)

    // Grid

    this.grid = new THREE.GridHelper(200, 400, 0x000000, 0x000000)
    this.grid.material.opacity = 0.2
    this.grid.material.transparent = true
    this.scene.add(this.grid)

    // Camera

    this.camera = new THREE.PerspectiveCamera(35, this.WIDTH / this.HEIGHT, 1, 15)
    this.camera.position.set(3, 3, 3)
    const cameraTarget = new THREE.Vector3(0, 0.5, 0)
    this.camera.lookAt(cameraTarget)

    // Axes Helper

    // const axesHelper = new THREE.AxesHelper( 5 );
    // this.scene.add( axesHelper );

    // Lights
    this.scene.add(new THREE.HemisphereLight(0x8d7c7c, 0x494966, 3))
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    this.addShadowedLight(1, 1, 1, 0xffffff, 2)
    this.addShadowedLight(0, 1, 1, 0x90e0ef, 2)
    this.addShadowedLight(1, 1, 0, 0xf72585, 2)

    // Renderer

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.WIDTH, this.HEIGHT)
    this.renderer.shadowMap.enabled = true

    this.container.appendChild(this.renderer.domElement)

    // Stats

    // stats = new Stats();
    // container.appendChild( stats.dom );

    // Orbit Controls

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(0, 0.5, 0)
    this.controls.minDistance = 2
    this.controls.maxDistance = 8
    this.controls.update()

    // Resize listener 

    window.addEventListener('resize', () => 
      this.onWindowResize())

    // GUI

    sceneFolder.add(this.params, 'rotationSpeed', 0, 1.0, 0.01).onFinishChange(
      function (newRotationSpeed) {
        rotationSpeed = newRotationSpeed
      })

    sceneFolder.addColor(this.params, 'color').onChange(
       (newColor) => {
        this.vaseColor = newColor
        this.vaseMesh.material.color.setHex(newColor)
      }
    )

    exportFolder.add(exportStlParams, 'exportASCII').name('Export STL (ASCII)')
    exportFolder.add(exportStlParams, 'exportBinary').name('Export STL (Binary)')
  }

  removeMesh() {
    this.scene.remove(this.vaseMesh)
  }

  setApperance(color) {
    this.vaseColor = Number(color)
    this.updateColor(this.vaseColor)
  }

  getApperance() {
    return this.vaseMesh.material.color.getHex()
  }

  setVase(vaseData) {
    this.currentVase = VG.generateVase(vaseData)
    if (this.vaseMesh) {
      this.updateGeometry(this.currentVase)
    } else {
      this.addMesh(this.currentVase)
    }
  }

  updateColor(color) {
    this.vaseMesh.material.color.setHex(color)
  }

  updateGeometry(vase) {
    const prevGeometry = this.vaseMesh.geometry
    this.vaseMesh.geometry = VG.generateGeometry(vase)
    prevGeometry.dispose()
    this.vaseMesh.geometry.computeBoundingBox()
    this.vaseMesh.position.set(0, this.scale * -this.vaseMesh.geometry.boundingBox.min.y, 0)
  }

  addMesh(vase) {
    const geometry = VG.generateGeometry(vase)
    
    geometry.computeBoundingBox()
    const material = new THREE.MeshPhongMaterial({
      color: this.vaseColor,
      emissive: 0x000000,
      specular: 0x111111,
      shininess: 0.5,
      flatShading: true,
    })

    this.vaseMesh = new THREE.Mesh(geometry, material)

    this.vaseMesh.scale.set(this.scale, this.scale, this.scale)
    this.vaseMesh.position.set(0, this.scale * -geometry.boundingBox.min.y, 0)
    this.vaseMesh.rotation.set(0, 0, 0)

    this.vaseMesh.castShadow = true
    this.vaseMesh.receiveShadow = true

    this.scene.add(this.vaseMesh)

  }

  addShadowedLight(x, y, z, color, intensity) {

    const directionalLight = new THREE.DirectionalLight(color, intensity)
    directionalLight.position.set(x, y, z)
    
    directionalLight.castShadow = true
    
    const d = 2
    directionalLight.shadow.camera.left = - d
    directionalLight.shadow.camera.right = d
    directionalLight.shadow.camera.top = d
    directionalLight.shadow.camera.bottom = - d
    directionalLight.shadow.camera.near = 1
    directionalLight.shadow.camera.far = 4
    directionalLight.shadow.bias = - 0.002
    
    this.scene.add(directionalLight)
  }
  
  onWindowResize() {
    this.container = document.getElementById('mycanvas')
  
    this.WIDTH = this.container.offsetWidth
    this.HEIGHT = window.innerHeight
    
    this.camera.aspect = this.WIDTH / this.HEIGHT
    this.camera.updateProjectionMatrix()
  
    this.renderer.setSize(this.WIDTH, this.HEIGHT)
  }
  
  animate() {
    this.render()
    window.requestAnimationFrame(() =>
    {
      this.animate()
    })
  }
  
  render() {
    const elapsedTime = this.renderClock.getElapsedTime()
    if (this.vaseMesh) {
      this.vaseMesh.rotation.y = elapsedTime * this.params.rotationSpeed
    }
    this.renderer.render(this.scene, this.camera)
  }
}


  // should be moved into it's own module
  function exportASCII() {
    const vaseMesh = instance.vaseMesh
    const tempMesh = new THREE.Mesh(vaseMesh.geometry, vaseMesh.material)
    tempMesh.scale.set(1 / scale, 1 / scale, 1 / scale)
  
    tempMesh.geometry.rotateX(Math.PI / 2)
    const result = exporter.parse(tempMesh)
    tempMesh.geometry.rotateX(-Math.PI / 2)
  
    saveString(result, $("#input-name").val() + '.stl')
    instance.controlPanelVM.incrementDownloads()
  
  }
  
  function exportBinary() {
    const vaseMesh = instance.vaseMesh
    const scale = instance.scale
    const tempMesh = new THREE.Mesh(vaseMesh.geometry, vaseMesh.material)
    tempMesh.scale.set(1 / scale, 1 / scale, 1 / scale)
  
    tempMesh.geometry.rotateX(Math.PI / 2)
    const result = exporter.parse(tempMesh, { binary: true })
    tempMesh.geometry.rotateX(-Math.PI / 2)
  
    saveArrayBuffer(result, $("#input-name").val() + '.stl')
  
  }
  
  link = document.createElement('a')
  link.style.display = 'none'
  document.body.appendChild(link)

  function save(blob, filename) {
  
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  
  }
  
  function saveString(text, filename) {
  
    save(new Blob([text], { type: 'text/plain' }), filename)
  
  }
  
  function saveArrayBuffer(buffer, filename) {
  
    save(new Blob([buffer], { type: 'application/octet-stream' }), filename)
  
  }




