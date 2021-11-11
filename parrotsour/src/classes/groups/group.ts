// Classes & Interfaces
import { SensorType } from "../aircraft/datatrail/sensortype"
import { Point } from "../point"
import { ACType, Aircraft } from "../aircraft/aircraft"
import { getMostRestrictiveID, IDMatrix } from "../aircraft/id"
import { IntentParams } from "../aircraft/intent"
import Tasking from "../taskings/tasking"
import { FORMAT } from "../supportedformats"

import { AltStack, getAltStack } from "../altstack"
// Functions
import {
  headingToRadians,
  PIXELS_TO_NM,
  randomNumber,
} from "../../utils/psmath"
import { drawGroupCap } from "./groupcap"
import { Braaseye } from "../braaseye"
import { Aspect, aspectFromCATA, toCardinal } from "../../utils/aspect"
import { BRAA } from "../braa"
import RangeBack from "./rangeback"

/**
 * The types of data that can be used to seed a group.
 *
 * Everything not provided is randomized or defaulted.
 */
export interface GroupParams {
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
  private braaseye!: Braaseye

  private startPos: Point = Point.DEFAULT
  private label = "GROUP"
  private useTrackDir = true
  private maneuvers = 0
  private anchor = false
  private useBull = false

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

    this.startPos = new Point(p.sx, p.sy)

