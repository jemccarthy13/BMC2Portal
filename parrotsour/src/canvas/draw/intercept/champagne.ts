import { FightAxis, PictureAnswer, PictureCanvasProps, PictureCanvasState, PictureDrawFunction } from "canvas/canvastypes"
import { Bounds, drawAltitudes, drawMeasurement, getStartPos } from "canvas/draw/drawutils"
import { formatGroup } from "canvas/draw/formatutils"
import { isAnchorNorth, picTrackDir } from "canvas/draw/intercept/picturehelpers"
import { Braaseye } from "classes/braaseye"
import { AircraftGroup } from "classes/groups/group"
import { AltStack } from "classes/interfaces"
import { Point } from "classes/point"
import { randomHeading, randomNumber } from "utils/psmath"

export const drawChampagne:PictureDrawFunction =  (
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    start?: Point|undefined ): PictureAnswer => {
    
    const boundaries: Bounds = {
      tall: { lowX: 0.2, hiX: 0.8, lowY: 0.5, hiY: 0.9 },
      wide: { lowX: 0.2, hiX: 0.5, lowY: 0.2, hiY: 0.8 }
    }
  
    //const startPos = getStartPos(ctx, props.orientation.orient, boundaries, start)
    const startPos = getStartPos(ctx, state.bluePos, props.orientation.orient, start)
    const startX = startPos.x
    const startY = startPos.y
  
    const incr:number = ctx.canvas.width / (ctx.canvas.width / 10);
    const champWidth:number = randomNumber(3.5 * incr, 10 * incr);
    const champDepth:number = randomNumber(3.5 * incr, 10 * incr);
  
    let heading:number = randomHeading(props.format, state.bluePos.getHeading());
    const tg = new AircraftGroup({
      ctx, 
      sx: startX,
      sy: startY,
      hdg: heading + randomNumber(-10,10)
    })
    tg.draw(ctx, props.dataStyle)
  
    if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.getHeading());
    
    const isNS = props.orientation.orient === FightAxis.NS
  
    let nlg:AircraftGroup
    if (isNS){
      nlg = new AircraftGroup({
        ctx, 
        sx: startX - champWidth / 2,
        sy: startY - champDepth,
        hdg: heading + randomNumber(-10,10)
      })
    } else {
      nlg = new AircraftGroup({
        ctx,
        sx: startX + champDepth,
        sy: startY - champWidth / 2,
        hdg: heading + randomNumber(-10,10)
      })
    }
    nlg.draw(ctx, props.dataStyle)
    
    if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.getHeading());
    let slg:AircraftGroup
    let offsetX = 0;
    let offsetX2 = 0;
    
    let sLbl = "SOUTH";
    let nLbl = "NORTH";
  
    if (isNS){
      slg = new AircraftGroup({
        ctx, 
        sx: startX + champWidth / 2,
        sy: startY - champDepth,
        hdg: heading + randomNumber(-10,10)
      })
      offsetX2 = -70;    
      sLbl = "EAST";
      nLbl = "WEST";
    } else {
      slg = new AircraftGroup({
        ctx, 
        sx: startX + champDepth,
        sy: startY + champWidth / 2,
        hdg: heading + randomNumber(-10,10)
      })
      offsetX = -70;
    }
    slg.draw(ctx, props.dataStyle)
    
    let realDepth, realWidth
    const nlgPos = nlg.getCenterOfMass()
    const slgPos = slg.getCenterOfMass()
    const tgPos = tg.getCenterOfMass()
    if (isNS) {
      realWidth = new Point(slgPos.x, nlgPos.y).getBR(nlgPos).range
      realDepth = new Point(tgPos.x, nlgPos.y).getBR(tgPos).range
      drawMeasurement( ctx, nlgPos.x, nlgPos.y, tgPos.x, nlgPos.y, realWidth, props.showMeasurements);
      drawMeasurement( ctx, tgPos.x, tgPos.y, tgPos.x, nlgPos.y, realDepth, props.showMeasurements);  
    } else {
      realWidth = nlgPos.getBR(new Point(nlgPos.x, slgPos.y)).range
      realDepth = new Point(nlgPos.x, tgPos.y).getBR(tgPos).range
      drawMeasurement( ctx, nlgPos.x, slgPos.y, nlgPos.x, nlgPos.y, realWidth, props.showMeasurements);
      drawMeasurement( ctx, tgPos.x, tgPos.y, nlgPos.x, tgPos.y, realDepth, props.showMeasurements);
    } 
  
    drawAltitudes( ctx, tgPos, tg.getAltitudes(), offsetX);
    drawAltitudes( ctx, slgPos, slg.getAltitudes());
    drawAltitudes( ctx, nlgPos, nlg.getAltitudes(), offsetX2);
    
    const tgBraaseye = new Braaseye(tgPos, state.bluePos.getCenterOfMass(), state.bullseye)
    const nlgBraaseye = new Braaseye(nlgPos, state.bluePos.getCenterOfMass(), state.bullseye)
    const slgBraaseye = new Braaseye(slgPos, state.bluePos.getCenterOfMass(), state.bullseye)
  
    tgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst, offsetX)
    nlgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst, offsetX2)
    slgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst)
  
    const tgAlts:AltStack = tg.getAltStack(props.format);
    const nlgAlts:AltStack = nlg.getAltStack(props.format);
    const slgAlts:AltStack = slg.getAltStack(props.format);
  
    let answer = "THREE GROUP CHAMPAGNE " +realWidth +" WIDE, " +realDepth +" DEEP, ";
   
    // determine if weighted
    if (new Point(nlgPos.x, tgPos.y).getBR(nlgPos).range < realWidth/3){
      answer += " WEIGHTED " + nLbl + ", ";
    } else if (new Point(slgPos.x, tgPos.y).getBR(slgPos).range < realWidth/3){
      answer += " WEIGHTED " + sLbl + ", ";
    }
    
    answer += picTrackDir(props.format, [nlg, slg, tg])
  
    const includeBull = (realWidth >= 10 && props.format !=="ipe");
  
    // TODO -- anchoring priorities for LE of champagne
    const anchorN = isAnchorNorth(nlgBraaseye, slgBraaseye, nlg, slg)
    if (anchorN) {
      answer += formatGroup(nLbl +" LEAD", nlgBraaseye, nlgAlts, nlg.getStrength(), true, nlg.getTrackDir()) + " ";
      answer +=  formatGroup(sLbl +" LEAD",  slgBraaseye,  slgAlts,  slg.getStrength(),  includeBull, slg.getTrackDir() ) + " ";
    } else {
      answer += formatGroup(sLbl +" LEAD", slgBraaseye, slgAlts, slg.getStrength(), true, slg.getTrackDir()) + " ";
      answer += formatGroup(nLbl + " LEAD", nlgBraaseye,  nlgAlts,  nlg.getStrength(),  includeBull, nlg.getTrackDir() ) + " ";
    }
    answer += formatGroup("TRAIL", tgBraaseye, tgAlts, tg.getStrength(), false, tg.getTrackDir());
  
    tg.setLabel("TRAIL GROUP")
    nlg.setLabel(nLbl + " LEAD GROUP")
    slg.setLabel(sLbl +" LEAD GROUP")
  
    return {
      pic: answer,
      groups: [tg, nlg, slg]
    };
}