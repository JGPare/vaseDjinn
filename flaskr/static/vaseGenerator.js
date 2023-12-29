import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

let currentVase;

class Vase{
    constructor(params){
        this.height = params.height
        this.width = params.width
        this.heightSegments = params.heightSegments
        this.radialSegments = params.radialSegments
        this.slope = params.slope
        this.thickness = params.thickness
        this.radials = params.radials
        this.verticals = params.verticals
        
        this.baseThickness = this.width/2*this.thickness
        this.solid = this.thickness == 1 ? true : false
    }
    static createFromObjects(generic,radials,verticals) {
        let params = {
            height : parseFloat(generic.height),
            width : parseFloat(generic.width),
            heightSegments : parseInt(generic.vertical_steps),
            radialSegments : parseInt(generic.radial_steps),
            slope : Math.PI/4*(parseFloat(generic.slope)/100 - 0.5),
            thickness : parseFloat(generic.thickness)/100,
        }

        radials.forEach(radial => {
            radial.mag = parseFloat(radial.mag)/ 20
            radial.freq = parseFloat(radial.freq)
            radial.twist = parseFloat(radial.twist) / params.height 
            radial.phase = parseFloat(radial.phase) / 100
        })
        params.radials = radials

        verticals.forEach(vertical => {
            vertical.mag = parseFloat(vertical.mag)/ 20
            vertical.freq = parseFloat(vertical.freq) / params.height 
            vertical.phase = parseFloat(vertical.phase) / 100
        })
        params.verticals = verticals
        return new Vase(params)
    }
}

export function mergeVases(baseVase,newVase,amountNew){
    
    let radials = []
    for (let index = 0; index < baseVase.radials.length; index++) {
        radials.push({
            mag   : baseVase.radials[index].mag*(1-amountNew) + newVase.radials[index].mag*amountNew,
            freq  : baseVase.radials[index].freq*(1-amountNew) + newVase.radials[index].freq*amountNew,
            twist : baseVase.radials[index].twist*(1-amountNew) + newVase.radials[index].twist*amountNew,
            phase : baseVase.radials[index].phase*(1-amountNew) + newVase.radials[index].phase*amountNew,
        })
    }
    let verticals = []
    for (let index = 0; index < baseVase.radials.length; index++) {
        verticals.push({
            mag   : baseVase.verticals[index].mag*(1-amountNew) + newVase.verticals[index].mag*amountNew,
            freq  : baseVase.verticals[index].freq*(1-amountNew) + newVase.verticals[index].freq*amountNew,
            phase : baseVase.verticals[index].phase*(1-amountNew) + newVase.verticals[index].phase*amountNew,
        })
    }
    let heightSegments = parseInt(baseVase.heightSegments*(1-amountNew) + newVase.heightSegments*amountNew)
    let radialSegments = parseInt(baseVase.radialSegments*(1-amountNew) + newVase.radialSegments*amountNew)

    heightSegments = Math.min(heightSegments,50)
    radialSegments = Math.min(radialSegments,50)

    let params = {
        height : baseVase.height*(1-amountNew) + newVase.height*amountNew,
        width : baseVase.width*(1-amountNew) + newVase.width*amountNew,
        heightSegments : heightSegments,
        radialSegments : radialSegments,
        slope : baseVase.slope*(1-amountNew) + newVase.slope*amountNew,
        thickness : baseVase.thickness*(1-amountNew) + newVase.thickness*amountNew,
        radials : radials,
        verticals : verticals,
    }
    return new Vase(params)
}

export function generateVase(vaseData){
    const generic = {...vaseData.generic0, ...vaseData.generic1}
    const radials = vaseData.radial
    const verticals = vaseData.vertical

    return Vase.createFromObjects(generic,radials,verticals)
}

export function generateGeometry(vase)
{
    
    let geometry = vase.solid ? generateSolidGeometry(vase) : generateHollowGeometry(vase)
   
    transformGeometry(geometry, vase)

    return geometry
}

function generateSolidGeometry(vase)
{
    const cylinderProperties = {
        radiusTop : Math.max(vase.width + vase.height*vase.slope, 0),
        radiusBottom : vase.width,
        height : vase.height,
        radialSegments : vase.radialSegments,
        heightSegments : vase.heightSegments,
        openEnded : false,
        thetaStart : 0,
        thetaLength : 2*Math.PI
    }
    
    const geometry = new THREE.CylinderGeometry( 
        cylinderProperties.radiusTop,
        cylinderProperties.radiusBottom,
        cylinderProperties.height,
        cylinderProperties.radialSegments,
        cylinderProperties.heightSegments,
        cylinderProperties.openEnded,
        cylinderProperties.thetaStart,
        cylinderProperties.thetaLength
        )
    
    return geometry
}

