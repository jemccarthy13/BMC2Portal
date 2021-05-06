// Interfaces
import {
  PictureAnswer,
  PictureDrawFunction,
  PictureCanvasProps,
  PictureCanvasState,
} from "../../../canvas/canvastypes"
import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { BRAA } from "../../../classes/braa"
import { AltStack } from "../../../classes/altstack"

// Functions
import { getAspect, trackDirFromHdg } from "../../../utils/mathutilities"
import { drawText } from "../drawutils"
import { randomNumber } from "../../../utils/psmath"

/**
 * Contains required info for resposne to EA
 */
interface EAInfo {
  closestGrp: AircraftGroup
  braa: BRAA
  query: string
  strBR: BRAA
  grp: AircraftGroup
  aspectH?: string
  altStack?: AltStack
}

/**
 * Return a formatted BRAA response
 *
 * @param info: EA response info
 */
function formatBRAA(info: EAInfo): string {
  let response: string =
    info.closestGrp.getLabel() +
    " BRAA " +
    info.braa.bearing +
    "/" +
    info.braa.range +
    " "
  response +=
    info.altStack?.stack +
    ", " +
    info.aspectH +
    " " +
    (info.aspectH !== "HOT"
      ? trackDirFromHdg(info.closestGrp.getHeading())
      : "") +
    " HOSTILE "
  if (info.closestGrp.getStrength() > 1) {
    response +=
      (info.closestGrp.getStrength() >= 3 ? "HEAVY " : "") +
      info.closestGrp.getStrength() +
      " CONTACTS "
  }
  response += info?.altStack?.fillIns
  return response
}

/**
* Return a formatted Strobe response

* @param info EA response info
*/
function formatStrobe(info: EAInfo): string {
  return (
    "EAGLE01 STROBE RANGE " +
    info.strBR.range +
    ", " +
    info.altStack?.stack +
    (info.aspectH !== "HOT"
      ? info.aspectH + " " + trackDirFromHdg(info.grp.getHeading())
      : info.aspectH) +
    ", HOSTILE, " +
    info.grp.getLabel()
  )
}

/**
* Return a formatted MUSIC response

* @param grp Group for music call
* @param bull Bullseye of the picture
* @param altStack Altitude stack information for red group
* @param format Format of the picture
*/
function formatMusic(
  grp: AircraftGroup,
  bull: BRAA,
  altStack: AltStack,
  format: string
): string {
  let answer = grp.getLabel() + " BULLSEYE " + bull.bearing + "/" + bull.range
  answer += ", " + altStack.stack
  if (format === "alsa") {
    let trkDir = grp.getTrackDir() ? grp.getTrackDir() : grp.getPicDir()
    trkDir = trkDir || ""
    answer += grp.isCapping() ? " CAP " : ", TRACK " + trkDir
  }
  answer += ", HOSTILE, "

  // apply fill-in for # contacts
  const numContacts = grp.getStrength()
  if (numContacts > 1) {
    answer += (numContacts >= 3 ? "HEAVY " : "") + numContacts + " CONTACTS"
  }

  // apply fill-ins (HI/FAST/etc)
  answer += " " + altStack.fillIns

  answer += " LINE ABREAST 3 "

  return answer
}

/**
 * Process groups from picture to determine:
 * which group is closest? and whats the B/R?
 * which group are we querying for EA from?
 * which (random) group will we use if we don't use closest?
 *
 * @param groups current red air picture groups
 * @param blueAir current blue air group
 * @returns Object containing closest group, closest braa, query
 * text, strobe range, and group matching the query
 */
function getEAInfo(groups: AircraftGroup[], blueAir: AircraftGroup): EAInfo {
  // find the closest group
  let closestGrp: AircraftGroup = groups[0]
  let closestRng = 9999
  let braa = new BRAA(0, 0)
  for (let x = 0; x < groups.length; x++) {
    const tmpBraa = blueAir.getCenterOfMass().getBR(groups[x].getCenterOfMass())
    if (braa.range < closestRng) {
      braa = tmpBraa
      closestRng = braa.range
      closestGrp = groups[x]
    }
  }

  // pick a random group if not using closest (i.e. not a BRAA request)
  const grp: AircraftGroup = groups[randomNumber(0, groups.length)]
  const strBR = blueAir.getCenterOfMass().getBR(grp.getCenterOfMass())

  const info = {
    braa,
    closestGrp,
    strBR,
    grp,
    query: strBR.bearing,
  }

  /*
   * TODO -- instead of a predetermined answer here,
   * use a strobe bearing out of a range of 'logical'
   * bearings then search for closest group to the bearing
   * within the margin of tolerance
   */
  if (randomNumber(1, 100) <= 50) {
    info.query = grp.getLabel()
  }

  return info
}

/**
 * Draw a picture and request an EA response.
 *
 * @param ctx The current drawing context
 * @param props PicCanvasProps of the current Canvas
 * @param state PicCanvasState of the current Canvas
 * @param start (Optional) forced start location for the picture
 * @returns DrawAnswer containing the correct answer for this picture
 */
export const drawEA: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  start?: Point
): PictureAnswer => {
  // force draw to happen on the right side of the screen
  if (start === undefined) {
    start = new Point(
      randomNumber(ctx.canvas.width * 0.6, ctx.canvas.width * 0.65),
      randomNumber(ctx.canvas.width * 0.2, ctx.canvas.height * 0.8)
    )
  } else if (start.x === undefined) {
    start.x = randomNumber(ctx.canvas.width * 0.6, ctx.canvas.width * 0.65)
  }

  /**
   * TODO -- using Partial<GroupParams>, set the start point and a logical heading
   * for groups to perform EA (i.e. no cold pictures)
   */
  const answer = state.reDraw(ctx, true, start)

  // get info needed for EA response
  const eaInfo = getEAInfo(answer.groups, state.blueAir)
  eaInfo.altStack = eaInfo.closestGrp.getAltStack(props.format)

  const finalAnswer = {
    pic: "RESPONSE",
    groups: answer.groups,
  }

  // do formatting of the response based on type of EA
  let request = '"EAGLE01 MUSIC ' + eaInfo.grp.getLabel() + '"'
  switch (randomNumber(0, 2)) {
    case 0:
      request = '"EAGLE01, BOGEY DOPE NEAREST GRP"'
      eaInfo.altStack = eaInfo.closestGrp.getAltStack(props.format)
      eaInfo.aspectH = getAspect(state.blueAir, eaInfo.closestGrp)
      finalAnswer.pic = formatBRAA(eaInfo)
      break
    case 1:
      request = '"EAGLE01 STROBE ' + eaInfo.query + '"'
      eaInfo.altStack = eaInfo.grp.getAltStack(props.format)
      eaInfo.aspectH = getAspect(state.blueAir, eaInfo.grp)
      finalAnswer.pic = formatStrobe(eaInfo)
      break
    default:
      finalAnswer.pic = formatMusic(
        eaInfo.grp,
        state.bullseye.getBR(eaInfo.grp.getCenterOfMass()),
        eaInfo.altStack,
        props.format
      )
      break
  }

  drawText(ctx, request, ctx.canvas.width / 2, 20)

  return finalAnswer
}
