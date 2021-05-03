import { DataTrail, SensorType } from "./datatrail"
import { GroupParams } from "./group"
import { IDMatrix } from "./id"
import { AircraftIntent, IntentParams } from "./intent"
import { Point } from "../point"

import { PaintBrush } from "../../canvas/draw/paintbrush"
import { headingToRadians, randomNumber } from "../../utils/psmath"

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
  private centerOfMass = new Point(0, 0)

  private intent = new AircraftIntent()

  private ctx: CanvasRenderingContext2D | undefined

  constructor(p?: Partial<AircraftParams>) {
    if (!p) p = {}
    // temporary
    this.dataTrail = new DataTrail()
    if (p) {
      this.dataTrail = new DataTrail()
    }

    this.altitude = p.alt || 10
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

    // Set center of mass
    this.centerOfMass = this._getCenterOfMass(p.ctx, p.dataTrailType)

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
      dist = context.canvas.width / (context.canvas.width / 20)
    }

    const x = this.startPos.x + 5 * Math.cos(vector.offset)
    const y = this.startPos.y + 5 * -Math.sin(vector.offset)
    return new Point(
      x + 1.2 * dist * Math.cos(vector.radians),
      y + 1.2 * dist * -Math.sin(vector.radians)
    )
  }

  getCenterOfMass(): Point {
    return this.centerOfMass
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

  settIDMatrix(newID: IDMatrix): void {
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
   *
   * Primarily used for animation to move arrows.
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

    // compute a new center of mass
    this.centerOfMass = this._getCenterOfMass()
  }

  turnToTarget(): void {
    if (!this.intent.atFinalDestination()) {
      const tgtPos = this.intent.getNextRoutingPoint()
      this.intent.setDesiredHeading(
        this.getCenterOfMass().getBR(tgtPos).bearingNum
      )
    }

    const LH = (this.getHeading() - this.intent.getDesiredHeading() + 360) % 360
    const RH = (this.intent.getDesiredHeading() - this.getHeading() + 360) % 360
    let deltaA = RH
    if (LH < RH) {
      deltaA = -LH
    }

    let divisor = 7
    const absDelt = Math.abs(deltaA)
    if (absDelt > 90) {
      divisor = 15
    } else if (absDelt < 7) {
      divisor = 1
    }

    this.setCurHeading(this.getHeading() + deltaA / divisor)
  }

  updateIntent(newIntent: Partial<IntentParams>): void {
    this.intent.updateIntent(newIntent)
  }

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
      // this.setCapping(true)
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

  changeAltBy(incr: number): void {
    this.altitude += incr
  }

  doNextAltChange(): void {
    const atDesiredAlt = this.intent.getDesiredAltitude() === this.getAltitude()
    if (!atDesiredAlt) {
      if (this.intent.getDesiredAltitude() > this.getAltitude()) {
        this.changeAltBy(0.5)
      } else {
        this.changeAltBy(-0.5)
      }
    }
  }

  isTasked(): boolean {
    return this.intent.isOnTask()
  }
}
