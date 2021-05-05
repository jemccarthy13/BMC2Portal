import { AnimationHandler } from "./animationhandler"
import { AircraftGroup } from "../classes/groups/group"
import { PictureCanvasState } from "../canvas/canvastypes"

import { randomNumber } from "../utils/psmath"
import { drawAltitudes } from "../canvas/draw/drawutils"

/**
 * This Handler implements applyLogic to drive towards a desired point
 * or a desired heading to fly (in the absence of desired point).
 *
 * If neither intent is present, fly current heading until the boundary
 * of the canvas.
 */
export class PicAnimationHandler extends AnimationHandler {
  /**
   * Drive blue air towards red air.
   *
   * @param blueAir The blue aircraft group
   * @param groups The rest of the aircraft groups
   * @param _ctx Current drawing context (unused for this handler)
   */
  applyBlueLogic(
    blueAir: AircraftGroup,
    groups: AircraftGroup[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ctx?: CanvasRenderingContext2D
  ): void {
    const brToRed = blueAir.getCenterOfMass().getBR(groups[0].getCenterOfMass())
    blueAir.updateIntent({
      desiredHeading: brToRed.bearingNum,
    })
  }

  /**
   * Drive red air -- maneuver hot to blue air, then check for
   * out of bounds. Then, check for predetermined maneuvers and
   * perform turns as required.
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
    const bluePos = state.blueAir.getCenterOfMass()
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
        grp.setManeuvers(0)
      }

      // TODO -- MANEUVER -- when maneuver count is >1, set two routing points
      // (i.e. flank for xx nm then turn back hot)
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
