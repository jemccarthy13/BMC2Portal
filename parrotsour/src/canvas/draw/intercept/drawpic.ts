import snackActions from "../../../pscomponents/alert/psalert"
import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { randomNumber } from "../../../utils/psmath"
import {
  FightAxis,
  PictureAnswer,
  PictureCanvasProps,
  PictureCanvasState,
} from "../../canvastypes"
import { checkCaps } from "./cap"
import { PictureInfo } from "./pictureclamp"
import { Aspect, toCardinal } from "../../../utils/aspect"
import { FORMAT } from "../../../classes/supportedformats"

export abstract class DrawPic {
  abstract create(): DrawPic
  abstract chooseNumGroups(nCts: number): void
  abstract getPictureInfo(start?: Point): PictureInfo
  abstract createGroups: (
    startPos: Point,
    contactList: number[]
  ) => AircraftGroup[]
  abstract drawInfo(): void
  abstract getAnswer(): string
  abstract applyLabels(): void
  abstract formatWeighted(): string
  abstract formatPicTitle(): string
  abstract formatDimensions(): string

  public numGroupsToCreate = 0
  groups: AircraftGroup[] = []
  answer = ""
  props!: PictureCanvasProps
  state!: PictureCanvasState
  pInfo!: PictureInfo
  deep = 0
  wide = 0

  getNumGroups(): number {
    return this.groups.length
  }

  initialize = (props: PictureCanvasProps, state: PictureCanvasState): void => {
    this.props = props
    this.state = state
  }

  draw = (
    hasCaps: boolean,
    desiredNumContacts: number,
    start?: Point
  ): PictureAnswer => {
    this.chooseNumGroups(desiredNumContacts)

    const contactList = this.assignContacts(
      this.numGroupsToCreate,
      desiredNumContacts
    )

    this.pInfo = this.getPictureInfo(start)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.deep = this.pInfo.deep!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.wide = this.pInfo.wide!

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const startPos = this.pInfo.start!

    this.groups = this.createGroups(startPos, contactList)

    checkCaps(hasCaps, this.groups)

    this.groups.forEach((grp) => {
      grp.draw(this.props.dataStyle)
    })

    this.drawInfo()

    return {
      pic: this.getAnswer(),
      groups: this.groups,
    }
  }

  assignContacts = (grps: number, contacts: number): number[] => {
    let cntSoFar = 0
    const answer = []
    if (grps > contacts && contacts !== 0) {
      snackActions.warning(
        contacts +
          " contact(s) is not enough for " +
          grps +
          " group(s). Picture will be random."
      )
    }
    for (let x = 0; x < grps; x++) {
      // 0 for random contacts per group
      let nCts = 0
      // if not random
      if (contacts !== 0) {
        // if it's the last group, use remaining # contacts
        if (x === grps - 1) {
          nCts = contacts - cntSoFar
        } else {
          // otherwise, randomly assign some # of remaining contacts to the group
          nCts = randomNumber(1, contacts - cntSoFar - (grps - 1 - x))
        }
      }
      answer.push(nCts)
      cntSoFar += nCts
    }
    return answer
  }

  /**
   * Determine if two groups are echelon
   *
   * @param {AircraftGroup} priGroup The anchored group (highest Pri)
   * @param {AircraftGroup} nonPriGroup The non-priority group
   */
  isEchelon = (priGroup: AircraftGroup, nonPriGroup: AircraftGroup): string => {
    const nPos = priGroup.getCenterOfMass(this.props.dataStyle)
    const sPos = nonPriGroup.getCenterOfMass(this.props.dataStyle)

    const ngBraaseye = priGroup.getBraaseye()
    const sgBraaseye = nonPriGroup.getBraaseye()

    const isNS = FightAxis.isNS(this.props.orientation.orient)
    const isEchX = !isNS && nPos.getBR(new Point(sPos.x, nPos.y)).range > 5
    const isEchY = isNS && nPos.getBR(new Point(nPos.x, sPos.y)).range > 5
    let ech = ""
    if (isEchX || isEchY) {
      if (ngBraaseye.braa.range < sgBraaseye.braa.range) {
        ech = " ECHELON " + toCardinal(nPos.getBR(sPos).bearingNum) + ", "
      } else {
        ech = " ECHELON " + toCardinal(nPos.getBR(nPos).bearingNum) + ", "
      }
    }
    return ech
  }

  /**
   * If all groups are tracking the same direction, get the picture track direction
   * and set it for all groups (formatting).
   *
   * Side effect- set the picDir member variable in each group.
   *
   * @returns {string} Track direction of the picture | "" if track dirs are different
   */
  picTrackDir = (): string => {
    let answer = "" // set default return

    const { blueAir } = this.state
    const { dataStyle, format } = this.props

    // determine if all groups track same direction
    const trackDir: string | undefined = this.groups[0].getTrackDir()
    const sameTrackDir: boolean = this.groups.every((group) => {
      return trackDir === group.getTrackDir()
    })

    // Picture track direction is included in answer iff
    // all groups track same direction and the Aspect isn't HOT
    const asp = blueAir.getAspect(this.groups[0], dataStyle)
    if (format !== FORMAT.IPE) {
      if (sameTrackDir && asp !== Aspect.HOT) {
        answer = trackDir + ". "
      }
    }

    // ** Side effect **
    // Set whether to use track direction in group formatting
    this.groups.forEach((group) => {
      if (sameTrackDir) {
        group.setUseTrackDir(false)
      }
    })
    return answer
  }

  /**
   * Check for anchoring priorities between two groups and set the flag for
   * the priority group.
   *
   * @param {AircraftGroup} group1 One of the groups
   * @param {AircraftGroup} group2 The other group
   */
  checkAnchor = (group1: AircraftGroup, group2: AircraftGroup): void => {
    let anchorN = false
    const ngBraaseye = group1.getBraaseye()
    const sgBraaseye = group2.getBraaseye()
    if (ngBraaseye.braa.range < sgBraaseye.braa.range) {
      anchorN = true
    } else if (ngBraaseye.braa.range === sgBraaseye.braa.range) {
      const altN: number = group1.getAltitude()
      const altS: number = group2.getAltitude()

      if (altN > altS) {
        anchorN = true
      } else if (altN === altS) {
        if (group1.getStrength() >= group2.getStrength()) {
          anchorN = true
        }
      }
    }
    group1.setAnchor(anchorN)
    group2.setAnchor(!anchorN)
  }

  isAnchorOutriggers(): boolean {
    return this.wide >= 10 && this.props.format !== FORMAT.IPE
  }
}
