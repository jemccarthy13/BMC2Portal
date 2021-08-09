// Classes, interfaces, types
import {
  BlueInThe,
  PictureAnswer,
  PictureCanvasProps,
  PictureCanvasState,
  PictureDrawFunction,
} from "../../../canvas/canvastypes"
import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { AltStack } from "../../../classes/altstack"
import { Point } from "../../../classes/point"

// Functions
import {
  PIXELS_TO_NM,
  randomHeading,
  randomNumber,
} from "../../../utils/psmath"
import {
  isAnchorNorth,
  picTrackDir,
} from "../../../canvas/draw/intercept/picturehelpers"
import { drawAltitudes, drawMeasurement } from "../../../canvas/draw/drawutils"
import {
  formatGroup,
  getOpenCloseAzimuth,
} from "../../../canvas/draw/formatutils"
import { getStartPos } from "../../../canvas/draw/intercept/pictureclamp"
import { FORMAT } from "../../../classes/supportedformats"
import { checkCaps } from "./cap"

/**
 * Get the number of groups in the wall, limited as required
 * by the number of desired contacts in the picture.
 * @param nContacts number of contacts in picture
 * @returns number of groups for the wall
 */
function getNumGroups(nContacts: number): number {
  const numGroups = randomNumber(3, nContacts >= 5 ? 5 : nContacts)
  console.log("WALL with " + numGroups + " groups")
  return numGroups
}

/**
 * Get the separation and total width of the wall
 * @param nGroups number of groups in the wall
 * @returns {width: total width, seps: array of separations between grps}
 */
function getSeparations(nGroups: number): { width: number; seps: number[] } {
  const seps = [0]
  let width = 0
  for (let x = 1; x < nGroups; x++) {
    const nextSep = randomNumber(7 * PIXELS_TO_NM, 15 * PIXELS_TO_NM)
    seps.push(nextSep)
    width += nextSep
  }
  return {
    width,
    seps,
  }
}

/**
 * Draw a 3-5 group wall and return the correctly formatted answer.
 *
 * @param ctx Current drawing context
 * @param props Current PictureCanvasProps
 * @param state Current PictureCanvasState
 * @param start (Optional) forced start position
 * @returns DrawAnswer
 */
