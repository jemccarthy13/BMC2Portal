/**
 * This file contains utilities for group and answer formatting
 */
import { AircraftGroup } from "../../classes/groups/group"
import { toRadians } from "../../utils/psmath"
import { ArrowDataTrail } from "../../classes/aircraft/datatrail/arrowdatatrail"

/**
 * Convert an altitude to a 3-digit flight level
 * @param alt int altitude to change to padded string
 */
export function formatAlt(alt: number): string {
  return (alt * 10).toString().substring(0, 3).padStart(3, "0")
}

/**
 * Check if picture is opening or closing
 * @param fg First group of picture
 * @param sg Second group of picture
 */
export function getOpenCloseAzimuth(
  fg: AircraftGroup,
  sg: AircraftGroup
): string {
  let retVal = ""

  const fgStartPos = fg.getStartPos()
  const sgStartPos = sg.getStartPos()

  const angle1to2 = fgStartPos.getBR(sgStartPos).bearingNum

  const fgHeading = fg.getHeading()
  const sgHeading = sg.getHeading()

  const speed1to2 =
    ArrowDataTrail.LEN_TRAIL * Math.cos(toRadians(angle1to2 - fgHeading))

  const speed2to1 =
    ArrowDataTrail.LEN_TRAIL * Math.cos(toRadians(angle1to2 - sgHeading))

  const acceptableRate = Math.cos(toRadians(5))

  let closing = speed1to2 > 0 && speed2to1 < 0
  let opening = speed1to2 < 0 && speed2to1 > 0

  closing =
    closing ||
    (Math.abs(speed1to2) < acceptableRate && speed2to1 < 0) ||
    (Math.abs(speed2to1) < acceptableRate && speed1to2 > 0)
  opening =
    opening ||
    (Math.abs(speed1to2) < acceptableRate && speed2to1 > 0) ||
    (Math.abs(speed2to1) < acceptableRate && speed1to2 < 0)

  const parallel =
    Math.abs(speed1to2) < acceptableRate && Math.abs(speed2to1) < acceptableRate

  if (!parallel) {
    if (opening) {
      retVal = " OPENING "
    }
    if (closing) {
      retVal = " CLOSING "
    }
  }

  return retVal
}
