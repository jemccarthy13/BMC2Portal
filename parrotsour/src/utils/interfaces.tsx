/**
 * This file contains commonly referenced TypeScript types (interfaces)
 * to be imported elsewhere
 */

import { PicCanvasProps, PicCanvasState } from "../canvas/draw/intercept/picturecanvas"

export type Bullseye = {
    x: number,
    y: number,
}

export type BRAA = {
    bearing: string,
    range: number,
}

export type Braaseye = {
    bull: BRAA,
    braa: BRAA,
}

export type AltStack = {
    stack: string,
    fillIns: string,
}

export type RedAir = {
    altitudes: AltStack,
    braaseye: Braaseye,
    trackDir?: string,
    label?: string,
}

export type Group = {
    startX: number,
    startY: number,
    x: number,
    y: number,
    heading: number,
    desiredHeading:number,
    desiredAlt?: number,
    z: number[],
    numContacts: number,
    type: string,
    label?: string,
    isCapping?: boolean,
    braaseye?: Braaseye,
    maneuvers?: boolean,
    maneuvered?: boolean,
    trackDir?: string,
    callsign?: string,
    radarPoints: Bullseye[][],
    drawnRadar: Bullseye[][],
    iffPoints?: Bullseye[][],
    tasking?: string,
    desiredLoc?: Bullseye[]
}

export type DrawAnswer = {
    pic: string,
    groups: Group[]
}

export interface DrawFunction {
    (canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    props: PicCanvasProps,
    state: PicCanvasState,
    start?: Bullseye
    ): DrawAnswer
}