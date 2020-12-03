import { AltStack, Braaseye, Bullseye, DrawAnswer } from '../../../utils/interfaces'

import { randomNumber, randomHeading, getBR, getAltStack, getTrackDir } from '../../../utils/mathutilities'
import { Bounds, drawAltitudes, drawArrow, drawBraaseye, drawBullseye, drawMeasurement, getStartPos } from '../drawutils'
import { DrawFunction, Group } from '../../../utils/interfaces'
import { PicCanvasProps, PicCanvasState } from '../../picturecanvas';
import { formatGroup, getGroupOpenClose } from '../formatutils';

const isAnchorNorth = ( ngBraaseye: Braaseye, sgBraaseye: Braaseye, ng:Group, sg:Group) =>
{
  let anchorN = false
  if (ngBraaseye.braa.range < sgBraaseye.braa.range) {
    anchorN = true;
  } else if (ngBraaseye.braa.range === sgBraaseye.braa.range) {
    const altN:number = ng.z.sort((a:number,b:number) => { return b-a;})[0];
    const altS:number = sg.z.sort((a:number,b:number) => {return b-a;})[0];
    
    if (altN > altS) {
      anchorN = true;
    } else if (altN === altS){
      if (ng.numContacts >= sg.numContacts ){
          anchorN = true;
      }
    }
  }
  return anchorN
}

const isEchelon = (orientation: string, ngBraaseye:Braaseye, sgBraaseye: Braaseye, ng:Group, sg:Group):string =>{
  const isEchX = orientation==="EW" && getBR(sg.x, ng.y, {x: ng.x, y: ng.y}).range > 5
  const isEchY = orientation === "NS" && getBR(ng.x, sg.y, {x:ng.x, y:ng.y}).range > 5
  let ech = ""
  if (isEchX || isEchY){
      if (ngBraaseye.braa.range < sgBraaseye.braa.range) {
          ech = " ECHELON " + getTrackDir(parseInt(getBR(sg.x, sg.y, {x:ng.x, y:ng.y}).bearing))+ ", "
      } else {
          ech = " ECHELON " + getTrackDir(parseInt(getBR(ng.x, ng.y, {x:sg.x, y:sg.y}).bearing))+ ", "
      }
  }
  return ech
}

const picTrackDir = (format: string, groups:Group[]):string => {
  const trackDir:string = getTrackDir(groups[0].heading)
  const sameTrackDir: boolean = groups.every((group)=>{return trackDir === getTrackDir(group.heading)})
  let answer = ""
  if (format !== "ipe" && sameTrackDir){
    answer = " TRACK " + trackDir + ". ";
  }

  groups.forEach((group)=>{
    if (sameTrackDir){
      group.trackDir = undefined
    } else {
      group.trackDir = getTrackDir(group.heading)
    }
  })
  return answer
}

