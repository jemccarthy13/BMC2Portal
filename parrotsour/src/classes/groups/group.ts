// Classes & Interfaces
import { SensorType } from "../groups/datatrail"
import { Point } from "../point"
import { ACType, Aircraft } from "../groups/aircraft"
import { IDMatrix } from "../groups/id"
import { IntentParams } from "../groups/intent"
import Tasking from "../taskings/tasking"
import { FORMAT } from "../supportedformats"

import { AltStack, getAltStack } from "../altstack"
// Functions
import { trackDirFromHdg } from "../../utils/mathutilities"
import {
  headingToRadians,
  PIXELS_TO_NM,
  randomNumber,
} from "../../utils/psmath"

/**
 * The types of data that can be used to seed a group.
 *
 * Everything not provided is randomized or defaulted.
 */
export interface GroupParams {
  ctx: CanvasRenderingContext2D
  dataTrailType: SensorType
  sx?: number
  sy?: number
  nContacts?: number
  hdg?: number
  alts?: number[]
  desiredHdg?: number
  id?: IDMatrix
  type?: ACType
}

/**
 * An AircraftGroup is an array of 1+ Aircraft.
 *
 * It contains logic to move, give intent to, and draw Aircraft.
 *
 * TODO -- GROUP SPLIT/MERGE -- Currently maneuvers are handled as an all
 * or nothing. In the animator, consider additional logic for (man > 0), to update
 * "groups" var to split groups. Should be 'easy'
 */
export class AircraftGroup extends Array<Aircraft> {
  private startPos: Point = Point.DEFAULT
  private label = "GROUP"
  private picDir: string | undefined

  private maneuvers = 0

  /**
   * Construct an AircraftGroup from the given parameters.Group will initialize
   * what it can, randomize what it can, and default the rest.
   *
   * @param p A Partial object of GroupParams.
   */
  constructor(p?: Partial<GroupParams>) {
    super()
    if (!p) p = {}
    this.startPos.x = p.sx || randomNumber(1, 100)
    this.startPos.y = p.sy || randomNumber(1, 100)

    // Seed params to pass into Aircraft
    p.sx = this.startPos.x
    p.sy = this.startPos.y
    p.hdg = p.hdg || 90

    // Create nContacts number of Aircraft and add to this collection
    // TODO -- CUSTOMIZE -- user selected max # contacts per group?
    const nContacts = p.nContacts || randomNumber(1, 4)
    for (let contact = 0; contact < nContacts; contact++) {
      if (p.alts && p.alts[contact])
        this.push(new Aircraft({ ...p, alt: p.alts[contact] }))
      else {
        this.push(new Aircraft(p))
      }

      // Compute start position offset for follow-on groups (calculated from
      // 90 deg perpendicular)
      const vectors = headingToRadians(p.hdg)
      p.sx += PIXELS_TO_NM * Math.cos(vectors.offset)
      p.sy += PIXELS_TO_NM * -Math.sin(vectors.offset)
    }

    // TODO -- MANEUVER -- % chance of 2 maneuvers (i.e. flank turn back hot)
    if (randomNumber(0, 100) < 20) {
      this.maneuvers = 1
    }
  }

  /*************************************************************************
   * Attribute accessors
   *************************************************************************/
  /**
   * @returns Start position for where this group's draw will start; will be approximately
   * the tail end of the data trail.
   */
  getStartPos(): Point {
    return this.startPos
  }

  /**
   * "Center of Mass" for an aircraft/group is one projected data plot ahead of the
   * data trail, averaged. For Aircraft, this is equiv. to one projected data plot ahead
   * of the Aircraft, on it's current heading.
   *
   * @returns The "center of mass" for this group, which is the average of each
   * Aircraft's center of mass.
   */
  getCenterOfMass(): Point {
    let x = 0
    let y = 0
    for (let idx = 0; idx < this.getStrength(); idx++) {
      const acPos = this[idx].getCenterOfMass()
      x += acPos.x
      y += acPos.y
    }
    return new Point(x / this.getStrength(), y / this.getStrength())
  }

  /**
   * @returns true iff one Aircraft in this group is capping
   */
  isCapping(): boolean {
    return (
      this.find((ac) => {
        return !ac.isCapping()
      }) === undefined
    )
  }

  /**
   * @returns Number of contacts in this group
   */
  getStrength(): number {
    return this.length
  }

  /**
   * Update maneuver count
   * @param newNumManeuvers New number of maneuvers remaining
   */
  setManeuvers(newNumManeuvers: number): void {
    this.maneuvers = newNumManeuvers
  }

  /**
   * @returns true iff group has at least one maneuver left.
   */
  doesManeuvers(): boolean {
    return this.maneuvers > 0
  }

