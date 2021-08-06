import { PictureCanvasProps, PictureCanvasState } from "canvas/canvastypes"
import { AircraftGroup } from "./group"
import { Point } from "../point"

import { randomHeading } from "../../utils/psmath"
import { getStartPos } from "../../canvas/draw/intercept/pictureclamp"

export class GroupFactory {
  public static randomGroupAtLoc(
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    startLoc: Point,
    heading?: number,
    nContacts?: number
  ): AircraftGroup {
    const hdg = heading
      ? heading
      : randomHeading(props.format, state.blueAir.getHeading())
    const startPos = startLoc

    console.log("creating group with " + nContacts)
    const p = { sx: startPos.x, sy: startPos.y, hdg, ctx, nContacts }
    const grp = new AircraftGroup(p)
    return grp
  }

  public static randomGroup(
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    heading?: number,
    numContacts?: number
  ): AircraftGroup {
    const startLoc = getStartPos(
      ctx,
      state.blueAir,
      props.orientation.orient,
      props.dataStyle
    )
    return this.randomGroupAtLoc(
      ctx,
      props,
      state,
      startLoc,
      heading,
      numContacts
    )
  }
}