    // Create nContacts number of Aircraft and add to this collection
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
      p.sx += 2 * PIXELS_TO_NM * Math.cos(vectors.offset)
      p.sy += 2 * PIXELS_TO_NM * -Math.sin(vectors.offset)
    }

    // TODO -- MANEUVER -- % chance of 2 maneuvers (i.e. flank turn back hot)
    if (randomNumber(0, 100) < 20) {
      this.maneuvers = 1
    }
  }

  /*************************************************************************
   * Formatting
   *************************************************************************/
  setAnchor(b: boolean): void {
    this.anchor = b
    this.useBull = b
  }

  isAnchor(): boolean {
    return this.anchor
  }

  setUseBull(b: boolean): void {
    this.useBull = b
  }

  getUseBull(): boolean {
    return this.useBull
  }

  formatNumContacts(): string {
    let answer = ""
    if (this.getStrength() > 1) {
      if (this.getStrength() >= 3) {
        answer += "HEAVY "
      }
      answer += this.getStrength() + " CONTACTS"
    }
    return answer
  }

  /**
   * Return the string formatted answer for this group based on properties of the group
   */
  format(format: FORMAT, rangeBack?: RangeBack): string {
    // format label
    let answer = this.getLabel() + " "

    // format separation
    if (rangeBack) {
      answer += rangeBack.toString() + " "
    }

    // format bullseye if anchor priority
    const braaseye = this.getBraaseye()
    if (this.useBull || false) {
      answer += "BULLSEYE " + braaseye.bull.toString() + ", "
    }

    // format altitude stack
    const altStack = this.getAltStack(format)
    answer += altStack.stack + " "

    // format track direction
    const trackDir = this.getTrackDir()
    answer += " "
    answer += trackDir !== undefined ? trackDir : ""

    // apply ID
    answer += " HOSTILE "

    // apply fill-in for # contacts
    answer += this.formatNumContacts() + " "

    // apply fill-ins (HI/FAST/etc)
    answer += " " + altStack.fillIns
    return answer.replace(/ {2}/g, " ")
  }

  /*************************************************************************
   * Location
   *************************************************************************/
  /**
   * @returns Start position for where this group's draw will start; will be approximately
   * the 'rear' end of the data trail.
   */
  getStartPos(): Point {
    return this[0].getStartPos()
  }

  /**
   * "Center of Mass" for an aircraft/group is one projected data plot ahead of the
   * data trail, averaged. For Aircraft, this is equiv. to one projected data plot ahead
   * of the Aircraft, on it's current heading.
   *
   * @returns The "center of mass" for this group, which is the average of each
   * Aircraft's center of mass.
   */
  getCenterOfMass(dataStyle: SensorType): Point {
    if (this.isCapping()) {
      return this.startPos
    }
    let x = 0
    let y = 0
    for (let idx = 0; idx < this.getStrength(); idx++) {
      const acPos = this[idx].getCenterOfMass(dataStyle)
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
   * Set each aircraft in this group to be capping
   */
  setCapping(newVal: boolean): void {
    this.forEach((ac) => ac.setCapping(newVal))
  }

  setBraaseye(braaseye: Braaseye): void {
    this.braaseye = braaseye
  }

  getBraaseye(): Braaseye {
    return this.braaseye
  }

  /*************************************************************************
   * Heading and track direction/aspect
   *************************************************************************/

  /**
   * Get 'aspect' (HOT/FLANK/BEAM, etc) to another group
   *
   * Aspect is calculated by taking the angle difference between
   * other a/c heading, and the reciprocal bearing between this group
   * and other a/c.
   *
   * @param otherGrp other aircraft
   */
  getAspect(otherGrp: AircraftGroup, dataStyle: SensorType): Aspect {
    const recipBrg: BRAA = otherGrp
      .getCenterOfMass(dataStyle)
      .getBR(this.getCenterOfMass(dataStyle))

    let dist = (otherGrp.getHeading() - parseInt(recipBrg.bearing) + 360) % 360
    if (dist > 180) dist = 360 - dist
    const cata = dist

    return aspectFromCATA(cata)
  }

  /**
   * @returns Current heading of the Group. Currently assumes all Aicraft are
   * following the same heading, therefore only returns first Aircraft's heading.
   */
  getHeading(): number {
    return this[0].getHeading()
  }

  /**
   * @param newHdg New heading to set for all aircraft in this group
   */
  setHeading(newHdg: number): void {
    this.forEach((ac) => ac.setHeading(newHdg))
  }

  /**
   * @returns Cardinal track direction or undefined. If there is a picture
   * track direction specified (i.e. all groups track West) this function
   * returns undefined. Otherwise, cardinal direction from heading.
   */
  getTrackDir(): string | undefined {
    let trackDir = undefined
    if (this.isCapping()) {
      trackDir = "CAP"
    } else if (this.useTrackDir) {
      trackDir = "TRACK " + toCardinal(this.getHeading())
    }
    return trackDir
  }

  /**
   * Set the useTrackDir flag, whether or not to include track direction
   * in group formatting
   */
  setUseTrackDir(newVal: boolean): void {
    this.useTrackDir = newVal
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
   * Speed -- TODO
   *************************************************************************/

  /*************************************************************************
   * ID
   *************************************************************************/
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
   * Update group ID
   * @param newID
   */
  setIDMatrix(newID: IDMatrix): void {
    this.forEach((ac) => {
      ac.setIDMatrix(newID)
    })
  }

  /**
   * @returns The most restrictive ID of child Aircraft
   */
  getIDMatrix(): IDMatrix {
    const ids: IDMatrix[] = []
    this.forEach((ac) => {
      ids.push(ac.getIDMatrix())
    })
    return getMostRestrictiveID(ids)
  }

  /*************************************************************************
   * Fillins
   *************************************************************************/
  /**
   * @returns Number of contacts in this group
   */
  getStrength(): number {
    return this.length
  }

  /**
   * @returns The Type of Aircraft in this group. Currently only supports one type
   * for the entire group (first aircraft)
   */
  getType(): ACType {
    return this[0].getType()
  }

  /*************************************************************************
   * Drawing and animation
   *************************************************************************/
  /**
   * Draw each aircraft. See Aircraft.draw(...)
   * @param context Current drawing context
   * @param dataStyle The type of DataTrail to use
   */
  draw(dataStyle: SensorType): void {
    if (this.isCapping()) {
      drawGroupCap(this)
    } else {
      this.forEach((ac) => ac.draw(dataStyle))
    }
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
   * Routing
   *************************************************************************/
  /**
   * Update intent for each Aircraft in the group. See Aircraft.updateIntent()
   * @param newIntent Object representing new intent for each Aircraft.
   */
  updateIntent(newIntent: Partial<IntentParams>): void {
    this.forEach((ac) => ac.updateIntent(newIntent))
  }

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
  getNextRoutingPoint(): Point | undefined {
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
   * Clears all currently assigned transit locations
   */
  clearRouting(): void {
    this.forEach((ac) => ac.clearRouting())
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
