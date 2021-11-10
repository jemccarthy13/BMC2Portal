export enum Aspect {
  HOT = "HOT",
  BEAM = "BEAM",
  FLANK = "FLANK",
  DRAG = "DRAG",
  MANEUVER = "MANEUVER",
  UNKNOWN = "",
}

export function aspectFromCATA(cata: number): Aspect {
  let aspectH = Aspect.MANEUVER

  if (cata < 30) {
    aspectH = Aspect.HOT
  } else if (cata < 60) {
    aspectH = Aspect.FLANK
  } else if (cata < 110) {
    aspectH = Aspect.BEAM
  } else {
    aspectH = Aspect.DRAG
  }
  return aspectH
}

/**
 * Converts a heading/bearing to a cardinal direction
 *
 * @param {number} degrees - Heading/compass direction (degrees) to translate
 * to cardinal compass direction
 */
export function toCardinal(degrees: number): string {
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
  const val = Math.floor(degrees / (360 / arr.length) + 0.5)
  return arr[val % arr.length]
}
