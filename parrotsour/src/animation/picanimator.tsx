import { AnimationHandler } from "./animationhandler"
import { AircraftGroup } from "../classes/groups/group"
import { PictureCanvasState } from "../canvas/canvastypes"

import { randomNumber } from "../utils/psmath"
import { drawAltitudes } from "../canvas/draw/drawutils"

/**
 * This Handler implements applyLogic to drive towards a desired point
 * (bluePos), or a desired heading to fly (in the absence of desired point).
 *
 * If neither intent is present, fly current heading until the boundary
 * of the canvas.
 */
export class PicAnimationHandler extends AnimationHandler {
  /**
   * Use state to check intent based on class logic.
   *
   * @param grp Group to check intent for
   * @param state Current state of canvas
   */
  applyLogic(
    grp: AircraftGroup,
    state: PictureCanvasState,
    resetCallback?: () => void,
    ctx?: CanvasRenderingContext2D
  ): void {
    const bluePos = state.bluePos.getCenterOfMass()
    const startPos = grp.getCenterOfMass()

    // if red is close enough to blue, stop the animation
    if (startPos.getBR(bluePos).range < 30 && resetCallback) {
      this.pauseFight(resetCallback)
    }

    // check to see if the group should maneuver
    const manCheck = (): boolean => {
      const br = startPos.getBR(bluePos)
      if (br.range < 70) {
        return true
      }
      return false
    }

    // if the group is flagged to do maneuvers, check to see if its maneuver time
    if (grp.doesManeuvers()) {
      const manTrigger = manCheck()

      // if the maneuver was triggered, unset the routing and set a random desired heading
      if (manTrigger) {
        grp.updateIntent({
          desiredLoc: [],
          desiredHeading: randomNumber(45, 330),
        })
        // grp.clearRouting()
        // grp.setDesiredHeading(randomNumber(45, 330))
        grp.setManeuvers(0)
      }
    }

    // draw altitudes during the animation
    if (ctx && this.continueAnimate) {
      const grpPos = grp.getCenterOfMass()
      drawAltitudes(ctx, grpPos, grp.getAltitudes())

      if (this._isNearBounds(ctx, grp)) {
        grp.updateIntent({
          desiredHeading: grpPos.getBR(bluePos).bearingNum,
        })
      }
    }
  }
}