export const drawAzimuth:DrawFunction = (
    canvas: HTMLCanvasElement,
    ctx:CanvasRenderingContext2D,
    props: PicCanvasProps,
    state: PicCanvasState,
    start?: Bullseye):DrawAnswer => {
    
    // find the starting position of the picture
    const boundaries: Bounds = {
      tall: { lowX: 0.2, hiX: 0.6, lowY: 0.35, hiY: 0.9},
      wide: { lowX: 0.2, hiX: 0.6, lowY: 0.2, hiY: 0.6}
    }
    const startPos = getStartPos(canvas, props.orientation, boundaries, start)
    const startX = startPos.x
    const startY = startPos.y

    const incr:number = canvas.width / (canvas.width / 10);
    const drawDistance:number = randomNumber(3.5 * incr, 10 * incr);

    let heading:number = randomHeading(props.format, state.bluePos.heading);
    const ng:Group = drawArrow( canvas, props.orientation, randomNumber(1, 4), startX, startY, heading + randomNumber(-10,10));
    
    // if hard mode, we randomize the 2nd groups heading
    if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.heading);
    
    let sg:Group
    let offsetX = 0;
    let offsetY = 0;
    let offsetX2 = 0;
    let offsetY2 = 0;
    let m2: Bullseye

    if (props.orientation==="NS") {
      sg = drawArrow( canvas, props.orientation, randomNumber(1, 4), startX + drawDistance, startY, heading + randomNumber(-10,10));
      m2 = { x: sg.x, y: ng.y}
      offsetX = -60;
      offsetY = 40;
      offsetX2 = 10;
      offsetY2 = 10;
      
      ng.label = "WEST GROUP";
      sg.label = "EAST GROUP";
    } else {
      sg = drawArrow( canvas, props.orientation, randomNumber(1, 4), startX, startY + drawDistance, heading + randomNumber(-10,10));
      m2 = { x: ng.x, y: sg.y}
      
      ng.label = "NORTH GROUP";
      sg.label = "SOUTH GROUP";
    }

    const width = getBR( ng.x, ng.y, m2).range

    drawMeasurement(canvas, ctx, ng.x, ng.y + 2, m2.x, m2.y + 2, width, props.showMeasurements);

    drawAltitudes(canvas, ctx, ng.x + 20 + offsetX, ng.y - 11 +offsetY, ng.z);
    drawAltitudes(canvas, ctx, sg.x + 20 + offsetX2, sg.y - 11 + offsetY2, sg.z);

    const ngBraaseye: Braaseye = drawBraaseye(canvas, ctx, state.bluePos, ng, state.bullseye, props.showMeasurements, props.braaFirst, offsetX, offsetY);
    const sgBraaseye: Braaseye = drawBraaseye(canvas, ctx, state.bluePos, sg, state.bullseye, props.showMeasurements, props.braaFirst, offsetX2, offsetY2);

    const ngAlts: AltStack = getAltStack(ng.z, props.format);
    const sgAlts: AltStack = getAltStack(sg.z, props.format);

    // anchor both outrigger with bullseye if >10 az and !ipe
    const includeBull = (width >= 10 && props.format!=="ipe");
    
    let answer = "TWO GROUPS AZIMUTH " + width + " ";

    answer += getGroupOpenClose(ng, sg) + " ";

    answer += isEchelon(props.orientation, ngBraaseye, sgBraaseye, ng, sg)

    answer += picTrackDir(props.format, [ng,sg])

    const anchorN = isAnchorNorth(ngBraaseye, sgBraaseye, ng, sg);
   
    if (!anchorN){
        if (props.orientation === "NS"){
          answer += formatGroup("EAST", sgBraaseye, sgAlts, sg.numContacts, true, sg.trackDir);
          answer += " " + formatGroup("WEST", ngBraaseye, ngAlts, ng.numContacts, includeBull, ng.trackDir);
        } else {
          answer += formatGroup("SOUTH", sgBraaseye, sgAlts, sg.numContacts, true, sg.trackDir);
          answer += " " + formatGroup("NORTH", ngBraaseye, ngAlts, ng.numContacts, includeBull, ng.trackDir);
        }
    } else {
        if (props.orientation === "NS"){
          answer += formatGroup("WEST", ngBraaseye, ngAlts, ng.numContacts, true, ng.trackDir);
          answer += " " + formatGroup("EAST", sgBraaseye, sgAlts, sg.numContacts, includeBull, sg.trackDir);
        } else {
          answer += formatGroup("NORTH", ngBraaseye, ngAlts, ng.numContacts, true, ng.trackDir);
          answer += " " + formatGroup("SOUTH", sgBraaseye, sgAlts, sg.numContacts, includeBull, sg.trackDir);
        }
    }

    return {
        pic: answer,
        groups: [ng, sg]
    };
}

export const drawRange:DrawFunction = (
    canvas: HTMLCanvasElement, 
    context:CanvasRenderingContext2D,
    props: PicCanvasProps,
    state: PicCanvasState,
    start?:Bullseye): DrawAnswer => {
        
    const boundaries: Bounds = {
      tall:{ lowX: 0.2, hiX: 0.8, lowY: 0.4, hiY: 0.8 }, 
      wide:{ lowX:0.2, hiX: 0.6, lowY:0.2, hiY:0.8 }
    }

    const startPos = getStartPos(canvas, props.orientation, boundaries, start)
    const startX = startPos.x
    const startY = startPos.y
      
    const incr:number = canvas.width / (canvas.width / 10);
    const drawDistance:number = randomNumber(3.5 * incr, 10 * incr);
  
    let heading:number = randomHeading(props.format, state.bluePos.heading);
    const tg:Group = drawArrow(
        canvas,
        props.orientation,
        randomNumber(1, 4), 
        startX, 
        startY, 
        heading + randomNumber(-10, 10));
  
    if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.heading);
  
    let lg: Group
    let m2: Bullseye
    let offsetX = 0;
    let offsetY = 0;
    let offsetX2 = 0;
    let offsetY2 = 0;
    if (props.orientation === "NS") {
      lg =  drawArrow( canvas, props.orientation, randomNumber(1, 4), startX, startY + drawDistance, heading + randomNumber(-10,10));
      m2 = { x: tg.x, y: lg.y}
    } else {
      lg = drawArrow( canvas, props.orientation, randomNumber(1, 4), startX + drawDistance, startY, heading + randomNumber(-10,10));
      m2 = { x: lg.x, y: tg.y}
      offsetX = -10;
      offsetY = 40;
      offsetX2 = -60;
      offsetY2 = 40;
    }
  
    const range = getBR( tg.x, tg.y, m2).range
    drawMeasurement(canvas, context, tg.x, tg.y, m2.x, m2.y, range, props.showMeasurements);
  
    const tgAlts: AltStack = getAltStack(tg.z, props.format);
    const lgAlts: AltStack = getAltStack(lg.z, props.format);
  
    drawAltitudes(canvas, context, lg.x + 20 + offsetX, lg.y - 11 + offsetY, lg.z);
    drawAltitudes(canvas, context, tg.x + 20 + offsetX2, tg.y - 11 + offsetY2, tg.z);
    const lgBraaseye: Braaseye = drawBraaseye(canvas, context, state.bluePos, lg, state.bullseye, props.showMeasurements, props.braaFirst, offsetX, offsetY );
    const tgBraaseye: Braaseye = drawBraaseye(canvas, context, state.bluePos, tg, state.bullseye, props.showMeasurements, props.braaFirst, offsetX2, offsetY2);
  
    let answer: string = "TWO GROUPS RANGE " +  range + ", ";
  
    if ((props.orientation==="EW" && getBR(tg.x, tg.y, {x: tg.x, y: lg.y}).range > 5) || (props.orientation==="NS" && getBR(lg.x, tg.y, {x:tg.x, y:tg.y}).range > 5)){
      if (props.orientation==="EW"){
        answer += " ECHELON " + getTrackDir(parseInt(getBR(tg.x, tg.y, {x:lg.x, y:lg.y}).bearing))+ ", "
      } else {
        answer += " ECHELON " + getTrackDir(parseInt(getBR(lg.x, lg.y, {x:tg.x, y:tg.y}).bearing))+ ", "
      }
    }
  
    answer += picTrackDir(props.format, [tg,lg])
  
    console.log("TODO -- DETERMINE IF OPENING/CLOSING");
  
    if (tgBraaseye.braa.range < lgBraaseye.braa.range) {
      answer += formatGroup("LEAD", tgBraaseye, tgAlts, tg.numContacts, true, tg.trackDir) + " ";
      answer += formatGroup("TRAIL", lgBraaseye, lgAlts, lg.numContacts, false, lg.trackDir);
    } else {
      answer += formatGroup("LEAD", lgBraaseye, lgAlts, lg.numContacts, true, lg.trackDir) + " ";
      answer += formatGroup("TRAIL", tgBraaseye, tgAlts, tg.numContacts, false, tg.trackDir);
    }
  
    tg.label = "TRAIL GROUP";
    lg.label = "LEAD GROUP";
  
    return {
      pic: answer,
      groups: [tg, lg]
    };
}

