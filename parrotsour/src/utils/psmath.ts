import { FORMAT } from "../classes/supportedformats"

export const PIXELS_TO_NM = 4

/**
 * Converts a math angle to Radians (180 is EW line)
 * @param angleDeg - the cartesian angle to convert to radians
 */
export function toRadians(angleDeg: number): number {
  return angleDeg * (Math.PI / 180)
}

/**
 * Converts radians to cartesian degrees
 * @param rads - radians to convert to degrees
 */
export function toDegrees(rads: number): number {
  return rads * (180 / Math.PI)
}

/**
 * Convert an aeronautical heading to Cartesian radians,
 * and return useful information about that heading.
 *
 * @param heading heading in degrees
 * @returns An object containing:
 *          - radians (heading -> radians)
 *          - offset (90 deg perpendicular to heading, useful for
 *              spacing DataTrails)
 *          - headAngle (150 deg delta from heading, useful for
 *              drawing Arrow DataTrail)
 */
export function headingToRadians(heading: number): {
  radians: number
  headAngle: number
  offset: number
} {
  let deg: number = 360 - (heading - 90)
  if (heading < 90) deg = 90 - heading

  let arrowHead = deg - 150
  if (arrowHead < 0) arrowHead = 360 + arrowHead

  let offsetVector = deg - 90
  if (offsetVector < 0) offsetVector = 360 + offsetVector

  return {
    radians: toRadians(deg),
    headAngle: toRadians(arrowHead),
    offset: toRadians(offsetVector),
  }
}

/**
 * Returns a random number from min to max (inclusive both)
 * @param min minimum value
 * @param max maximum value
 */
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Return a random heading (0-360 for ALSA, HOT/FLANK blue for !ALSA)
 * @param format
 */
export function randomHeading(format: FORMAT, blueHeading = -1): number {
  const bound = format === FORMAT.IPE ? 45 : 360
  const offset = randomNumber(-bound, bound)

  let blueOpp = blueHeading - 180
  if (blueOpp < 0) blueOpp = 360 - blueOpp

  let heading: number = blueOpp + offset
  heading = (360 + heading) % 360

  return heading
}

/**
 * Get the shortest delta between two angles (i.e. do I turn left or
 * right to get to the 'desired' angle)
 */
export function getDegDeltaBetween(
  heading: number,
  desHeading: number,
  forced: string | undefined
): number {
  const LH = (heading - desHeading + 360) % 360
  const RH = (desHeading - heading + 360) % 360

  let deltaA = RH
  if (forced === "LEFT") {
    deltaA = -LH
  } else if (LH < RH) {
    deltaA = -LH
  }
  return deltaA
}
