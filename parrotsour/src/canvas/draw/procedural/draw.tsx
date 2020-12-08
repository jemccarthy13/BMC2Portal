import { randomHeading } from 'utils/mathutilities';
import { Bullseye, DrawAnswer } from '../../../utils/interfaces'

// import { randomNumber, randomHeading, getBR, getAltStack, getTrackDir } from '../../../utils/mathutilities'
// import { drawAltitudes, drawArrow, drawBraaseye, drawMeasurement } from '../drawutils'
// import { DrawFunction, Group } from '../../../utils/interfaces'
import { ProcCanvasProps, ProcCanvasState } from './proceduralcanvas';
import { Bounds, drawArrow, getStartPos } from '../drawutils';
// import { formatGroup, getGroupOpenClose } from '../formatutils';

export const drawProcedural = (
  canvas: HTMLCanvasElement,
  ctx:CanvasRenderingContext2D,
  props: ProcCanvasProps,
  state: ProcCanvasState,
  start?: Bullseye):DrawAnswer => {
    const bounds: Bounds = {
      tall: { lowX: 0, hiX: canvas.width, lowY: 0, hiY: canvas.height},
      wide: { lowX: 0, hiX: canvas.width, lowY: 0, hiY: canvas.height}
    }
    const startPos = getStartPos(canvas,props.orientation, bounds, start)
    const grp = drawArrow(canvas, props.orientation, 1, startPos.x, startPos.y, randomHeading("alsa", state.bluePos.heading))
    return {
      pic: "",
      groups:[grp]
    }
}