export const drawWall: DrawFunction = (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    props: PicCanvasProps,
    state: PicCanvasState,
    start?: Bullseye|undefined ): DrawAnswer => {

    const boundaries: Bounds = {
      tall: { lowX: 0.2, hiX: 0.5, lowY: 0.4, hiY: 0.8},
      wide: { lowX: 0.2, hiX: 0.5, lowY: 0.2, hiY: 0.5}
    }

    const startPos = getStartPos(canvas, props.orientation, boundaries, start)
    const startX = startPos.x
    const startY = startPos.y

    let heading = randomHeading(props.format, state.bluePos.heading);
  
    const numGroups = randomNumber(3, 6);
  
    let totalArrowOffset = 0;
  
    const braaseyes:Braaseye[] = [];
    const altStacks:AltStack[] = [];
    const groups:Group[] = [];
    for (let x = 0; x < numGroups; x++) {
      const offsetHeading = randomNumber(-10, 10);
      const arrowOffsetY = (x === 0) ? 0 : randomNumber(40, 60);
      totalArrowOffset += arrowOffsetY;
  
      
      let altOffsetX = 30;
      let altOffsetY = 0;

      if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.heading);

      if (props.orientation==="NS"){ 
        groups.push( drawArrow(canvas, props.orientation, randomNumber(1, 5), startX + totalArrowOffset, startY, heading + offsetHeading) );
        altOffsetX = (-15*(numGroups-x));
        altOffsetY = 40 + 11*(numGroups-(numGroups-x));
      } else {
        groups.push( drawArrow(canvas, props.orientation, randomNumber(1, 5), startX, startY + totalArrowOffset, heading + offsetHeading) );
      }
  
      drawAltitudes( canvas, context, groups[x].x + 20 + altOffsetX, groups[x].y - 11 + altOffsetY, groups[x].z);
      braaseyes.push(drawBraaseye(canvas, context, state.bluePos, groups[x], state.bullseye, props.showMeasurements, props.braaFirst, altOffsetX, altOffsetY));
      altStacks.push(getAltStack(groups[x].z, props.format));
    }
  
    let width = 0;
    let nLbl = "WEST"
    let sLbl = "EAST"
    if (props.orientation === "NS"){
      width = Math.floor((groups[groups.length-1].x - groups[0].x)/4);
      drawMeasurement(canvas, context, groups[0].x, groups[0].y-25, groups[groups.length-1].x, groups[0].y - 25, width, props.showMeasurements)
    } else {
      width = Math.floor((groups[groups.length-1].y - groups[0].y)/4);
      drawMeasurement(canvas, context, groups[0].x+25, groups[0].y, groups[0].x+25, groups[groups.length-1].y, width, props.showMeasurements)
      nLbl = "NORTH";
      sLbl = "SOUTH";
    }
    
    switch (numGroups) {
      case 3:
        groups[0].label = nLbl + " GROUP";
        groups[1].label = "MIDDLE GROUP";
        groups[2].label = sLbl + " GROUP";
        break;
      case 4:
        groups[0].label = nLbl + " GROUP";
        groups[1].label = nLbl + " MIDDLE GROUP";
        groups[2].label = sLbl +" MIDDLE GROUP";
        groups[3].label = sLbl + " GROUP";
        break;
      case 5:
        groups[0].label = nLbl + " GROUP";
        groups[1].label = nLbl +" MIDDLE GROUP";
        groups[2].label = "MIDDLE GROUP";
        groups[3].label = sLbl + " MIDDLE GROUP";
        groups[4].label = sLbl + " GROUP";
        break;
    }
  
    let answer = numGroups + " GROUP WALL " + width + " WIDE, ";

    answer += picTrackDir(props.format, groups)

    const anchorNorth = isAnchorNorth(braaseyes[0], braaseyes[braaseyes.length-1], groups[0], groups[groups.length-1])
  
    console.log("DETERMINE IF WEIGHTED WALL");
    
    const includeBull = (width > 10 && props.format !== "ipe");
   
    for (let g = 0; g < numGroups; g++){
        const idx: number = anchorNorth ? g : (numGroups-1) - g
        answer += formatGroup((groups[idx].label+"").replace(/GROUP/, ""), braaseyes[idx], altStacks[idx], groups[idx].numContacts, (g===0) || (g === numGroups-1 && includeBull) || false, groups[idx].trackDir)+ " ";
    }

    return {
      pic: answer,
      groups: groups
    };
}  

