import snackActions from "../../../pscomponents/alert/psalert"
import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { randomNumber } from "../../../utils/psmath"
import {
  PictureAnswer,
  PictureCanvasProps,
  PictureCanvasState,
} from "../../canvastypes"
import { checkCaps } from "./cap"
import { PictureInfo } from "./pictureclamp"

export abstract class DrawPic {
  abstract create(): DrawPic

  abstract chooseNumGroups(nCts: number): number

  abstract getPictureInfo(start?: Point): PictureInfo

  abstract createGroups: (
    startPos: Point,
    contactList: number[]
  ) => AircraftGroup[]

  abstract drawInfo(): void

  abstract getAnswer(): string

  numGroups = 0
  groups: AircraftGroup[] = []
  answer = ""
  ctx!: CanvasRenderingContext2D
  props!: PictureCanvasProps
  state!: PictureCanvasState
  pInfo!: PictureInfo
  deep = 0
  wide = 0

  getNumGroups(): number {
    return this.numGroups
  }

  initialize = (
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState
  ): void => {
    this.ctx = ctx
    this.props = props
    this.state = state
  }

  draw = (
    ctx: CanvasRenderingContext2D,
    hasCaps: boolean,
    desiredNumContacts: number,
    start?: Point
  ): PictureAnswer => {
    this.chooseNumGroups(desiredNumContacts)

    const contactList = this.assignContacts(this.numGroups, desiredNumContacts)

    this.ctx = ctx

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
      grp.draw(ctx, this.props.dataStyle)
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
}
