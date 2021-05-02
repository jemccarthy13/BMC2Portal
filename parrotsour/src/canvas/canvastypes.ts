import { SensorType } from "classes/groups/datatrail";
import { AircraftGroup as AircraftGroup } from "classes/groups/group";
import { Point } from "classes/point";

export enum FightAxis {
    NS, EW
}

export type CanvasOrient = {
    height: number,
    width: number,
    orient: FightAxis
}

export interface CanvasProps {
    orientation: CanvasOrient,
    picType: string,
    braaFirst: boolean,
    dataStyle:SensorType,
    showMeasurements:boolean,
    isHardMode: boolean,
    newPic: boolean,
    animate:boolean,
    resetCallback?: ()=>void,
    animateCallback: ()=>void
}

export interface PictureCanvasState {
    bullseye: Point
    bluePos: AircraftGroup,
    answer:PictureAnswer,
    reDraw: PictureReDrawFunction,
    ctx?:CanvasRenderingContext2D,
    animateCanvas?: ImageData
}

export interface CanvasDrawFunction {
    (context: CanvasRenderingContext2D|null|undefined):Promise<void>
}

export interface DrawCanvasProps extends CanvasProps {
    draw: CanvasDrawFunction,
    bullseye: Point
}

export interface PictureCanvasProps extends CanvasProps {
    format:string,
    setAnswer: {(answer:PictureAnswer):void},
    sliderSpeed: number,
}

export type PictureAnswer = {
    pic: string,
    groups: AircraftGroup[]
}

export interface PictureDrawFunction {(
    context: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    start?: Point
    ): PictureAnswer
}

export interface PictureReDrawFunction {(
    context: CanvasRenderingContext2D,
    forced?: boolean,
    start?: Point):PictureAnswer
}