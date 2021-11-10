import { Point } from "../../point"
import { IDMatrix } from "../id"
import { DataTrail } from "./datatrail"
import { IFFDataTrail } from "./iffdatatrail"
import { RadarDataTrail } from "./radardatatrail"

export class RawDataTrail extends DataTrail {
  private iffDataTrail: IFFDataTrail
  private rdrDataTrail: RadarDataTrail

  constructor(startPos: Point, heading: number) {
    super(startPos)
    this.iffDataTrail = new IFFDataTrail(startPos, heading)
    this.rdrDataTrail = new RadarDataTrail(startPos, heading)
  }

  getCenterOfMass(): Point {
    return this.rdrDataTrail.getCenterOfMass()
  }

  move(heading: number): void {
    this.iffDataTrail.move(heading)
    this.rdrDataTrail.move(heading)
  }

  draw(heading: number, id: IDMatrix): void {
    this.iffDataTrail.draw(heading, id)
    this.rdrDataTrail.draw(heading, id)
  }
}
