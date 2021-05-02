import { FightAxis, PictureAnswer, PictureCanvasProps, PictureCanvasState, PictureDrawFunction } from "canvas/canvastypes"
import { Bounds, drawAltitudes, drawMeasurement, getStartPos } from "canvas/draw/drawutils"
import { formatGroup } from "canvas/draw/formatutils"
import { isAnchorNorth, picTrackDir } from "canvas/draw/intercept/picturehelpers"
import { Braaseye } from "classes/braaseye"
import { AircraftGroup } from "classes/groups/group"
import { AltStack } from "classes/interfaces"
import { Point } from "classes/point"
import { randomHeading, randomNumber } from "utils/psmath"

export const drawVic:PictureDrawFunction =  (
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    start?: Point|undefined ): PictureAnswer => {
  
    const boundaries: Bounds = {
      tall: { lowX: 0.2, hiX: 0.8, lowY: 0.4, hiY: 0.9 }, 
      wide: { lowX: 0.3, hiX: 0.6, lowY: 0.2, hiY: 0.8 }
    }
    // const startPos = getStartPos(ctx, props.orientation.orient, boundaries, start)
    const startPos = getStartPos(ctx, state.bluePos, props.orientation.orient, start)
    const startX = startPos.x
    const startY = startPos.y
   
    const incr: number = ctx.canvas.width / (ctx.canvas.width / 10);
    const vicWidth: number = randomNumber(3.5 * incr, 10 * incr);
    const vicDepth: number = randomNumber(3.5 * incr, 10 * incr);
  
    let heading:number = randomHeading(props.format, state.bluePos.getHeading());
    //const lg:Group = //
    const lg = new AircraftGroup({
      ctx, 
      sx: startX,
      sy: startY,
      hdg: heading
    })
    lg.draw(ctx, props.dataStyle)
  
   const isNS = props.orientation.orient === FightAxis.NS
  
    if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.getHeading());
    let stg:AircraftGroup
    if (isNS){
      stg = new AircraftGroup({
        ctx, 
        sx: startX + vicWidth / 2,
        sy: startY + vicDepth,
        hdg: heading + randomNumber(-10,10)
      })
    } else {
      stg = new AircraftGroup({
        ctx, 
        sx: startX - vicDepth,
        sy: startY + vicWidth / 2,
        hdg: heading + randomNumber(-10,10)
      })
    }
    stg.draw(ctx, props.dataStyle)
  
    if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.getHeading());
    let ntg:AircraftGroup
    let offsetX = 0;
    let nLbl = "NORTH";
    let sLbl = "SOUTH";
    if (isNS){
      ntg = new AircraftGroup({
        ctx, 
        sx: startX - vicWidth / 2,
        sy: startY + vicDepth,
        hdg: heading + randomNumber(-10,10)
      })
      offsetX = -70;
      nLbl = "WEST";
      sLbl = "EAST";
    } else {
      ntg = new AircraftGroup({
        ctx,
        sx: startX - vicDepth,
        sy: startY - vicWidth / 2,
        hdg: heading + randomNumber(-10,10)
      })
    }
    ntg.draw(ctx, props.dataStyle)
  
    const ntgPos = ntg.getCenterOfMass();
    const stgPos = stg.getCenterOfMass();
    const lgPos = lg.getCenterOfMass()
    let realDepth, realWidth
    if (isNS){
      realDepth = new Point(lgPos.x, stgPos.y).getBR(lgPos).range
      realWidth = new Point(ntgPos.x, stgPos.y).getBR(stgPos).range
      drawMeasurement( ctx, lgPos.x, lgPos.y, lgPos.x, stgPos.y, realDepth, props.showMeasurements);
      drawMeasurement( ctx, stgPos.x, stgPos.y, ntgPos.x, stgPos.y, realWidth, props.showMeasurements);
    } else {
      realDepth = new Point(stgPos.x, lgPos.y).getBR(lgPos).range
      realWidth = new Point(stgPos.x, ntgPos.y).getBR(stgPos).range
      drawMeasurement( ctx, lgPos.x, lgPos.y, stgPos.x, lgPos.y, realDepth, props.showMeasurements)
      drawMeasurement( ctx, stgPos.x, stgPos.y, stgPos.x, ntgPos.y, realWidth, props.showMeasurements);
    }
  
    drawAltitudes( ctx, lgPos, lg.getAltitudes());
    drawAltitudes( ctx, stgPos, stg.getAltitudes());
    drawAltitudes( ctx, ntgPos, ntg.getAltitudes(), offsetX);
  
    const lgBraaseye = new Braaseye(lgPos, state.bluePos.getCenterOfMass(), state.bullseye)
    const stgBraaseye = new Braaseye(stgPos, state.bluePos.getCenterOfMass(), state.bullseye)
    const ntgBraaseye = new Braaseye(ntgPos, state.bluePos.getCenterOfMass(), state.bullseye)
    
    lgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst)
    stgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst)
    ntgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst, offsetX)
  
    const lgAlts:AltStack = lg.getAltStack( props.format);
    const stgAlts:AltStack = stg.getAltStack( props.format);
    const ntgAlts:AltStack = ntg.getAltStack( props.format);
  
    let answer = "THREE GROUP VIC " + realDepth + " DEEP, " + realWidth + " WIDE, ";
  
    if (new Point(lgPos.x, ntgPos.y).getBR(lgPos).range < realWidth/3){
      answer += " WEIGHTED " + nLbl +", ";
    }
    else if (new Point(lgPos.x, stgPos.y).getBR(lgPos ).range < realWidth/3){
      answer += " WEIGHTED " + sLbl +", ";
    }
  
    //console.log("DETERMINE IF OPENING/CLOSING -- EWI/SPEED TG");
  
    answer += picTrackDir(props.format, [ntg, stg, lg])
    
    answer += formatGroup("LEAD", lgBraaseye, lgAlts, lg.getStrength(), true, lg.getTrackDir()) + " ";
  
    const anchorN = isAnchorNorth(ntgBraaseye, stgBraaseye, ntg, stg)
    
    if (anchorN) {
      answer += formatGroup( nLbl+" TRAIL", ntgBraaseye, ntgAlts, ntg.getStrength(), false, ntg.getTrackDir()) + " ";
      answer += formatGroup( sLbl +" TRAIL", stgBraaseye, stgAlts, stg.getStrength(), false, stg.getTrackDir());
    } else {
      answer += formatGroup( sLbl +" TRAIL", stgBraaseye, stgAlts, stg.getStrength(), false, stg.getTrackDir()) + " ";
      answer += formatGroup( nLbl + " TRAIL", ntgBraaseye, ntgAlts, ntg.getStrength(), false, ntg.getTrackDir());
    }
  
    lg.setLabel("LEAD GROUP")
    stg.setLabel(sLbl +" TRAIL GROUP")
    ntg.setLabel(nLbl + " TRAIL GROUP")
  
    return {
      pic: answer,
      groups: [lg, stg, ntg]
    };
}