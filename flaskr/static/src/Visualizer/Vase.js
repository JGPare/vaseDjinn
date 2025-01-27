

export default class Vase {
  constructor(params) {
      this.height = params.height
      this.width = params.width
      this.heightSegments = params.heightSegments
      this.radialSegments = params.radialSegments
      this.slope = params.slope
      this.thickness = params.thickness
      this.radials = params.radials
      this.verticals = params.verticals

      this.baseThickness = this.width / 2 * this.thickness
      this.solid = this.thickness == 1 ? true : false
  }
}