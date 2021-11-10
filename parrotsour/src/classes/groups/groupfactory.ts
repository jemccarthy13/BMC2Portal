import { PictureCanvasProps, PictureCanvasState } from "canvas/canvastypes"
import { AircraftGroup } from "./group"
import { Point } from "../point"

import { randomHeading } from "../../utils/psmath"
import { getStartPos } from "../../canvas/draw/intercept/pictureclamp"

export class GroupFactory {
  public static randomGroupAtLoc(
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

    const p = { sx: startPos.x, sy: startPos.y, hdg, nContacts }
    const grp = new AircraftGroup(p)
    return grp
  }

  public static randomGroup(
    props: PictureCanvasProps,
    state: PictureCanvasState,
    heading?: number,
    numContacts?: number
  ): AircraftGroup {
    const startLoc = getStartPos(
      state.blueAir,
      props.orientation.orient,
      props.dataStyle
    )
    return this.randomGroupAtLoc(props, state, startLoc, heading, numContacts)
  }
}