export const drawLadder: DrawFunction =  (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  props: PicCanvasProps,
  state: PicCanvasState,
  start?: Bullseye|undefined ): DrawAnswer => {
  
  const boundaries:Bounds = { 
    tall: { lowX: 0.2, hiX:0.8, lowY: 0.55, hiY: 0.9 },
    wide: { lowX: 0.2, hiX: 0.4, lowY:0.3, hiY: 0.8 }
  }

  const groups:Group[] = [];
  const braaseyes: Braaseye[] = [];
  const altstacks: AltStack[] = [];

  const startPos = getStartPos(canvas, props.orientation, boundaries, start)
  const startX = startPos.x
  const startY = startPos.y

  let heading = randomHeading(props.format, state.bluePos.heading);
  const numGroups = randomNumber(3, 6);

  let totalArrowOffset = 0;

  for (let x = 0; x < numGroups; x++) {
    const offsetHeading = randomNumber(-5, 5);
    totalArrowOffset +=(x===0 ? 0 : randomNumber(30,80)); 

    heading = (!props.isHardMode) ? heading : randomHeading(props.format, state.bluePos.heading);

    let offsetX = 0;
    let offsetY = 0;
    if (props.orientation==="NS"){ 
      groups.push( drawArrow(canvas, props.orientation, randomNumber(1, 5), startX, startY - totalArrowOffset, heading + offsetHeading) );
    } else {
      groups.push( drawArrow(canvas, props.orientation, randomNumber(1, 5), startX + totalArrowOffset, startY, heading + offsetHeading) );
      offsetX = -40 + -5*(numGroups-x);
      offsetY = -20 + -11 * (numGroups-x);
    }

    drawAltitudes(canvas,context, groups[x].x+20 + offsetX, groups[x].y-11+offsetY, groups[x].z );
    braaseyes[x] = drawBraaseye(canvas, context, state.bluePos, { x: groups[x].x, y: groups[x].y}, state.bullseye, props.showMeasurements, props.braaFirst, offsetX, offsetY);
    altstacks[x] = getAltStack(groups[x].z, props.format);
  }

  let deep
  if (props.orientation === "NS"){
    deep = Math.floor(Math.abs(groups[0].y - groups[groups.length-1].y)/4)
    drawMeasurement(canvas, context, groups[0].x-30, groups[0].y, groups[0].x-30, groups[groups.length-1].y, deep, props.showMeasurements );
  } else {
    deep = Math.floor(Math.abs(groups[0].x - groups[groups.length-1].x)/4)
    drawMeasurement(canvas, context, groups[0].x, groups[0].y+40, groups[groups.length-1].x, groups[0].y+40, deep, props.showMeasurements );
  }

  switch (numGroups) {
    case 3:
      groups[0].label = "TRAIL GROUP";
      groups[1].label = "MIDDLE GROUP";
      groups[2].label = "LEAD GROUP";
      break;
    case 4:
      groups[0].label = "TRAIL GROUP";
      groups[1].label = "3RD GROUP";
      groups[2].label = "2ND GROUP";
      groups[3].label = "LEAD GROUP";
      break;
    case 5:
      groups[0].label = "TRAIL GROUP";
      groups[1].label = "4TH GROUP";
      groups[2].label = "3RD GROUP";
      groups[3].label = "2ND GROUP";
      groups[4].label = "LEAD GROUP";
      break;
  } 
  
  let answer = numGroups + " GROUP LADDER " + deep + " DEEP, ";

  answer += picTrackDir(props.format, groups)

  console.log("CHECK FOR ECHELON LADDER?");

  const rangeBack = {
    label: "SEPARATION",
    range: getBR(groups[groups.length - 1].x, groups[groups.length - 1].y, {
      x: groups[groups.length - 2].x,
      y: groups[groups.length - 2].y
    }).range
  };

  for (let g = groups.length-1; g >=0; g--){
    const label = groups[g].label!==undefined ? groups[g].label+"" : ""
    answer += formatGroup(label.replace(/GROUP/, ""), braaseyes[g], altstacks[g], groups[g].numContacts, g===groups.length-1, groups[g].trackDir, (g===groups.length-2) ? rangeBack : undefined,)+ " ";
  }

  return {
    pic: answer,
    groups: groups
  };
}

