/**
 * This file holds commonly used functions for manipulation of
 * angles/degrees/headings, altitudes, and bearings
 */

import { BRAA } from "classes/braa"
import { SensorType } from "../classes/aircraft/datatrail/sensortype"
import { AircraftGroup } from "../classes/groups/group"

/**
 * Left pad a string with 0s
 * @param value - the string to pad
 * @param padding - how long the resulting string should be
 */
export function lpad(value: number, padding: number): string {
  return ([...Array(padding)].join("0") + value).slice(-padding)
}

/**
 * Get 'aspect' (HOT/FLANK/BEAM, etc) between groups
 *
 * Aspect is calculated by taking the angle difference between
 * other a/c heading, and the reciprocal bearing between ownship
 * and other a/c.
 *
 * In otherwords, if "ownship" turned around, how much would
 * other a/c have to turn to point at ownship?
 *
 * @param group1 - 'ownship'
 * @param group2 - other aircraft
 */
export function getAspect(
  group1: AircraftGroup,
  group2: AircraftGroup,
  dataStyle: SensorType
): string {
  const recipBrg: BRAA = group2
    .getCenterOfMass(dataStyle)
    .getBR(group1.getCenterOfMass(dataStyle))

  let dist = (group2.getHeading() - parseInt(recipBrg.bearing) + 360) % 360
  if (dist > 180) dist = 360 - dist
  const cata = dist

  let aspectH = "MANEUVER"

  if (cata < 30) {
    aspectH = "HOT"
  } else if (cata < 60) {
    aspectH = "FLANK"
  } else if (cata < 110) {
    aspectH = "BEAM"
  } else if (cata <= 180) {
    aspectH = "DRAG"
  }
  return aspectH
}

/**
 * Converts a heading to a cardinal direction
 * @param heading - heading to translate to track direction
 */
export function trackDirFromHdg(heading: number): string {
  const arr = [
    "NORTH",
    "NORTHEAST",
    "NORTHEAST",
    "NORTHEAST",
    "EAST",
    "SOUTHEAST",
    "SOUTHEAST",
    "SOUTHEAST",
    "SOUTH",
    "SOUTHWEST",
    "SOUTHWEST",
    "SOUTHWEST",
    "WEST",
    "NORTHWEST",
    "NORTHWEST",
    "NORTHWEST",
  ]
  // the compass is divided every 20 degrees, so find the 'box' of degrees the
  // current heading is in
  const val = Math.floor(heading / (360 / arr.length) + 0.5)
  return arr[val % arr.length]
}
