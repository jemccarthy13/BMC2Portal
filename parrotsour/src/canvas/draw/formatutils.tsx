/**
 * This file contains utilities for group and answer formatting
 */

import { Braaseye } from "../../classes/braaseye"
import { AircraftGroup } from "../../classes/groups/group"
import { AltStack } from "../../classes/altstack"
import { SensorType } from "../../classes/aircraft/datatrail/sensortype"

type RangeBack = {
  label: string
  range: number
}

/**
 * Convert an altitude to a 3-digit flight level
 * @param alt int altitude to change to padded string
 */
export function formatAlt(alt: number): string {
  const altF = (alt * 10).toString().substring(0, 3)
  return altF.length < 3 ? "0" + altF : altF
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
export function getGroupOpenClose(
  fg: AircraftGroup,
  sg: AircraftGroup,
  dataStyle: SensorType
): string {
  const fgPos = fg.getCenterOfMass(dataStyle)
  const sgPos = sg.getCenterOfMass(dataStyle)
  const fgStartPos = fg.getStartPos()
  const sgStartPos = sg.getStartPos()

  // if the head of the arrow is closer, it's pointing towards the other fighter
  const b1 = sgPos.getBR(fgPos).range
  const b2 = sgPos.getBR(fgStartPos).range
  const mina = Math.min(b1, b2)

  const b3 = sgStartPos.getBR(fgPos).range
  const b4 = sgStartPos.getBR(fgStartPos).range
  const minb = Math.min(b3, b4)

  const b5 = fgPos.getBR(sgPos).range
  const b6 = fgPos.getBR(sgStartPos).range
  const minc = Math.min(b5, b6)

  const b7 = fgStartPos.getBR(sgPos).range
  const b8 = fgStartPos.getBR(sgStartPos).range
  const mind = Math.min(b7, b8)

  if (mina + 2 < minb && minc + 2 < mind) {
    return "CLOSING"
  }
  if (mina - 2 > minb && minc - 2 > mind) {
    return "OPENING"
  }

  return ""
}
