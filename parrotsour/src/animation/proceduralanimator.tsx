/* eslint-disable @typescript-eslint/no-unused-vars */

// Classes
import { PictureCanvasState } from "../canvas/canvastypes"
import { PaintBrush } from "../canvas/draw/paintbrush"
import { SensorType } from "../classes/aircraft/datatrail/sensortype"
import { AircraftGroup } from "../classes/groups/group"
import { AnimationHandler } from "./animationhandler"

// Functions
import { drawAltitudes } from "../canvas/draw/drawutils"

/**
 * This Handler implements applyLogic to provide a procedural scenario
 * and drive aircraft towards their intent.
 */
export class ProceduralAnimationHandler extends AnimationHandler {
  /**
   * Drive blue air. No-op for Procedural as all groups follow the
   * same logic (there is no 'blue air' in procedural state)
   * @param blueAir
   * @param groups
   * @param dataStyle
   * @param ctx
   */
  applyBlueLogic(
    blueAir: AircraftGroup,
    groups: AircraftGroup[],
    dataStyle: SensorType,
    ctx?: CanvasRenderingContext2D
  ): void {
    // do nothing
  }

  /**
   * Drive each group according to procedural 'rules'.
   *
   * Each group will try to go to their desired altitude
   * or desired destination.
   *
   * @param grp the Group to apply logic to
   * @param state current state of procedural canvas
   * @param dataStyle current SensorType (datatrail)
   * @param resetCallback callback for when end state is met; unused as procedural has no end state
   * @param ctx current drawing canvas context
   */
  applyLogic(
    grp: AircraftGroup,
    state: PictureCanvasState,
    dataStyle: SensorType,
    resetCallback?: () => void,
    ctx?: CanvasRenderingContext2D
  ): void {
    ctx = ctx || PaintBrush.getContext()
    grp.updateAltitude()
    drawAltitudes(ctx, grp.getCenterOfMass(dataStyle), grp.getAltitudes())
    if (!grp.isCapping()) {
      grp.doNextRouting()
    }
  }
}
