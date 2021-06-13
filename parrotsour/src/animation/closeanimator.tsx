import { AnimationHandler } from "./animationhandler"
import { AircraftGroup } from "../classes/groups/group"
import { PictureCanvasState } from "../canvas/canvastypes"

import { drawAltitudes } from "../canvas/draw/drawutils"
import { SensorType } from "../classes/aircraft/datatrail/sensortype"

/**
 * This Handler implements applyLogic to drive aircraft towards
 * a close controlled heading and altitude
 *
 * If intent isn't present, fly current heading
 */
export class CloseAnimationHandler extends AnimationHandler {
  /**
   * Drive blue air.
   *
   * @param blueAir The blue aircraft group
   * @param groups The rest of the aircraft groups
   * @param dataStyle SensorType for data trail
   * @param _ctx Current drawing context (unused for this handler)
   */
  applyBlueLogic(
    blueAir: AircraftGroup,
    groups: AircraftGroup[],
    dataStyle: SensorType
  ): void {
    const brToRed = blueAir
      .getCenterOfMass(dataStyle)
      .getBR(groups[0].getCenterOfMass(dataStyle))
    blueAir.updateIntent({
      desiredHeading: brToRed.bearingNum,
    })
  }

  /**
   * Drive red air -- maneuver to desired heading
   *
   * @param grp Group to check intent for
   * @param state Current state of canvas
   * @param dataStyle Current DataTrail style
   * @param resetCallback (Optional) call back to perform on animate pause
   * @param ctx (Optional) current drawing context. If undefined,
   * uses curRef from Canvas
   */
  applyLogic(
    grp: AircraftGroup,
    state: PictureCanvasState,
    dataStyle: SensorType,
    resetCallback?: () => void,
    ctx?: CanvasRenderingContext2D
  ): void {
    // const bluePos = state.blueAir.getCenterOfMass(dataStyle)
    // const startPos = grp.getCenterOfMass(dataStyle)

    //
    // Figure out a end animation criteria
    //

    // // if red is close enough to blue, stop the animation
    // if (startPos.getBR(bluePos).range < 30 && resetCallback) {
    //   this.pauseFight(resetCallback)
    // }

    // draw altitudes during the animation
    if (ctx && this.continueAnimate) {
      const grpPos = grp.getCenterOfMass(dataStyle)
      drawAltitudes(ctx, grpPos, grp.getAltitudes())

      // if (this._isNearBounds(ctx, grp, dataStyle)) {
      //   grp.updateIntent({
      //     desiredHeading: grpPos.getBR(bluePos).bearingNum,
      //   })
      // }
    }
  }
}
