import { Bounds, getStartPos } from "canvas/draw/drawutils";
import { PictureCanvasProps, PictureCanvasState } from "canvas/canvastypes";
import { AircraftGroup } from "classes/groups/group";
import { Point } from "classes/point";

import { randomHeading } from "utils/psmath";

export class GroupFactory {

    public static randomGroupAtLoc(ctx:CanvasRenderingContext2D, props:PictureCanvasProps, state:PictureCanvasState, startLoc: Point, heading?: number):AircraftGroup{
        const hdg = heading ? heading : randomHeading(props.format, state.bluePos.getHeading());
        const startPos = startLoc
        
        const p = { sx: startPos.x, sy: startPos.y, hdg, ctx }
        const grp = new AircraftGroup(p)
        return grp
    }

    public static randomGroup(ctx:CanvasRenderingContext2D, props:PictureCanvasProps, state:PictureCanvasState, bounds?:Bounds, heading?:number): AircraftGroup { 
        bounds = bounds || {
            tall: { lowX: 0.2, hiX: 0.8, lowY: 0.2, hiY: 0.8},
            wide: { lowX: 0.2, hiX: 0.8, lowY: 0.2, hiY: 0.8}
          }
        //const startLoc = getStartPos(ctx, props.orientation.orient,bounds)
        const startLoc = getStartPos(ctx, state.bluePos, props.orientation.orient)

        return this.randomGroupAtLoc(ctx, props, state, startLoc, heading)
    }
}