export const drawChampagne:DrawFunction =  (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  props: PicCanvasProps,
  state: PicCanvasState,
  start?: Bullseye|undefined ): DrawAnswer => {
  
  const boundaries: Bounds = {
    tall: { lowX: 0.2, hiX: 0.8, lowY: 0.5, hiY: 0.9 },
    wide: { lowX: 0.2, hiX: 0.5, lowY: 0.2, hiY: 0.8 }
  }

  const startPos = getStartPos(canvas, props.orientation, boundaries, start)
  const startX = startPos.x
  const startY = startPos.y

  const incr:number = canvas.width / (canvas.width / 10);
  const champWidth:number = randomNumber(3.5 * incr, 10 * incr);
  const champDepth:number = randomNumber(3.5 * incr, 10 * incr);

  let heading:number = randomHeading(props.format, state.bluePos.heading);
  const tg:Group = drawArrow(canvas, props.orientation, randomNumber(1, 4), startX, startY, heading + randomNumber(-10, 10));

  if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.heading);
  
  let nlg:Group
  if (props.orientation === "NS"){
    nlg = drawArrow(canvas, props.orientation, randomNumber(1, 4), startX - champWidth/2, startY - champDepth,  heading + randomNumber(-10, 10));
  } else {
    nlg = drawArrow(canvas, props.orientation, randomNumber(1, 4), startX + champDepth, startY - champWidth / 2,  heading + randomNumber(-10, 10));
  }
  
  if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.heading);
  let slg:Group
  let offsetX = 0;
  let offsetX2 = 0;
  
  let sLbl = "SOUTH";
  let nLbl = "NORTH";

  if (props.orientation === "NS"){
    slg = drawArrow(canvas, props.orientation, randomNumber(1, 4), startX + champWidth/2, startY - champDepth, heading + randomNumber(-10, 10));
    offsetX2 = -70;    
    sLbl = "EAST";
    nLbl = "WEST";
  } else {
    slg = drawArrow(canvas, props.orientation, randomNumber(1, 4), startX + champDepth, startY + champWidth / 2, heading + randomNumber(-10, 10)); 
    offsetX = -70;
  }
  
  let realDepth, realWidth
  if (props.orientation === "EW"){
    realWidth = getBR(nlg.x, slg.y, {x:nlg.x, y:nlg.y}).range
    realDepth = getBR(tg.x, tg.y, {x:nlg.x, y:tg.y}).range
    drawMeasurement(canvas, context, nlg.x, slg.y, nlg.x, nlg.y, realWidth, props.showMeasurements);
    drawMeasurement(canvas, context, tg.x, tg.y, nlg.x, tg.y, realDepth, props.showMeasurements);
  } else {
    realWidth = getBR(nlg.x, nlg.y, {x:slg.x, y:nlg.y}).range
    realDepth = getBR(tg.x, tg.y, {x:tg.x, y:nlg.y}).range
    drawMeasurement(canvas, context, nlg.x, nlg.y, slg.x, nlg.y, realWidth, props.showMeasurements);
    drawMeasurement(canvas, context, tg.x, tg.y, tg.x, nlg.y, realDepth, props.showMeasurements);  
  }

  drawAltitudes(canvas, context, tg.x +20 + offsetX, tg.y - 11, tg.z);
  drawAltitudes(canvas, context, slg.x + 20, slg.y - 11, slg.z);
  drawAltitudes(canvas, context, nlg.x + 20 + offsetX2, nlg.y - 11, nlg.z);
  
  const tgBraaseye:Braaseye = drawBraaseye(canvas, context, state.bluePos, tg, state.bullseye, props.showMeasurements, props.braaFirst, offsetX);
  const nlgBraaseye:Braaseye = drawBraaseye(canvas, context, state.bluePos, nlg, state.bullseye, props.showMeasurements, props.braaFirst, offsetX2);
  const slgBraaseye:Braaseye = drawBraaseye(canvas, context, state.bluePos, slg, state.bullseye, props.showMeasurements, props.braaFirst);

  const tgAlts:AltStack = getAltStack(tg.z, props.format);
  const nlgAlts:AltStack = getAltStack(nlg.z, props.format);
  const slgAlts:AltStack = getAltStack(slg.z, props.format);

  let answer = "THREE GROUP CHAMPAGNE " +realWidth +" WIDE, " +realDepth +" DEEP, ";
 
  // determine if weighted
  if (getBR(nlg.x, nlg.y, {x:nlg.x, y:tg.y}).range < realWidth/3){
    answer += " WEIGHTED " + nLbl + ", ";
  } else if (getBR(slg.x, slg.y, {x:slg.x, y:tg.y}).range < realWidth/3){
    answer += " WEIGHTED " + sLbl + ", ";
  }
  
  answer += picTrackDir(props.format, [nlg, slg, tg])

  const includeBull = (realWidth >= 10 && props.format !=="ipe");

  // TODO -- anchoring priorities for LE of champagne
  const anchorN = isAnchorNorth(nlgBraaseye, slgBraaseye, nlg, slg)
  if (anchorN) {
    answer += formatGroup(nLbl +" LEAD", nlgBraaseye, nlgAlts, nlg.numContacts, true, nlg.trackDir) + " ";
    answer +=  formatGroup(sLbl +" LEAD",  slgBraaseye,  slgAlts,  slg.numContacts,  includeBull, slg.trackDir ) + " ";
  } else {
    answer += formatGroup(sLbl +" LEAD", slgBraaseye, slgAlts, slg.numContacts, true, slg.trackDir) + " ";
    answer += formatGroup(nLbl + " LEAD", nlgBraaseye,  nlgAlts,  nlg.numContacts,  includeBull, nlg.trackDir ) + " ";
  }
  answer += formatGroup("TRAIL", tgBraaseye, tgAlts, tg.numContacts, false, tg.trackDir);

  tg.label = "TRAIL GROUP";
  nlg.label = nLbl + " LEAD GROUP";
  slg.label = sLbl +" LEAD GROUP";

  return {
    pic: answer,
    groups: [tg, nlg, slg]
  };
}