export const drawWall: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  hasCaps: boolean,
  desiredNumContacts: number,
  start?: Point | undefined
): PictureAnswer => {
  const isNS = props.orientation.orient === BlueInThe.NORTH

  const numGroups = getNumGroups(desiredNumContacts)

  // calculate group separations ahead of time for clamping
  const { width, seps } = getSeparations(numGroups)

  const startPos = getStartPos(
    ctx,
    state.blueAir,
    props.orientation.orient,
    props.dataStyle,
    {
      start,
      wide: width + 5 * PIXELS_TO_NM,
      deep: 20 * PIXELS_TO_NM, // to ensure measurements can be drawn behind wall
    }
  )
  const startX = startPos.x
  const startY = startPos.y

  let heading = randomHeading(props.format, state.blueAir.getHeading())

  let totalArrowOffset = 0

  const braaseyes: Braaseye[] = []
  const altStacks: AltStack[] = []
  const groups: AircraftGroup[] = []
  for (let x = 0; x < numGroups; x++) {
    const offsetHeading = randomNumber(-10, 10)
    totalArrowOffset += seps[x]

    let altOffsetX = 30
    let altOffsetY = 0

    if (props.isHardMode)
      heading = randomHeading(props.format, state.blueAir.getHeading())

    if (isNS) {
      const grp = new AircraftGroup({
        ctx,
        sx: startX + totalArrowOffset,
        sy: startY,
        hdg: heading + offsetHeading,
        nContacts: desiredNumContacts
          ? randomNumber(1, desiredNumContacts - (desiredNumContacts - x))
          : 0,
      })
      groups.push(grp)
      altOffsetX = -15 * (numGroups - x)
      altOffsetY = 40 + 11 * (numGroups - (numGroups - x))
    } else {
      const grp = new AircraftGroup({
        ctx,
        sx: startX,
        sy: startY + totalArrowOffset,
        hdg: heading + offsetHeading,
        nContacts: desiredNumContacts
          ? randomNumber(1, desiredNumContacts - (desiredNumContacts - x))
          : 0,
      })
      groups.push(grp)
    }

    const grp = groups[x]
    const grpPos = grp.getCenterOfMass(props.dataStyle)
    drawAltitudes(ctx, grpPos, grp.getAltitudes(), altOffsetX, altOffsetY)

    const grpBraaseye = new Braaseye(
      grpPos,
      state.blueAir.getCenterOfMass(props.dataStyle),
      state.bullseye
    )
    grpBraaseye.draw(
      ctx,
      props.showMeasurements,
      props.braaFirst,
      altOffsetX,
      altOffsetY
    )
    grp.setBraaseye(grpBraaseye)
    braaseyes.push(grpBraaseye)
    altStacks.push(grp.getAltStack(props.format))
  }

  checkCaps(hasCaps, groups)

  groups.forEach((grp) => grp.draw(ctx, props.dataStyle))

  let widthNM = 0
  let nLbl = "WEST"
  let sLbl = "EAST"

  const prevGpPos = groups[groups.length - 1].getCenterOfMass(props.dataStyle)
  const gpPos = groups[0].getCenterOfMass(props.dataStyle)

  if (isNS) {
    widthNM = Math.floor((prevGpPos.x - gpPos.x) / PIXELS_TO_NM)
    drawMeasurement(
      ctx,
      gpPos.x,
      gpPos.y - 25,
      prevGpPos.x,
      gpPos.y - 25,
      widthNM,
      props.showMeasurements
    )
  } else {
    widthNM = Math.floor((prevGpPos.y - gpPos.y) / PIXELS_TO_NM)
    drawMeasurement(
      ctx,
      gpPos.x + 25,
      gpPos.y,
      gpPos.x + 25,
      prevGpPos.y,
      widthNM,
      props.showMeasurements
    )
    nLbl = "NORTH"
    sLbl = "SOUTH"
  }

  switch (numGroups) {
    case 3:
      groups[0].setLabel(nLbl)
      groups[1].setLabel("MIDDLE")
      groups[2].setLabel(sLbl)
      break
    case 4:
      groups[0].setLabel(nLbl)
      groups[1].setLabel(nLbl + " MIDDLE")
      groups[2].setLabel(sLbl + " MIDDLE")
      groups[3].setLabel(sLbl)
      break
    case 5:
      groups[0].setLabel(nLbl)
      groups[1].setLabel(nLbl + " MIDDLE")
      groups[2].setLabel("MIDDLE")
      groups[3].setLabel(sLbl + " MIDDLE")
      groups[4].setLabel(sLbl)
      break
  }

  const openClose = getOpenCloseAzimuth(groups[0], groups[groups.length - 1])
  let answer =
    numGroups + " GROUP WALL " + widthNM + " WIDE " + openClose + ", "

  answer += picTrackDir(props.format, groups)

  const anchorNorth = isAnchorNorth(
    braaseyes[0],
    braaseyes[braaseyes.length - 1],
    groups[0],
    groups[groups.length - 1]
  )

  // TODO -- WEIGHTED WALL
  // since we have all the seps[], we could check if any are within weighted criteria

  const includeBull = widthNM > 10 && props.format !== FORMAT.IPE

  for (let g = 0; g < numGroups; g++) {
    const idx: number = anchorNorth ? g : numGroups - 1 - g
    const group = groups[idx]
    answer +=
      formatGroup(
        props.format,
        group,
        g === 0 || (g === numGroups - 1 && includeBull) || false
      ) + " "
  }

  return {
    pic: answer,
    groups: groups,
  }
}
