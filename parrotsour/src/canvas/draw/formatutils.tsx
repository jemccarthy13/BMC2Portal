/**
 * This file contains utilities for group and answer formatting
 */

import { Braaseye } from "../../classes/braaseye"
import { AircraftGroup } from "../../classes/groups/group"
import { AltStack } from "../../classes/altstack"
import { toRadians } from "../../utils/psmath"
import { ArrowDataTrail } from "../../classes/aircraft/datatrail/arrowdatatrail"

type RangeBack = {
  label: string
  range: number
}

/**
 * Convert an altitude to a 3-digit flight level
 * @param alt int altitude to change to padded string
 */
export function formatAlt(alt: number): string {
  return (alt * 10).toString().substring(0, 3).padStart(3, "0")
}

/**
 * Return the string formatted answer for this group based on properties of the group
 * @param label The Group Label
 * @param braaseye BRAA from blue and bullseye
 * @param altitudes Altitudes for each contact in the group
 * @param numContacts Number of contacts in the group
 * @param anchor true iff group is anchoring priority
 * @param trackDir track direction of the group
 * @param rangeBack separation, if included
 */
export function formatGroup(
  label: string,
  braaseye: Braaseye,
  altitudes: AltStack,
  numContacts: number,
  anchor: boolean,
  trackDir: string | undefined,
  rangeBack?: RangeBack
): string {
  // format label
  let answer = label + " GROUP "

  // format separation
  if (rangeBack !== null && rangeBack !== undefined) {
    answer += rangeBack.label + " " + rangeBack.range + " "
  }

  // format bullseye if anchor priority
  if (anchor || false) {
    answer +=
      " BULLSEYE " + braaseye.bull.bearing + "/" + braaseye.bull.range + ", "
  }

  // format altitude stack
  answer += altitudes.stack

  // format track direction (if given)
  answer +=
    trackDir !== undefined
      ? (trackDir === "CAP" ? " " : " TRACK ") + trackDir
      : ""

  // apply ID
  answer += " HOSTILE "

  // apply fill-in for # contacts
  if (numContacts > 1) {
    answer += (numContacts >= 3 ? "HEAVY " : "") + numContacts + " CONTACTS"
  }

  // apply fill-ins (HI/FAST/etc)
  answer += " " + altitudes.fillIns
  return answer
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