export const drawVic:DrawFunction =  (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  props: PicCanvasProps,
  state: PicCanvasState,
  start?: Bullseye|undefined ): DrawAnswer => {

  const boundaries: Bounds = {
    tall: { lowX: 0.2, hiX: 0.8, lowY: 0.4, hiY: 0.9 }, 
    wide: { lowX: 0.3, hiX: 0.6, lowY: 0.2, hiY: 0.8 }
  }
  const startPos = getStartPos(canvas, props.orientation, boundaries, start)
  const startX = startPos.x
  const startY = startPos.y
 
  const incr: number = canvas.width / (canvas.width / 10);
  const vicWidth: number = randomNumber(3.5 * incr, 10 * incr);
  const vicDepth: number = randomNumber(3.5 * incr, 10 * incr);

  let heading:number = randomHeading(props.format, state.bluePos.heading);
  const lg:Group = drawArrow(canvas, props.orientation, randomNumber(1, 4), startX, startY, heading + randomNumber(-10, 10));

  if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.heading);
  let stg:Group
  if (props.orientation==="NS"){
    stg = drawArrow(canvas, props.orientation, randomNumber(1, 4), startX + vicWidth/2, startY + vicDepth, heading + randomNumber(-10, 10));
  } else {
    stg = drawArrow(canvas, props.orientation, randomNumber(1, 4), startX - vicDepth, startY + vicWidth / 2, heading + randomNumber(-10, 10));
  }

  if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.heading);
  let ntg:Group
  let offsetX = 0;
  let nLbl = "NORTH";
  let sLbl = "SOUTH";
  if (props.orientation==="NS"){
    ntg = drawArrow(canvas, props.orientation, randomNumber(1, 4), startX - vicWidth/2, startY +vicDepth, heading + randomNumber(-10, 10));
    offsetX = -70;
    nLbl = "WEST";
    sLbl = "EAST";
  } else {
    ntg = drawArrow(canvas, props.orientation, randomNumber(1, 4), startX - vicDepth, startY - vicWidth / 2, heading + randomNumber(-10, 10));
  }

  let realDepth, realWidth
  if (props.orientation === "NS"){
    realDepth = getBR(lg.x,lg.y, {x:lg.x, y:stg.y}).range
    realWidth = getBR(stg.x, stg.y, {x: ntg.x, y:stg.y}).range
    drawMeasurement(canvas, context, lg.x, lg.y, lg.x, stg.y, realDepth, props.showMeasurements);
    drawMeasurement(canvas, context, stg.x, stg.y, ntg.x, stg.y, realWidth, props.showMeasurements);
  } else {
    realDepth = getBR(lg.x,lg.y, {x:stg.x, y:lg.y}).range
    realWidth = getBR(stg.x, stg.y, {x:stg.x, y:ntg.y}).range
    drawMeasurement(canvas, context, lg.x, lg.y, stg.x, lg.y, realDepth, props.showMeasurements)
    drawMeasurement(canvas, context, stg.x, stg.y, stg.x, ntg.y, realWidth, props.showMeasurements);
  }

  drawAltitudes(canvas, context, lg.x + 20, lg.y - 11, lg.z);
  drawAltitudes(canvas, context, stg.x + 20, stg.y - 11, stg.z);
  drawAltitudes(canvas, context, ntg.x + offsetX + 20, ntg.y - 11, ntg.z);

  const lgBraaseye:Braaseye = drawBraaseye(canvas, context, state.bluePos, lg, state.bullseye, props.showMeasurements, props.braaFirst);
  const stgBraaseye:Braaseye = drawBraaseye(canvas, context, state.bluePos, stg, state.bullseye, props.showMeasurements, props.braaFirst);
  const ntgBraaseye:Braaseye = drawBraaseye(canvas, context, state.bluePos, ntg, state.bullseye, props.showMeasurements, props.braaFirst, offsetX);

  const lgAlts:AltStack = getAltStack(lg.z, props.format);
  const stgAlts:AltStack = getAltStack(stg.z, props.format);
  const ntgAlts:AltStack = getAltStack(ntg.z, props.format);

  let answer = "THREE GROUP VIC " + realDepth + " DEEP, " + realWidth + " WIDE, ";

  if (getBR(lg.x, lg.y, {x:lg.x, y:ntg.y}).range < realWidth/3){
    answer += " WEIGHTED " + nLbl +", ";
  }
  else if (getBR(lg.x, lg.y, {x:lg.x, y:stg.y}).range < realWidth/3){
    answer += " WEIGHTED " + sLbl +", ";
  }

  console.log("DETERMINE IF OPENING/CLOSING -- EWI/SPEED TG");

  answer += picTrackDir(props.format, [ntg, stg, lg])
  
  answer += formatGroup("LEAD", lgBraaseye, lgAlts, lg.numContacts, true, lg.trackDir) + " ";

  const anchorN = isAnchorNorth(ntgBraaseye, stgBraaseye, ntg, stg)
  
  if (anchorN) {
    answer += formatGroup( nLbl+" TRAIL", ntgBraaseye, ntgAlts, ntg.numContacts, false, ntg.trackDir) + " ";
    answer += formatGroup( sLbl +" TRAIL", stgBraaseye, stgAlts, stg.numContacts, false, stg.trackDir);
  } else {
    answer += formatGroup( sLbl +" TRAIL", stgBraaseye, stgAlts, stg.numContacts, false, stg.trackDir) + " ";
    answer += formatGroup( nLbl + " TRAIL", ntgBraaseye, ntgAlts, ntg.numContacts, false, ntg.trackDir);
  }

  lg.label = "LEAD GROUP";
  stg.label = sLbl +" TRAIL GROUP";
  ntg.label = nLbl + " TRAIL GROUP";

  return {
    pic: answer,
    groups: [lg, stg, ntg]
  };
}

