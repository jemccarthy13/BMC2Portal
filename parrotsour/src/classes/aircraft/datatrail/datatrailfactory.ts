import { Point } from "../../point"
import { ArrowDataTrail } from "./arrowdatatrail"
import { DataTrail } from "./datatrail"
import { RawDataTrail } from "./rawdatatrail"
import { SensorType } from "./sensortype"

class defaultDataTrail extends DataTrail {
  create(startPos: Point) {
    return new defaultDataTrail(startPos)
  }
  getCenterOfMass(): Point {
    throw new Error("Method not implemented.")
  }
  draw(): void {
    throw new Error("Method not implemented.")
  }
}

export class DataTrailFactory {
  private static trailMap = new Map<
    SensorType,
    (startPos: Point) => DataTrail
  >()

  // TODO - DATATRAIL -- self-registering DataTrail child classes, if possible
  // static function register(type, createFunction)
  // each child has create(startPos) => return new [subtype]DataTrail
  static create(type: SensorType, startPos: Point, heading: number): DataTrail {
    switch (type) {
      case SensorType.ARROW:
        return new ArrowDataTrail(startPos)
      case SensorType.RAW:
        return new RawDataTrail(startPos, heading)
    }
  }
}