function generateHollowGeometry(vase)
{
    const outsideCylinderProperties = {
        radiusTop : Math.max(vase.width + vase.height*vase.slope, 0),
        radiusBottom : vase.width,
        height : vase.height,
        radialSegments : vase.radialSegments,
        heightSegments : vase.heightSegments,
        openEnded : true,
        thetaStart : 0,
        thetaLength : 2*Math.PI
    }
    const insideCylinderProperties = {
        radiusTop : outsideCylinderProperties.radiusTop * (1 - vase.thickness),
        radiusBottom : outsideCylinderProperties.radiusBottom * (1 - vase.thickness),
        height : vase.height - vase.baseThickness,
        radialSegments : vase.radialSegments,
        heightSegments : vase.heightSegments,
        openEnded : true,
        thetaStart : 0,
        thetaLength : 2*Math.PI
    }
    
    const upperRingProperties = {
        innerRadius : insideCylinderProperties.radiusTop,
        outerRadius : outsideCylinderProperties.radiusTop,
        thetaSegments : vase.radialSegments,
        phiSegments : 1,
        thetaStart : 0,
        thetaLength : 2*Math.PI
    }

    const insideLowerCircleProperties = {
        radius : insideCylinderProperties.radiusBottom,
        segments : vase.radialSegments,
        thetaStart : 0,
        thetaLength : 2*Math.PI
    }

    const outsideLowerCircleProperties = {
        radius : outsideCylinderProperties.radiusBottom,
        segments : vase.radialSegments,
        thetaStart : 0,
        thetaLength : 2*Math.PI
    }

    const outsideGeometry = new THREE.CylinderGeometry( 
        outsideCylinderProperties.radiusTop,
        outsideCylinderProperties.radiusBottom,
        outsideCylinderProperties.height,
        outsideCylinderProperties.radialSegments,
        outsideCylinderProperties.heightSegments,
        outsideCylinderProperties.openEnded,
        outsideCylinderProperties.thetaStart,
        outsideCylinderProperties.thetaLength
        )

    const insideGeometry = new THREE.CylinderGeometry( 
        insideCylinderProperties.radiusTop,
        insideCylinderProperties.radiusBottom, 
        insideCylinderProperties.height,
        insideCylinderProperties.radialSegments,
        insideCylinderProperties.heightSegments,
        insideCylinderProperties.openEnded,
        insideCylinderProperties.thetaStart,
        insideCylinderProperties.thetaLength
        )
    insideGeometry.scale(-1,-1,-1) // fixes normals for inside surface
    insideGeometry.rotateX(Math.PI) // fixes top and bottom orientation from scale
    insideGeometry.translate(0,vase.baseThickness/2,0)

    const upperGeometry = new THREE.RingGeometry(
        upperRingProperties.innerRadius,
        upperRingProperties.outerRadius,
        upperRingProperties.thetaSegments,
        upperRingProperties.phiSegments,
        upperRingProperties.thetaStart,
        upperRingProperties.thetaLength
    )
    upperGeometry.rotateX(-Math.PI/2)
    upperGeometry.rotateY(-Math.PI/2)
    upperGeometry.translate(0,vase.height/2,0)

    const insideLowerGeometry = new THREE.CircleGeometry(
        insideLowerCircleProperties.radius,
        insideLowerCircleProperties.segments,
        insideLowerCircleProperties.thetaStart,
        insideLowerCircleProperties.thetaLength
    )
    insideLowerGeometry.rotateX(-Math.PI/2)
    insideLowerGeometry.rotateY(-Math.PI/2)
    insideLowerGeometry.translate(0,-vase.height/2+vase.baseThickness,0)

    const outsideLowerGeometry = new THREE.CircleGeometry(
        outsideLowerCircleProperties.radius,
        outsideLowerCircleProperties.segments,
        outsideLowerCircleProperties.thetaStart,
        outsideLowerCircleProperties.thetaLength
    )
    outsideLowerGeometry.rotateX(Math.PI/2)
    outsideLowerGeometry.rotateY(-Math.PI/2)
    outsideLowerGeometry.translate(0,-vase.height/2,0)

    let geometry = BufferGeometryUtils.mergeGeometries([insideGeometry,outsideGeometry,upperGeometry, insideLowerGeometry, outsideLowerGeometry])
    geometry = BufferGeometryUtils.mergeVertices(geometry,1e-2)
    return geometry
}

function transformGeometry(geometry, vase)
{
    var position = geometry.attributes.position

    for (var i = 0; i < position.count; i++){
            const x = position.getX(i)
            const y = position.getY(i)
            const z = position.getZ(i)

            const cylinderical = new THREE.Cylindrical()
            cylinderical.setFromCartesianCoords(x,y,z)

            vase.radials.forEach(modifier => {
                cylinderical.radius += modifier.mag * Math.sin(modifier.freq * cylinderical.theta 
                    + modifier.twist * cylinderical.y
                    + modifier.phase * 2 * Math.PI) 
            });

            vase.verticals.forEach(modifier => {
                cylinderical.radius += modifier.mag * Math.sin(modifier.freq * cylinderical.y 
                    + modifier.phase * 2 * Math.PI) 
            });

            const cartisian = new THREE.Vector3()
            cartisian.setFromCylindrical(cylinderical)

            position.setXYZ(i,cartisian.x,cartisian.y,cartisian.z)
    }
}
