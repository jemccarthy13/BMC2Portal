import { Point } from "../point"

export enum SensorType {
  RADAR,
  IFF,
  RAW, // radar & IFF
  ARROW,
}

export class DataTrail {
  private radarData: Point[] = []
  private iffData: Point[] = []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(startPos?: Point) {
    // Initialize radar and iff based on start Pos
  }
}

// ///// TODO -- in move, manage radar and IFF history (similar to vector arrow drawing)
// // if (props.dataStyle==="radar"){
// //   if (groups[x].radarPoints.length!==0){
// //     for (let z = 0; z < groups[x].radarPoints.length; z++){
// //       groups[x].radarPoints[z] = groups[x].radarPoints[z].slice(1)
// //       groups[x].drawnRadar[z] = groups[x].drawnRadar[z].slice(1)
// //       const endX = groups[x].radarPoints[z][groups[x].radarPoints[z].length-1].x
// //       const endY = groups[x].radarPoints[z][groups[x].radarPoints[z].length-1].y

// //       const startX = groups[x].radarPoints[z][0].x
// //       const startY = groups[x].radarPoints[z][0].y

// //       const deltX = endX-startX
// //       const deltY = endY-startY
// //       const rng = Math.sqrt(deltX * deltX + deltY * deltY)/3

// //       const newX = endX + (rng*Math.cos(rads+Math.random()/5))
// //       const newY = endY + (rng*-Math.sin(rads+Math.random()/5))
// //       groups[x].startX = groups[x].radarPoints[z][0].x
// //       groups[x].startY = groups[x].radarPoints[z][0].y

// //       const jit = 5
// //       const drawnX = newX + jit* Math.random()+Math.random()+Math.random()
// //       const drawnY = newY + jit*Math.random()+Math.random()+Math.random()

// //       groups[x].radarPoints[z].push({x:newX, y:newY})
// //       groups[x].drawnRadar[z].push({x:drawnX, y: drawnY})
// //     }
// //   }
// // }
