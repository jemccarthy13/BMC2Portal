// Interfaces
import { AircraftGroup } from "../../../classes/groups/group"

// Functions
import { randomNumber } from "../../../utils/psmath"

export const checkCaps = (grps: AircraftGroup[]): void => {
  let numCaps = randomNumber(1, grps.length - 1)
  while (numCaps > 0) {
    const idx = randomNumber(0, grps.length - 1)
    grps[idx].setCapping(true)
    numCaps--
  }
}
