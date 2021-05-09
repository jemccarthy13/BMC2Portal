import { Point } from "../../point"
import { ArrowDataTrail } from "./arrowdatatrail"
import { DataTrail } from "./datatrail"
import { RawDataTrail } from "./rawdatatrail"
import { SensorType } from "./sensortype"

/**
 * Abstracts DataTrails from Aircraft - if a new DataTrail is added, it'll
 * add a new SensorType, a new constructor here, and implement the
 * required methods. Aircraft will automatically know to create that kind of trail.
 */
export class DataTrailFactory {
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