  /**
   * @returns Current group label
   */
  getLabel(): string {
    return this.label
  }

  /**
   * @param newLbl New group label
   */
  setLabel(newLbl: string): void {
    this.label = newLbl
  }

  /**
   * @returns The Type of Aircraft in this group. Currently only supports one type
   * for the entire group (first aircraft)
   */
  getType(): ACType {
    return this[0].getType()
  }

  /*************************************************************************
   * Altitude(s)
   *************************************************************************/
  /**
   * @returns Altitude of the highest Aircraft in this group
   */
  getAltitude(): number {
    return Math.max(...this.getAltitudes())
  }

  /**
   * @param format The desired formatting
   * @returns AltStack containing formatted STACKS/Fillins
   */
  getAltStack(format: FORMAT): AltStack {
    return getAltStack(this.getAltitudes(), format)
  }

  /**
   * @returns number[] containing the altitude of every Aircraft in this Group
   */
  getAltitudes(): number[] {
    const alts = []
    for (let idx = 0; idx < this.length; idx++) {
      alts.push(this[idx].getAltitude())
    }
    return alts
  }

  /*************************************************************************
   * Heading and track direction
   *************************************************************************/
  /**
   * @returns Current heading of the Group. Currently assumes all Aicraft are
   * following the same heading, therefore only returns first Aircraft's heading.
   */
  getHeading(): number {
    return this[0].getHeading()
  }

  /**
   * @returns Cardinal track direction or undefined. If there is a picture
   * track direction specified (i.e. all groups track West) this function
   * returns undefined. Otherwise, cardinal direction from heading.
   */
  getTrackDir(): string | undefined {
    if (this.isCapping()) {
      return "CAP"
    } else if (this.picDir) {
      return undefined
    }
    return trackDirFromHdg(this.getHeading())
  }

  /**
   * @returns Picture direction if set (i.e. all groups track West)
   */
  getPicDir(): string | undefined {
    return this.picDir
  }

  /**
   * Set the picture direction (all groups) for formatting.
   *
   * If all groups track same direction, it's (2 grp az track W) instead of
   * (2 grp az, ng ... track West, sg ... track East)
   * @param newDir New picture track direction
   */
  setPicDir(newDir: string | undefined): void {
    this.picDir = newDir
  }

  /*************************************************************************
   * Routing
   *************************************************************************/
  /**
   * @returns true iff there is an Aircraft with intended destination
   */
  hasRouting(): boolean {
    return this.find((ac) => !ac.atFinalDestination()) !== undefined
  }

  /**
   * @returns The next Point on this group's intended route. Assumes
   * all Aircraft in the Group are following the same route, therefore returns
   * only the first Aircraft's next routing point.
   */
  getNextRoutingPoint(): Point {
    return this[0].getNextRoutingPoint()
  }

  /**
   * @param pt Point to add to all group Aircraft(s) routes
   */
  addRoutingPoint(pt: Point): void {
    this.forEach((ac) => ac.addRoutingPoint(pt))
  }

  /**
   * Perform the next routing action for each aircraft. See Aircraft.doNextRouting()
   */
  doNextRouting(): void {
    this.forEach((ac) => ac.doNextRouting())
  }

  /**
   * Update intent for each Aircraft in the group. See Aircraft.updateIntent()
   * @param newIntent Object representing new intent for each Aircraft.
   */
  updateIntent(newIntent: Partial<IntentParams>): void {
    this.forEach((ac) => ac.updateIntent(newIntent))
  }

  /*************************************************************************
   * Drawing, movement and animation
   *************************************************************************/
  /**
   * Draw each aircraft. See Aircraft.draw(...)
   * @param context Current drawing context
   * @param dataStyle The type of DataTrail to use
   */
  draw(context: CanvasRenderingContext2D, dataStyle: SensorType): void {
    this.forEach((ac) => ac.draw(context, dataStyle))
  }

  /**
   * Move each Aircraft. See Aircraft.move()
   */
  move(): void {
    this.forEach((ac) => ac.move())
  }

  /**
   * Update each Aircraft's altitude based on intent. See Aircraft.doNextAltChange()
   */
  updateAltitude(): void {
    this.forEach((ac) => ac.doNextAltChange())
  }

  /*************************************************************************
   * Tasking
   *************************************************************************/
  /**
   * @param task Aircraft's new Tasking.
   */
  setTasking(task: Tasking): void {
    this.forEach((ac: Aircraft) => {
      ac.setTasking(task)
    })
  }

  /**
   * @returns true if there is at least one Aircraft in this group that has a Tasking.
   */
  isOnTask(): boolean {
    return this.find((ac) => ac.isTasked()) !== undefined
  }
}
