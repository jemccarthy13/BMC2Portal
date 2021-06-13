// Classes and interfaces
import { DataTrail } from "./datatrail/datatrail"
import { SensorType } from "./datatrail/sensortype"
import { GroupParams } from "../groups/group"
import { IDMatrix } from "./id"
import { AircraftIntent, IntentParams } from "./intent"
import { Point } from "../point"
import Tasking from "../taskings/tasking"

// Functions
import {
  getDegDeltaBetween,
  headingToRadians,
  randomNumber,
} from "../../utils/psmath"
import { DataTrailFactory } from "./datatrail/datatrailfactory"

/*
 * TODO -- EWI -- for fill-ins, implement more AC types?
 */
export enum ACType {
  FTR,
  RPA,
  TANK,
  AEW,
}

/**
 * Aircraft have all the parameters of Groups, plus a single
 * altitude and configurable type.
 */
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
  // TODO -- SPEED -- implement aircraft speed logic
  // private speed: number
  private id: IDMatrix

  private dataTrail: Map<number, DataTrail>

  private type: ACType

  private startPos = new Point(0, 0)

  private intent = new AircraftIntent()
  private tasking: Tasking | undefined
  private capping = false

  private ctx: CanvasRenderingContext2D | undefined

  constructor(p?: Partial<AircraftParams>) {
    if (!p) p = {}

    // Take given heading/ID/EWI or use default
    this.heading = p.hdg || 90
    this.id = p.id || IDMatrix.HOSTILE
    this.type = p.type || ACType.FTR

    // Set current position
    this.startPos.x = p.sx || randomNumber(1, 100)
    this.startPos.y = p.sy || randomNumber(1, 100)

    // TODO -- DATATRAIL -- store a map of SensorType -> DataTrail
    // here, so it has both kinds of data trails available.
    // Then, in the PSControls, toggling data trail types only
    // triggers a redraw of existing groups' data trails (via .draw())
    this.dataTrail = new Map<number, DataTrail>()

    for (const type in SensorType) {
      if (!Number.isNaN(Number(type)))
        this.dataTrail.set(
          Number(type),
          DataTrailFactory.create(
            Number(type),
            this.startPos,
            this.getHeading()
          )
        )
    }

    // Set current altitude
    let low = 15
    let hi = 45
    if (this.type === ACType.RPA) {
      low = 0o5
      hi = 18
    }
    this.altitude = p.alt || randomNumber(low, hi)

    // Attach this group to a drawing context, if given
    this.ctx = p.ctx || undefined

    // Current matches desired initially
    this.intent.setDesiredHeading(this.heading)
  }

  /*************************************************************************
   * Location
   *************************************************************************/
  /**
   * @returns Start position for where this Aircraft's draw will start; will be approximately
   * the 'rear'' end of the data trail.
   */
  public getStartPos(): Point {
    return this.startPos
  }

  /**
   * Get the center of mass position for this group.
   *
   * The type of data trail dictates where the center of mass is.
   * (i.e. radar - last sensed radar vs. arrow - loc of arrow head)
   *
   * @param dataStyle (Radar & IFF) | Arrows - must explicitly be set if drawing
   *                  anything other than arrows
   * @param ctx Current drawing context
   */
  getCenterOfMass(dataStyle?: SensorType): Point {
    if (this.isCapping()) {
      return this.getStartPos()
    }
    dataStyle = dataStyle === undefined ? SensorType.ARROW : dataStyle
    const dataTrail = this.dataTrail.get(dataStyle)
    if (dataTrail) {
      return dataTrail.getCenterOfMass(this.getHeading())
    } else {
      return new Point(-1, -1)
    }
  }

  /**
   * @returns true iff Aircraft is capping (at desired final Route location)
   */
  isCapping(): boolean {
    return this.capping
  }

  /**
   * @param newVal New value for isCapping
   */
  setCapping(newVal: boolean): void {
    this.capping = newVal
  }

  /*************************************************************************
   * Heading and track direction/aspect
   *************************************************************************/
  /**
   * @returns Current heading of this Aircraft
   */
  public getHeading(): number {
    return this.heading
  }

  /**
   * @param hdg Set new heading of this Aircraft
   */
  public setHeading(hdg: number): void {
    this.heading = hdg
  }

  /*************************************************************************
   * Altitude
   *************************************************************************/
  /**
   * @returns Current altitude of this Aircraft
   */
  public getAltitude(): number {
    return this.altitude
  }

  /*************************************************************************
   * Speed -- TODO
   *************************************************************************/

  /*************************************************************************
   * ID
   *************************************************************************/
  /**
   * @returns Current IDMatrix (HOS/NEU/etc) of this Aircraft.
   */
  getIDMatrix(): IDMatrix {
    return this.id
  }
  /**
   * @param newID Set new IDMatrix ID for this Aircraft
   */
  setIDMatrix(newID: IDMatrix): void {
    this.id = newID
  }

  /*************************************************************************
   * Fillins
   *************************************************************************/
  /**
   * @returns Current Aircraft type
   */
  getType(): ACType {
    return this.type
  }

  /*************************************************************************
   * Drawing and animation
   *************************************************************************/
  /**
   * Draw the Aircraft, with it's associated data trail and symbology
   * @param context  Current drawing style
   * @param dataStyle The SensorType of the DataTrail
   */
  draw(ctx: CanvasRenderingContext2D, dataStyle: SensorType): void {
    const dataTrail = this.dataTrail.get(dataStyle)
    if (dataTrail) {
      dataTrail.draw(ctx, this.getHeading(), this.getIDMatrix())
    }
  }

  /**
   * Move the arrow once based on the current heading / vector.
   */
  move(): void {
    if (!this.capping) {
      // don't move if capping at final destination
      // calculate & apply offsets based on start/end position
      const rads: number = headingToRadians(this.getHeading()).radians
      const offsetX: number = 7 * Math.cos(rads)
      const offsetY: number = -7 * Math.sin(rads)
      this.startPos.x += offsetX
      this.startPos.y += offsetY

      this.dataTrail.forEach((value: DataTrail) => {
        value.move(this.getHeading())
      })

      // apply a turn as required
      this.turnToTarget()
    }
  }

  /**
   * Make a logical turn towards the Aircraft's target by applying an offset
   * to the current heading.
   */
  turnToTarget(): void {
    // if Aircraft wants to go somewhere
    // determine the bearing to the next route point
    const tgtPos = this.intent.getNextRoutingPoint()
    if (tgtPos) {
      this.intent.setDesiredHeading(
        this.getCenterOfMass().getBR(tgtPos).bearingNum
      )
    }

    // how "far away" from current heading is the desired?
    const turnDegrees = getDegDeltaBetween(
      this.getHeading(),
      this.intent.getDesiredHeading(),
      this.intent.getForcedTurn()
    )

    // apply 'logical' turn by only turning so far towards the target
    // each frame
    let divisor = 7
    const absDelt = Math.abs(turnDegrees)
    if (absDelt >= 90) {
      divisor = 15
    } else if (absDelt < 7) {
      divisor = 1
    }

    this.setHeading(Math.floor(this.getHeading() + turnDegrees / divisor))
  }

  /**
   * If not at desired altitude, increment to climb/descend towards intended altitude.
   */
  doNextAltChange(): void {
    const atDesiredAlt = this.intent.getDesiredAltitude() === this.getAltitude()
    const CHANGE_PER_FRAME = 0.5
    if (!atDesiredAlt) {
      if (this.intent.getDesiredAltitude() > this.getAltitude()) {
        this.altitude += CHANGE_PER_FRAME // climb
      } else {
        this.altitude -= CHANGE_PER_FRAME // descend
      }
    }
  }

  /*************************************************************************
   * Routing & Intent
   *************************************************************************/
  /**
   *
   * @param newIntent Update this aircraft's intent based on Params
   */
  updateIntent(newIntent: Partial<IntentParams>): void {
    this.intent.updateIntent(newIntent)
  }

  /**
   * @returns true iff there are no desired locations left in the intended route
   */
  atFinalDestination(): boolean {
    return this.intent.atFinalDestination()
  }

  /**
   * @returns Point, if there's a next routing point, or
   * undefined if no intended destination set
   */
  getNextRoutingPoint(): Point | undefined {
    return this.intent.getNextRoutingPoint()
  }

  /**
   * @param pt A new point to be added to the Aircraft's route. It is added to the end
   * of the list.
   */
  addRoutingPoint(pt: Point): void {
    this.intent.addRoutingPoint(pt)
  }

  /**
   * Check current against intended, modify heading and intent as necessary.
   */
  doNextRouting(): void {
    if (!this.intent.atFinalDestination()) {
      // Aircraft still has a route but we've reached our next destination
      // so pop the first point out of the intended route
      if (this.intent.atNextRoutingPoint(this.getStartPos())) {
        this.intent.removeRoutingPoint()
      }
      // If Aircraft still has a point left in routing, update desired heading
      // and turn towards it
      const nextPt = this.intent.getNextRoutingPoint()
      if (nextPt)
        this.updateIntent({
          desiredHeading: this.getCenterOfMass().getBR(nextPt).bearingNum,
        })
      this.turnToTarget()
    } else {
      // Aircraft has reached final destination, so if intent matches it is capping
      this.capping = this.intent.atFinalDestination()
    }
  }

  clearRouting(): void {
    this.intent.clearRouting()
  }

  /*************************************************************************
   * Taskings
   *************************************************************************/
  /**
   * @returns true iff Aircraft has a tasking assigned.
   */
  isTasked(): boolean {
    return this.tasking !== undefined
  }

  /**
   * Clears the current tasking.
   */
  clearTasking(): void {
    this.tasking = undefined
  }

  /**
   * @param task Set a new Tasking for this Aircraft.
   */
  setTasking(task: Tasking): void {
    this.tasking = task
  }

  /**
   * @returns The current Tasking, or undefined if Aircraft has none.
   */
  getTasking(): Tasking | undefined {
    return this.tasking
  }
}
