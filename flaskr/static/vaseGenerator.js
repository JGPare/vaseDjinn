import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

class Vase{
    constructor(generic,radials,verticals){
        this.height = parseFloat(generic["height"])
        this.width = parseFloat(generic["width"])
        this.heightSegments = parseInt(generic["vertical_steps"])
        this.radialSegments = parseInt(generic["radial_steps"])
        this.slope = parseFloat(generic["slope"])
        this.slope = Math.PI/4*(this.slope/100 - 0.5)
        this.thickness = parseFloat(generic["thickness"])/100
        this.baseThickness = this.width/2*this.thickness
        this.solid = this.thickness == 1 ? true : false; 

        radials.forEach(radial => {
            radial.mag = parseFloat(radial.mag)/ 100
            radial.freq = parseFloat(radial.freq)
            radial.twist = parseFloat(radial.twist) / this.height 
            radial.phase = parseFloat(radial.phase) / 100
        })
        this.radials = radials

        verticals.forEach(vertical => {
            vertical.mag = parseFloat(vertical.mag)/ 100
            vertical.freq = parseFloat(vertical.freq) / this.height 
            vertical.phase = parseFloat(vertical.phase) / 100
        })
        this.verticals = verticals
    }
}

export function generateGeometry(vaseData)
{
    const generic = {...vaseData.generic0, ...vaseData.generic1}
    const radials = vaseData.radial
    const verticals = vaseData.vertical

    const vase = new Vase(generic,radials,verticals)
    
    let geometry = vase.solid ? generateSolidGeometry(vase) : generateHollowGeometry(vase)
   
    transformGeometry(geometry, vase)

    return geometry
}

function generateSolidGeometry(vase)
{
    const cylinderProperties = {
        radiusTop : vase.width + vase.width*vase.slope,
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
        radiusTop : vase.width + vase.width*vase.slope,
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
