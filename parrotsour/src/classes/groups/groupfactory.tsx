import { PictureCanvasProps, PictureCanvasState } from "canvas/canvastypes"
import { AircraftGroup } from "../groups/group"
import { Point } from "../point"

import { randomHeading } from "../../utils/psmath"
import { getStartPos } from "../../canvas/draw/intercept/pictureclamp"

export class GroupFactory {
  public static randomGroupAtLoc(
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    startLoc: Point,
    heading?: number
  ): AircraftGroup {
    const hdg = heading
      ? heading
      : randomHeading(props.format, state.bluePos.getHeading())
    const startPos = startLoc

    const p = { sx: startPos.x, sy: startPos.y, hdg, ctx }
    const grp = new AircraftGroup(p)
    return grp
  }

  public static randomGroup(
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    heading?: number
  ): AircraftGroup {
    const startLoc = getStartPos(ctx, state.bluePos, props.orientation.orient)
    return this.randomGroupAtLoc(ctx, props, state, startLoc, heading)
  }
}
