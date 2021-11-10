import { Point } from "../../point"
import { IDMatrix } from "../id"

// TODO -- DATATRAIL -- register? so that Aircraft can generate one of each type of datatrail?
// TODO -- DATATRAIL -- Support a toggle for the different Sensor Types.....
export abstract class DataTrail {
  private startPos: Point

  constructor(startPos: Point) {
    this.startPos = startPos
  }

  public getStartPos(): Point {
    return this.startPos
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public move(_heading: number): void {
    //console.warn("Moving DataTrail in base class. Will have no effect.")
  }

  abstract getCenterOfMass(heading: number): Point

  abstract draw(heading: number, id: IDMatrix): void
}