export const drawLeadEdge:DrawFunction = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  props: PicCanvasProps,
  state: PicCanvasState,
  start?: Bullseye|undefined ): DrawAnswer => {

  const boundaries: Bounds = {
    tall: { lowX: 0.2, hiX: 0.8, lowY: 0.3, hiY: 0.5 },
    wide: { lowX: 0.5, hiX: 0.6, lowY: 0.42, hiY: 0.5 }
  }

  const startPos = getStartPos(canvas, props.orientation, boundaries, start)
  const startX1 = startPos.x
  const startY1 = startPos.y
  const start1 = { x: startX1, y: startY1};
  let finalAnswer: DrawAnswer = {
    pic:"", groups:[]
  }
  const answer1 = state.reDraw(canvas, context, true, start1)
   
  const boundaries2: Bounds = {
    tall: { lowX: 0.2, hiX: 0.8, lowY: 0.8, hiY: 0.9 },
    wide: { lowX: 0.15, hiX: 0.25, lowY: 0.25, hiY: 0.29 }
  }

  const startPos2 = getStartPos(canvas, props.orientation, boundaries2, start)
  const startX2 = startPos2.x
  const startY2 = startPos2.y
  const start2 = { x: startX2, y: startY2};
  const answer2 = state.reDraw(canvas, context, true, start2)
  
  if (!state.bluePos) { return { pic: "", groups: []} }
  const groups1 = answer1.groups;
  const groups2 = answer2.groups;

  const followFunc = (props.orientation === "NS") ? Math.min : Math.max
  const leadFunc = (props.orientation === "NS") ? Math.max : Math.min
  const closestFollow = followFunc(...groups2.map(function(o:Group) { return props.orientation==="NS" ? o.y : o.x;})); 
  const closestLead = leadFunc(...groups1.map(function(o:Group) { return props.orientation==="NS" ? o.y : o.x;}));

  let rngBack;
  
  if (props.orientation==="EW") {
    rngBack = getBR(closestFollow, groups1[0].startY, { x: closestLead, y: groups1[0].startY });
  } else {
    rngBack = getBR(groups1[0].startX, closestLead, {
      x: groups1[0].startX,
      y: closestFollow
    });
  }

  let overlap = false
  if (props.orientation === "EW"){
    overlap = closestFollow > closestLead
  } else {
    overlap = closestLead > closestFollow
  }

  if (overlap || rngBack.range <=5 || rngBack.range >= 40){
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBullseye(canvas, context, state.bullseye);
    drawArrow(canvas, props.orientation, 4, state.bluePos.startX, state.bluePos.startY, (props.orientation==="NS" ? 180 : 270), "blue");
    finalAnswer = drawLeadEdge(canvas, context, props, state, start);
  }
  else {
    finalAnswer=  {
      pic:
        (groups1.length +groups2.length) +
        " GROUPS, LEADING EDGE " +
        answer1.pic +
        " FOLLOW ON " + (props.format ==="ipe" ? " GROUPS " : "") +
        (rngBack.range > 40 ? " 40 " : rngBack.range) +
        (props.format==="ipe" ? " MILES" : ""),
      groups: groups1.concat(groups2)
    };
  }
  
  return finalAnswer;
}

