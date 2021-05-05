import { DataTrail, SensorType } from "./datatrail"
import { GroupParams } from "./group"
import { IDMatrix } from "./id"
import { AircraftIntent, IntentParams } from "./intent"
import { Point } from "../point"
import Tasking from "./tasking"

import { PaintBrush } from "../../canvas/draw/paintbrush"
import {
  getDegDeltaBetween,
  headingToRadians,
  randomNumber,
} from "../../utils/psmath"

/*
 * TODO -- For EWI fill-ins, implement more AC types?
 */
export enum ACType {
  FTR,
  RPA,
  TANK,
  AEW,
}

interface AircraftParams extends GroupParams {
  alt: number
  type: ACType
}

/**
 * TODO -- AIRCRAFT -- consider moving to a structure like
 * https://khalilstemmler.com/blogs/typescript/getters-and-setters/
 * To reduce the number of functions provided in the aircraft "api"
 */
export class Aircraft {
  // AASI (alt, aspect, speed, ID)
  private altitude: number
  private heading: number
  // TODO -- implement aircraft speed
  // private speed: number
  private id: IDMatrix

  // TODO -- implement radar/iff data
  // Radar and IFF data associated with this group
  private dataTrail: DataTrail

  private type: ACType

  private startPos = new Point(0, 0)

  private intent = new AircraftIntent()
  private tasking: Tasking | undefined

  private ctx: CanvasRenderingContext2D | undefined

  constructor(p?: Partial<AircraftParams>) {
    if (!p) p = {}
    // temporary
    this.dataTrail = new DataTrail()
    //if (p) { // why would we need to pass in a DataTrail if it's associated with this aircraft?
    // this.dataTrail = new DataTrail()
    //}

    this.heading = p.hdg || 90
    this.id = p.id || IDMatrix.HOSTILE
    this.type = p.type || ACType.FTR

    // Set current position
    this.startPos.x = p.sx || randomNumber(1, 100)
    this.startPos.y = p.sy || randomNumber(1, 100)

    let low = 15
    let hi = 45
    if (this.type === ACType.RPA) {
      low = 0o5
      hi = 18
    }

    // Set AACSI (alt, aspect, # contacts, speed, ID)
    this.altitude = p.alt || randomNumber(low, hi)

    this.ctx = p.ctx || undefined
  }

  public getAltitude(): number {
    return this.altitude
  }

  public getStartPos(): Point {
    return this.startPos
  }

  /**
   * Get the center of mass position for this group.
   *
   * The type of data trail dictates where the center of mass is.
   * (i.e. radar - last sensed radar vs. arrow - loc of arrow head)
   *
   * @param ctx Current drawing context
   * @param dataStyle (Radar & IFF) | Arrows - must explicitly be set if drawing
   *                  anything other than arrows
   */
  private _getCenterOfMass(
    ctx?: CanvasRenderingContext2D,
    dataStyle?: SensorType
  ): Point {
    dataStyle = dataStyle || SensorType.ARROW
    if (dataStyle === SensorType.ARROW) {
      return this._getCenterOfMassArrow(ctx)
    } else {
      // return this.snsrData.current
      throw "help"
      //return Point.DEFAULT
    }
  }

  /**
   * The "center of mass" for a singular aircraft is the end point
   * of the Arrow.
   */
  private _getCenterOfMassArrow(ctx?: CanvasRenderingContext2D): Point {
    const vector = headingToRadians(this.getHeading())
    let dist = 10

    const context = ctx || this.ctx
    if (context) {
      dist = Math.floor(context.canvas.width / (context.canvas.width / 20))
    }

    return new Point(
      Math.floor(this.startPos.x + 1.2 * dist * Math.cos(vector.radians)),
      Math.floor(this.startPos.y + 1.2 * dist * -Math.sin(vector.radians))
    )
  }

  getCenterOfMass(): Point {
    return this._getCenterOfMass()
  }

  public getHeading(): number {
    return this.heading
  }

  public setCurHeading(hdg: number): void {
    this.heading = hdg
  }

  getIDMatrix(): IDMatrix {
    return this.id
  }

  setIDMatrix(newID: IDMatrix): void {
    this.id = newID
  }

  getType(): ACType {
    return this.type
  }

  draw(context: CanvasRenderingContext2D, dataStyle: SensorType): void {
    const brush: PaintBrush = new PaintBrush(context)
    brush.drawAircraftSensorData(
      this,
      this.startPos.x,
      this.startPos.y,
      dataStyle
      //groups[x].radarPoints,
      //groups[x].iffPoints,
      //groups[x].drawnRadar
    )
  }

  /**
   * Move the arrow once based on the current heading / vector.
   */
  move(): void {
    // if (this.isCapping()) return
    this.turnToTarget()

    // convert heading to radians and calculate how much arrow needs to move
    const rads: number = headingToRadians(this.getHeading()).radians
    const offsetX: number = 7 * Math.cos(rads)
    const offsetY: number = -7 * Math.sin(rads)

    // apply offsets based on start/end position
    this.startPos.x += offsetX
    this.startPos.y += offsetY
  }

  turnToTarget(): void {
    if (!this.intent.atFinalDestination()) {
      const tgtPos = this.intent.getNextRoutingPoint()
      this.intent.setDesiredHeading(
        this.getCenterOfMass().getBR(tgtPos).bearingNum
      )
    }

    const turnDegrees = getDegDeltaBetween(
      this.getHeading(),
      this.intent.getDesiredHeading()
    )

    let divisor = 7
    const absDelt = Math.abs(turnDegrees)
    if (absDelt >= 90) {
      divisor = 15
    } else if (absDelt < 7) {
      divisor = 1
    }

    this.setCurHeading(this.getHeading() + turnDegrees / divisor)
  }

  updateIntent(newIntent: Partial<IntentParams>): void {
    this.intent.updateIntent(newIntent)
  }

  /**
   * Routing logic
   */

  doNextRouting(): void {
    if (!this.intent.atFinalDestination()) {
      if (this.intent.atNextRoutingPoint(this.getCenterOfMass())) {
        this.intent.removeRoutingPoint()
      }
      const nextPt = this.intent.getNextRoutingPoint()
      this.updateIntent({
        desiredHeading: this.getCenterOfMass().getBR(nextPt).bearingNum,
      })
    } else {
      throw "Need to make capping logic compatible with Intent & class structure."
    }
  }

  hasRouting(): boolean {
    return !this.intent.atFinalDestination()
  }

  getNextRoutingPoint(): Point {
    return this.intent.getNextRoutingPoint()
  }

  addRoutingPoint(pt: Point): void {
    this.intent.addRoutingPoint(pt)
  }

  /**
   * If not at desired altitude, increment to climb/descend towards intended altitude.
   */
  doNextAltChange(): void {
    const atDesiredAlt = this.intent.getDesiredAltitude() === this.getAltitude()
    if (!atDesiredAlt) {
      if (this.intent.getDesiredAltitude() > this.getAltitude()) {
        this.altitude += 0.5
      } else {
        this.altitude += -0.5
      }
    }
  }

  /**
   * Tasking logic section
   */

  isTasked(): boolean {
    return this.tasking !== undefined
  }

  clearTasking(): void {
    this.tasking = undefined
  }

  setTasking(task: Tasking): void {
    this.tasking = task
  }

  getTasking(): Tasking | undefined {
    return this.tasking
  }
}
