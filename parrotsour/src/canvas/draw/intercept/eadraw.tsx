import { getAltStack, getAspect, getBR, randomNumber } from "../../../utils/mathutilities";
import { AltStack, BRAA, Bullseye, DrawAnswer, DrawFunction, Group } from "../../../utils/interfaces";
import { PicCanvasProps, PicCanvasState } from "./picturecanvas";
import { drawText } from "../drawutils";
import { formatBRAA, formatMusic, formatStrobe } from "../formatutils";

/**
 * Process groups from picture to determine:
 * which group is closest? and whats the B/R?
 * which group are we querying for EA from?
 * which (random) group will we use if we don't use closest?
 * @param groups 
 * @param bluePos 
 */
function getEAInfo(groups: Group[], bluePos: Group): 
    {closestGrp:Group, closestBraa:BRAA,
     query:string, strBR:BRAA, grp:Group} 
{
  // find the closest group
  let closestGrp:Group = groups[0];
  let closestRng = 9999;
  let closestBraa:BRAA = {bearing:"000", range:0};
  for (let x = 0; x < groups.length; x++){
    const braa = getBR(groups[x].x, groups[x].y, bluePos)
    if(braa.range < closestRng){
      closestBraa = braa
      closestRng = braa.range
      closestGrp = groups[x];
    }
  }

  // pick a random group if not using closest (i.e. not a BRAA request)
  const grp:Group = groups[randomNumber(0, groups.length)];
  const strBR = getBR(grp.x, grp.y, bluePos)
  let query = strBR.bearing // TODO -- potential to add +/- offset
  if (randomNumber(1,100) <= 50 && grp.label !== undefined){
      query = grp.label
  }

  return {
    closestBraa,
    closestGrp,
    query,
    strBR,
    grp
  }

}

export const drawEA:DrawFunction = (
        canvas: HTMLCanvasElement,
        ctx:CanvasRenderingContext2D,
        props: PicCanvasProps,
        state: PicCanvasState,
        start?: Bullseye):DrawAnswer => {

    // if x and y can't be undefined.... then TODO - verify this
    if (start === undefined){
      start = {
         x: randomNumber(canvas.width * 0.6, canvas.width * 0.65),
         y: randomNumber(canvas.width * 0.2, canvas.height * 0.8)
      }
    } else if (start.x === undefined){
      start.x = randomNumber(canvas.width * 0.6, canvas.width * 0.65)
    }
    const answer = state.reDraw(canvas, ctx,true,start)
    if (!state.bluePos) { return { pic: "", groups: []} }

    let finalAnswer:DrawAnswer = {pic:"", groups:[]}
    let response = "RESPONSE";
  
    // get closest group, random group, and query string for EA formatting
    const eaInfo = getEAInfo(answer.groups, state.bluePos)
    const grp = eaInfo.grp
    const closestGrp = eaInfo.closestGrp
    const query = eaInfo.query
    const closestBraa = eaInfo.closestBraa
    const strBR = eaInfo.strBR

    let altStack:AltStack= getAltStack(grp.z, props.format)
    let aspectH:string
    let bull: BRAA

    switch (randomNumber(0,3)) {
      case 0:
        drawText(canvas, ctx, '"EAGLE01, BOGEY DOPE NEAREST GRP"', canvas.width/2, 20);
        altStack = getAltStack(closestGrp.z, props.format);
        aspectH = getAspect(state.bluePos,closestGrp);
        response = formatBRAA(closestGrp.label ? closestGrp.label : "GROUP", closestBraa, altStack, closestGrp.numContacts, closestGrp.heading, aspectH)
        break;
      case 1: 
        drawText(canvas, ctx, '"EAGLE01 STROBE ' + query + '"', canvas.width/2, 20)
        aspectH = getAspect(state.bluePos, grp);
        response = formatStrobe(strBR, altStack, grp.heading, aspectH, grp.label ? grp.label : "GROUP")
        break;
      default: 
        drawText(canvas, ctx, '"EAGLE01 MUSIC ' + grp.label+ '"', canvas.width/2, 20)
        bull = getBR(grp.x, grp.y, state.bullseye)
        response = formatMusic(grp, bull, altStack, props.format)
        break;
    }
    finalAnswer= {
      pic: response,
      groups: answer.groups
    };
    return finalAnswer
 }