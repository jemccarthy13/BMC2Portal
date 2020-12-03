import { AltStack, Braaseye, Bullseye, DrawAnswer } from '../../../utils/interfaces'

import { randomNumber, randomHeading, getBR, getAltStack, getTrackDir } from '../../../utils/mathutilities'
import { drawAltitudes, drawArrow, drawBraaseye, drawMeasurement } from '../drawutils'
import { DrawFunction, Group } from '../../../utils/interfaces'
import { ProcCanvasProps, ProcCanvasState } from '../../proceduralcanvas';
import { formatGroup, getGroupOpenClose } from '../formatutils';

export const drawProcedural = (
  canvas: HTMLCanvasElement,
  ctx:CanvasRenderingContext2D,
  props: ProcCanvasProps,
  state: ProcCanvasState,
  start?: Bullseye):DrawAnswer => {
    return {
      pic: "",
      groups:[]
    }
}
