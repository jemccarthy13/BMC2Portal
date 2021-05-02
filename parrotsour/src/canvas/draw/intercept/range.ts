import { FightAxis, PictureAnswer, PictureCanvasProps, PictureCanvasState, PictureDrawFunction } from "canvas/canvastypes"
import { Bounds, drawAltitudes, drawMeasurement, getStartPos } from "canvas/draw/drawutils"
import { formatGroup } from "canvas/draw/formatutils"
import { picTrackDir } from "canvas/draw/intercept/picturehelpers"
import { Braaseye } from "classes/braaseye"
import { AircraftGroup } from "classes/groups/group"
import { Point } from "classes/point"
import { trackDirFromHdg } from "utils/mathutilities"
import { randomHeading, randomNumber } from "utils/psmath"

/**
 * Draw two groups in range and return the correct answer.
 * 
 * @param ctx Current drawing context
 * @param props PicCanvasProps for the canvas
 * @param state PicCanvasState of the current canvas
 * @param start (Optional) Forced starting location for the picture
 * @returns DrawAnswer with the correct answer for this picture
 */
export const drawRange:PictureDrawFunction = (
    ctx:CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    start?:Point): PictureAnswer => {
        
    const boundaries: Bounds = {
      tall:{ lowX: 0.2, hiX: 0.8, lowY: 0.4, hiY: 0.8 }, 
      wide:{ lowX:0.2, hiX: 0.6, lowY:0.2, hiY:0.8 }
    }

    // const startPos = getStartPos(ctx, props.orientation.orient, boundaries, start)
    const startPos = getStartPos(ctx, state.bluePos, props.orientation.orient, start)
    const startX = startPos.x
    const startY = startPos.y
      
    const incr:number = ctx.canvas.width / (ctx.canvas.width / 10);
    const drawDistance:number = randomNumber(3.5 * incr, 10 * incr);
  
    let heading:number = randomHeading(props.format, state.bluePos.getHeading());

    const tg = new AircraftGroup({
      ctx, 
      sx: startX,
      sy: startY,
      hdg: heading
    })
    tg.draw(ctx, props.dataStyle)
  
    if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.getHeading());

    let lg: AircraftGroup
    let m2: Point
    let offsetX = 0;
    let offsetY = 0;
    let offsetX2 = 0;
    let offsetY2 = 0;

    const tgPos = tg.getCenterOfMass()

    const isNS = props.orientation.orient === FightAxis.NS
    const isEW = props.orientation.orient === FightAxis.EW
    if (isNS) {
      lg = new AircraftGroup({
        ctx, 
        sx: startX,
        sy: startY + drawDistance,
        hdg: heading
      })
      lg.draw(ctx, props.dataStyle)
      m2 = new Point(tgPos.x, lg.getCenterOfMass().y)
    } else {
      lg = new AircraftGroup({
        ctx,
        sx: startX + drawDistance,
        sy: startY,
        hdg: heading
      })
      lg.draw(ctx, props.dataStyle)
      m2 = new Point(lg.getCenterOfMass().x, tgPos.y)
      offsetX = -10;
      offsetY = 40;
      offsetX2 = -60;
      offsetY2 = 40;
    }
  
    const lgPos = lg.getCenterOfMass()

    const range = m2.getBR(tgPos).range
    drawMeasurement(ctx, tgPos.x, tgPos.y, m2.x, m2.y, range, props.showMeasurements);
  
    const tgAlts = tg.getAltStack(props.format)
    const lgAlts = lg.getAltStack(props.format)
  
    drawAltitudes(ctx, lgPos, lg.getAltitudes(), offsetX, offsetY);
    drawAltitudes(ctx, tgPos, tg.getAltitudes(), offsetX2, offsetY2);

    const lgBraaseye = new Braaseye(lgPos, state.bluePos.getCenterOfMass(), state.bullseye)
    const tgBraaseye = new Braaseye(tgPos, state.bluePos.getCenterOfMass(), state.bullseye)

    lgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst, offsetX, offsetY)
    tgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst, offsetX2, offsetY2)
  
    let answer: string = "TWO GROUPS RANGE " +  range + ", ";
  
    if ((isEW && new Point(tgPos.x, lgPos.y).getBR(tgPos).range > 5) || (isNS && tgPos.getBR(new Point(lgPos.x, tgPos.y)).range > 5)){
      if (isEW){
        answer += " ECHELON " + trackDirFromHdg(lgPos.getBR(tgPos).bearingNum)+ ", "
      } else {
        answer += " ECHELON " + trackDirFromHdg(tgPos.getBR(lgPos).bearingNum)+ ", "
      }
    }
  
    answer += picTrackDir(props.format, [tg,lg])
  
    //console.log("TODO -- DETERMINE IF OPENING/CLOSING");
  
    if (tgBraaseye.braa.range < lgBraaseye.braa.range) {
      answer += formatGroup("LEAD", tgBraaseye, tgAlts, tg.getStrength(), true, tg.getTrackDir()) + " ";
      answer += formatGroup("TRAIL", lgBraaseye, lgAlts, lg.getStrength(), false, lg.getTrackDir());
    } else {
      answer += formatGroup("LEAD", lgBraaseye, lgAlts, lg.getStrength(), true, lg.getTrackDir()) + " ";
      answer += formatGroup("TRAIL", tgBraaseye, tgAlts, tg.getStrength(), false, tg.getTrackDir());
    }
  
    tg.setLabel("TRAIL GROUP")
    lg.setLabel("LEAD GROUP")
  
    return {
      pic: answer,
      groups: [tg, lg]
    };
}