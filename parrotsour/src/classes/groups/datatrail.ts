import { Point } from "classes/point"

export enum SensorType {
    RADAR,
    IFF,
    RAW, // radar & IFF
    ARROW
}

export class DataTrail {
    private radarData: Point[] = []
    private iffData: Point[] = []

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(startPos?: Point){
        // Initialize radar and iff based on start Pos
    }
}