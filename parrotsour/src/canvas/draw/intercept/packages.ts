import { FightAxis, PictureAnswer, PictureCanvasProps, PictureCanvasState, PictureDrawFunction } from "canvas/canvastypes"
import { drawBullseye } from "canvas/draw/drawutils"
import { AircraftGroup } from "classes/groups/group"
import { Point } from "classes/point"
import { randomNumber } from "utils/psmath"

const _getPicBull = (isRange:boolean, orientation:FightAxis, bluePos:AircraftGroup, groups:AircraftGroup[]): Point => {
    let closestGroup = groups[0]
  
    let closestRng = 9999
    let sum = 0
    const bPos = bluePos.getCenterOfMass()
    for ( let x = 0; x < groups.length; x++){
      const BRAA = bPos.getBR(groups[x].getCenterOfMass())
      if (BRAA.range < closestRng ) {
        closestGroup = groups[x]
        closestRng = BRAA.range
      }
  
      const gPos = groups[x].getCenterOfMass()
      if (orientation === FightAxis.NS){
        sum += gPos.x
      } else {
        sum += gPos.y
      }
    }
  
    let retVal = new Point(sum/groups.length, closestGroup.getCenterOfMass().y)
    if ((orientation === FightAxis.EW && !isRange) || (orientation === FightAxis.NS && isRange)){
      retVal = new Point(closestGroup.getCenterOfMass().x, sum/groups.length)
    }
    return retVal
}

const _getAnchorPkg = (leadBR:number, trailBR:number, groups1:AircraftGroup[], groups2:AircraftGroup[]):boolean => {
    let anchorLead = true
    if (trailBR < leadBR){
      anchorLead = false
    } else if (trailBR === leadBR) {
      const maxAlt1 = Math.max(...groups1.map((grp)=>{return Math.max(...grp.getAltitudes())}))
      const maxAlt2 = Math.max(...groups2.map((grp)=>{return Math.max(...grp.getAltitudes())}))
      if (maxAlt2 > maxAlt1){
        anchorLead = false
      } else if (maxAlt2 === maxAlt1){
        if (groups2.length>groups1.length){
          anchorLead = false
        }
      }
    }
    return anchorLead
}

export const drawPackage:PictureDrawFunction = (
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    start?: Point|undefined ): PictureAnswer => {
  
    //const isRange = randomNumber(0,120) < 50
    const isRange = false
  
    let start1: Point
    let start2: Point
  
    let lLbl = "WEST"
    let tLbl = "EAST"
    
    if (props.orientation.orient===FightAxis.EW){
      if (isRange){
        start1 = new Point(
          randomNumber(ctx.canvas.width* 0.5, ctx.canvas.width*0.59),
          randomNumber(ctx.canvas.height* 0.2, ctx.canvas.width*0.4))
        start2 = new Point(
          randomNumber(ctx.canvas.width * 0.2, ctx.canvas.width*0.35),
          start1.y)
      } else {
        tLbl = "NORTH"
        lLbl = "SOUTH"
        start1 = new Point(
          randomNumber(ctx.canvas.width * 0.25, ctx.canvas.width * 0.5),
          randomNumber(ctx.canvas.height * 0.60, ctx.canvas.height * 0.70))
        start2 = new Point(
          start1.x,
          randomNumber(ctx.canvas.height * 0.25, ctx.canvas.height * 0.40))
      }
    } else {
      if (isRange){
        lLbl = "NORTH"
        tLbl = "SOUTH"
        start1 = new Point (
          randomNumber(ctx.canvas.width * 0.2, ctx.canvas.width * 0.8),
          randomNumber(ctx.canvas.height*0.5, ctx.canvas.height *0.59))
        start2 = new Point (
          start1.x,
          randomNumber(ctx.canvas.height * 0.70, ctx.canvas.height *0.8))
      } else {
        start1 = new Point(
          randomNumber(ctx.canvas.width * 0.2, ctx.canvas.width*0.3),
          randomNumber(ctx.canvas.height * 0.5, ctx.canvas.height*0.80))
        start2 = new Point(
          randomNumber(ctx.canvas.width * 0.7, ctx.canvas.width*0.8),
          start1.y)
      }
    }
  
    let finalAnswer: PictureAnswer = { pic: "", groups: []}
    const answer1 = state.reDraw( ctx, true, start1)
    const answer2 = state.reDraw( ctx, true, start2)
    if (!state.bluePos) { return { pic: "", groups: []} }
    const groups1: AircraftGroup[] = answer1.groups;
    const groups2: AircraftGroup[] = answer2.groups;
    
    const bull1 = _getPicBull(isRange, props.orientation.orient, state.bluePos, groups1)
    const bull2 = _getPicBull(isRange, props.orientation.orient, state.bluePos, groups2)
    
    const leadPackage = state.bullseye.getBR(bull1);
    const trailPackage = state.bullseye.getBR(bull2);
  
    const realAnswer: PictureAnswer = {
      pic: "",
      groups: groups1.concat(groups2)
    }
  
    if ( isRange ){
      const rngBack = props.orientation.orient === FightAxis.NS ? new Point(bull1.x, bull2.y).getBR(bull1) : new Point(bull2.x, bull1.y).getBR(bull1);
      if (rngBack.range < 40 ){
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        drawBullseye(ctx, state.bullseye);
        state.bluePos.draw(ctx, props.dataStyle)
        finalAnswer = drawPackage(ctx, props, state, start);
      } else {
        realAnswer.pic = " 2 PACKAGES RANGE " + rngBack.range + " "+ 
            lLbl + " PACKAGE BULLSEYE " + leadPackage.bearing + "/" + leadPackage.range + " " +
            tLbl + " PACKAGE BULLSEYE " + trailPackage.bearing + "/" + trailPackage.range;
        finalAnswer = realAnswer
      }
    }
    else {
      const rngBack = props.orientation.orient===FightAxis.NS ? new Point(bull2.x, bull1.y).getBR(bull1) : new Point(bull1.x, bull2.y).getBR(bull1) 
      if (rngBack.range < 40) { 
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        drawBullseye( ctx, state.bullseye);
        state.bluePos.draw(ctx, props.dataStyle)
        finalAnswer= drawPackage( ctx, props, state, start);
      } else {
        const bPos = state.bluePos.getCenterOfMass()
        const leadBR = bPos.getBR(bull1).range
        const trailBR = bPos.getBR(bull2).range
        const anchorLead = _getAnchorPkg(leadBR, trailBR, groups1, groups2)
        
        if (anchorLead){
          realAnswer.pic = " 2 PACKAGES AZIMUTH " + rngBack.range + " " +
              lLbl + " PACKAGE BULLSEYE " + leadPackage.bearing + "/" + leadPackage.range + " "+
              tLbl +" PACKAGE BULLSEYE " + trailPackage.bearing + "/" + trailPackage.range;
        } else {
          realAnswer.pic = " 2 PACKAGES AZIMUTH " + rngBack.range + " " +
              tLbl + " PACKAGE BULLSEYE " + trailPackage.bearing + "/" + trailPackage.range + " "+
              lLbl +" PACKAGE BULLSEYE " + leadPackage.bearing + "/" + leadPackage.range;
        }
        finalAnswer = realAnswer
      }
    }
    return finalAnswer
}