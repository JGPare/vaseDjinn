import * as THREE from 'three'

export function generateBaseGeometry(generic){

    console.log(generic)
    const height = parseFloat(generic["height"])
    const width = parseFloat(generic["width"])
    const heightSegments = parseInt(generic["vertical_steps"])
    const radialSegments = parseInt(generic["radial_steps"])
    const slope = parseFloat(generic["slope"])
    const solid = true;

    const cylinderProperties = {
        radiusTop : width*(2*slope/100),
        radiusBottom : width,
        height : height,
        radialSegments : radialSegments,
        heightSegments : heightSegments,
        openEnded : !solid,
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