const getPicBull = (isRange:boolean, orientation:string, bluePos:Group, groups:Group[]): Bullseye => {
  let closestGroup = groups[0]

  let closestRng = 9999
  let sum = 0
  for ( let x = 0; x < groups.length; x++){
    const BRAA = getBR(groups[x].x, groups[x].y, { x: bluePos.x, y:bluePos.y})
    if (BRAA.range < closestRng ) {
      closestGroup = groups[x]
      closestRng = BRAA.range
    }

    if (orientation === "NS"){
      sum += groups[x].x
    } else {
      sum += groups[x].y
    }
  }

  let retVal = {
    x: sum/groups.length,
    y: closestGroup.y
  }
  if ((orientation === "EW" && !isRange) || (orientation === "NS" && isRange)){
    retVal = {
      x: closestGroup.x,
      y: sum/groups.length
    }
  }
  return retVal
}

export const drawPackage:DrawFunction = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  props: PicCanvasProps,
  state: PicCanvasState,
  start?: Bullseye|undefined ): DrawAnswer => {

  //const isRange = randomNumber(0,120) < 50
  const isRange = false

  let startX1:number, startX2:number, startY1:number, startY2:number
  let lLbl = "EAST"
  let tLbl = "WEST"
  
  if (props.orientation==="EW"){
    if (isRange){
      startX1 = randomNumber(canvas.width* 0.5, canvas.width*0.59);
      startX2 = randomNumber(canvas.width * 0.2, canvas.width*0.35);
      startY1 = randomNumber(canvas.height* 0.2, canvas.width*0.4);
      startY2 = startY1;
    } else {
      tLbl = "NORTH"
      lLbl = "SOUTH"
      startX1 =  randomNumber(canvas.width * 0.25, canvas.width * 0.5);
      startX2 = startX1;
      startY1 =  randomNumber(canvas.height * 0.60, canvas.height * 0.70);
      startY2 =  randomNumber(canvas.height * 0.25, canvas.height * 0.40);
    }
  } else {
    if (isRange){
      lLbl = "NORTH"
      tLbl = "SOUTH"
      startX1 = randomNumber(canvas.width * 0.2, canvas.width * 0.8);
      startX2 = startX1;
      startY1 = randomNumber(canvas.height*0.5, canvas.height *0.59);
      startY2 = randomNumber(canvas.height * 0.70, canvas.height *0.8);
    } else {
      startX1 = randomNumber(canvas.width * 0.2, canvas.width*0.3);
      startX2 = randomNumber(canvas.width * 0.7, canvas.width*0.8);
      startY1 = randomNumber(canvas.height * 0.5, canvas.height*0.80);
      startY2 = startY1;
    }
  }

  let finalAnswer: DrawAnswer = { pic: "", groups: []}
  const answer1 = state.reDraw(canvas, context, true, {x:startX1, y:startY1})
  const answer2 = state.reDraw(canvas,context, true, {x:startX2, y:startY2})
  if (!state.bluePos) { return { pic: "", groups: []} }
  const groups1: Group[] = answer1.groups;
  const groups2: Group[] = answer2.groups;
  
  const bull1 = getPicBull(isRange, props.orientation, state.bluePos, groups1)
  const bull2 = getPicBull(isRange, props.orientation, state.bluePos, groups2)
  
  const leadPackage = getBR(bull1.x, bull1.y, state.bullseye);
  const trailPackage = getBR(bull2.x, bull2.y, state.bullseye);

  const realAnswer: DrawAnswer = {
    pic: "",
    groups: groups1.concat(groups2)
  }

  if ( isRange ){
    const rngBack = props.orientation === "NS" ? getBR(bull1.x, bull1.y, {x: bull1.x, y: bull2.y}) : getBR(bull1.x, bull1.y, {x: bull2.x, y: bull1.y}); 
    if (rngBack.range < 40 ){
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawBullseye(canvas, context, state.bullseye);
      drawArrow(canvas, props.orientation, 4, state.bluePos.x, state.bluePos.y, (props.orientation==="NS"? 180 : 270), "blue");
      finalAnswer = drawPackage(canvas, context, props, state, start);
    } else {
      realAnswer.pic = " 2 PACKAGES RANGE " + rngBack.range + " "+ 
          lLbl + " PACKAGE BULLSEYE " + leadPackage.bearing + "/" + leadPackage.range + " " +
          tLbl + " PACKAGE BULLSEYE " + trailPackage.bearing + "/" + trailPackage.range;
      finalAnswer = realAnswer
    }
  }
  else {
    const rngBack = props.orientation==="NS" ? getBR(bull1.x, bull1.y, {x: bull2.x, y: bull1.y}) : getBR(bull1.x, bull1.y, {x: bull1.x, y: bull2.y}); 
    if (rngBack.range < 40) { 
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawBullseye(canvas, context, state.bullseye);
      drawArrow(canvas, props.orientation, 4, state.bluePos.startX, state.bluePos.startY, (props.orientation==="NS") ? 180 : 270, "blue");
      finalAnswer= drawPackage(canvas, context, props, state, start);
    } else {
      realAnswer.pic = " 2 PACKAGES AZIMUTH " + rngBack.range + " " +
          tLbl + " PACKAGE BULLSEYE " + trailPackage.bearing + "/" + trailPackage.range + " "+
          lLbl +" PACKAGE BULLSEYE " + leadPackage.bearing + "/" + leadPackage.range;
      finalAnswer = realAnswer
    }
  }
  return finalAnswer
}