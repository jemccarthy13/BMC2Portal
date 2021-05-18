import { Point } from "classes/point"
import { FORMAT } from "../classes/supportedformats"
import { SensorType } from "classes/aircraft/datatrail/sensortype"
import { AircraftGroup } from "classes/groups/group"

export enum BlueInThe {
  NORTH,
  SOUTH,
  EAST,
  WEST,
}

export class FightAxis {
  public static isNS(orientation: BlueInThe): boolean {
    return orientation === BlueInThe.NORTH || orientation === BlueInThe.SOUTH
  }
}

export class CanvasOrient {
  height = 0
  width = 0
  orient = BlueInThe.EAST
}

export interface CanvasProps {
  orientation: CanvasOrient
  picType: string
  braaFirst: boolean
  dataStyle: SensorType
  showMeasurements: boolean
  isHardMode: boolean
  newPic: boolean
  animate: boolean
  resetCallback?: () => void
  animateCallback: () => void
}

export interface PictureCanvasState {
  bullseye: Point
  blueAir: AircraftGroup
  answer: PictureAnswer
  reDraw: PictureReDrawFunction
  ctx?: CanvasRenderingContext2D
  animateCanvas?: ImageData
}

export interface CanvasDrawFunction {
  (context: CanvasRenderingContext2D): Promise<void>
}

export interface DrawCanvasProps extends CanvasProps {
  draw: CanvasDrawFunction
  bullseye: Point
  answer: PictureAnswer
}

export interface PictureCanvasProps extends CanvasProps {
  format: FORMAT
  setAnswer: { (answer: PictureAnswer): void }
  sliderSpeed: number
}

export type PictureAnswer = {
  pic: string
  groups: AircraftGroup[]
}

export interface PictureDrawFunction {
  (
    context: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    hasCaps: boolean,
    start?: Point
  ): PictureAnswer
}

export interface PictureReDrawFunction {
  (
    context: CanvasRenderingContext2D,
    forced?: boolean,
    start?: Point,
    hasCaps?: boolean
  ): PictureAnswer
}
