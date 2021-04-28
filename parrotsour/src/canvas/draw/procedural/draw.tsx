import { Bullseye, DrawAnswer } from '../../../utils/interfaces'
import { ProcCanvasProps, ProcCanvasState } from './proceduralcanvas';
import { Bounds, drawGroupCap, drawText, getStartPos } from '../drawutils';

export const drawProcedural = (
  canvas: HTMLCanvasElement,
  ctx:CanvasRenderingContext2D,
  props: ProcCanvasProps,
  state: ProcCanvasState,
  start?: Bullseye):DrawAnswer => {
    const bounds: Bounds = {
      tall: { lowX: 0.1, hiX: 0.9, lowY: 0.1, hiY: 0.9},
      wide: { lowX: 0.1, hiX: 0.9, lowY: 0.1, hiY: 0.9}
    }
    const startPos = getStartPos(canvas,props.orientation, bounds, start)
    
    const grp = drawGroupCap(canvas, props.orientation, 1, startPos.x, startPos.y, "blue")
    grp.desiredLoc=[{x:startPos.x, y:startPos.y}]
    grp.callsign = "VR01"
    
    drawText(canvas, ctx, grp.callsign, grp.x, grp.y+35, 12);
    console.log("blue group:",grp)
    return {
      pic: "",
      groups:[grp]
    }
}
