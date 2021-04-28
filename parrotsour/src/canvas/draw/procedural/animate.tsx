import { getBR, randomNumber, toRadians } from "../../../utils/mathutilities";
import { Group } from "../../../utils/interfaces";
import { drawAltitudes, drawArrow, drawGroupCap, drawText } from "../drawutils";
import snackbar from "utils/alert";
import { convertToXY } from "procedural/prochelpers";
import { ProcCanvasProps, ProcCanvasState } from "canvas/draw/procedural/proceduralcanvas";

let continueAnimation = false;
  
function sleep(milliseconds: number):void {
    const start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
      if (new Date().getTime() - start > milliseconds) {
        break;
      }
    }
}

export function getContinueAnimate(): boolean{
  return continueAnimation
}
  
function setContinueAnimate(val: boolean) {
    continueAnimation = val;
}
  
export function pauseFight(): void {
    setContinueAnimate(false);
}

function doAnimation(
    canvas: HTMLCanvasElement,
    props: ProcCanvasProps,
    state: ProcCanvasState,
    groups:Group[],
    animateCanvas: ImageData,
    resetCallback: (showMeasure:boolean)=>void):void {

    const context = canvas.getContext("2d");

    if (!context || !state.bluePos) return 
    
    context.putImageData(animateCanvas, 0, 0);

    for (let x = 0; x < groups.length; x++) {

      for (let y =0; y< groups.length; y++){
        if (groups[x].callsign !== groups[y].callsign && groups[x].z[0] === groups[y].z[0] && getBR(groups[x].startX, groups[x].startY, {x:groups[y].startX, y:groups[y].startY}).range <= 20){
          snackbar.alert(groups[x].callsign + " is co-alt with " + groups[y].callsign + "!", undefined, "#FA5D5D")
        }
      }
      let atFinalDest = false;
      if ( groups[x].desiredLoc !== undefined){
        atFinalDest = groups[x].desiredLoc?.length ===0;
        if (!atFinalDest){
          const firstLoc = groups[x].desiredLoc?.slice(0,1)[0]
          if (firstLoc){
            const reachedDestX = Math.abs(firstLoc.x - groups[x].startX) < 10;
            const reachedDestY = Math.abs(firstLoc.y - groups[x].startY) < 10;
          
            const atDest = reachedDestX && reachedDestY;
            if (atDest) {groups[x].desiredLoc = groups[x].desiredLoc?.slice(1)}
            atFinalDest = groups[x].desiredLoc?.length ===0;
            if (!atFinalDest) {
              groups[x].desiredHeading = parseInt(getBR(firstLoc.x, firstLoc.y, {x:groups[x].startX, y:groups[x].startY}).bearing);
            } else {
              groups[x].isCapping = true;
              atFinalDest = true;
            }
          }
        }
      }
  
      if (groups[x].request !== undefined){
        groups[x].successAsReq = false;
        groups[x].successAltReq = false;
        if (groups[x].request && groups[x].request?.airspace){
          const desiredLoc = convertToXY(groups[x].request?.airspace)
          const rngToDes = getBR(groups[x].startX, groups[x].startY, desiredLoc).range
          if (atFinalDest && rngToDes < 10){
            groups[x].successAsReq = true;
          }
        } else {
          groups[x].successAsReq = true;
        }

        if(groups[x].request?.alt){
          if(groups[x].z[0] === groups[x].request?.alt || groups[x].z[0] === groups[x].request?.alt){
            groups[x].successAltReq = true;
          }
        } else {
          groups[x].successAltReq = true;
        }

        if (groups[x].successAsReq && groups[x].successAltReq) {
          snackbar.alert("Processed request for " + groups[x].callsign, 3000);
          groups[x].request= undefined;
        }
      }
      
      const atDesiredAlt = groups[x].desiredAlt===undefined || (groups[x].z[0] === groups[x].desiredAlt);
      if (!atDesiredAlt){
        if ((groups[x].desiredAlt||groups[x].z) > groups[x].z[0]){
          groups[x].z[0] += 0.5;
        } else{
          groups[x].z[0] -= 0.5;
        }
      }
  
      if (!groups[x].isCapping && !atFinalDest){
        drawArrow(canvas, props.orientation, groups[x].numContacts, groups[x].startX, groups[x].startY, groups[x].heading, props.dataStyle, "blue", groups[x].type, groups[x].radarPoints, groups[x].iffPoints)
        
        let xyDeg = groups[x].heading - 90;
        if (xyDeg < 0) xyDeg += 360;
    
        const rads = toRadians(xyDeg);
    
        const offsetX = 7 * Math.cos(rads);
        const offsetY = 7 * Math.sin(rads);
    
        groups[x].startX = groups[x].startX + offsetX;
        groups[x].startY = groups[x].startY + offsetY;


        const firstLoc = groups[x].desiredLoc?.slice(0,1)[0]

        let newHeading = groups[x].heading
        if( firstLoc){
          newHeading = parseInt(getBR(firstLoc.x, firstLoc.y, {x:groups[x].startX, y:groups[x].startY}).bearing);
        }
        
        let leftDir = groups[x].heading - newHeading;
        let rightDir = newHeading -groups[x].heading;
        if (leftDir < 0) leftDir += 360;
        if (rightDir < 0) rightDir += 360;
        
        const deltaA = (leftDir < rightDir) ? -leftDir : rightDir;
        
        groups[x].desiredHeading= newHeading;
    
        let offset = 0;
        if (Math.abs(deltaA) > 10) {
          offset = deltaA / 5;
          newHeading = groups[x].heading + offset;
        } else {
          newHeading = groups[x].desiredHeading;
        }
    
        groups[x].heading = newHeading;
      } else {
        drawGroupCap(canvas, props.orientation, groups[x].numContacts, groups[x].startX, groups[x].startY, "blue", groups[x].type)
      }  
      drawText(canvas, context, groups[x].callsign||"", groups[x].startX-10, groups[x].startY+20, 12)
    }
  
    if (continueAnimation) {
      const slider:HTMLInputElement = document.getElementById("speedSlider") as HTMLInputElement
      if (slider && slider.value){
        sleep(500 * ((100-parseInt(slider.value))/100));
      } else {
        sleep(500 * ((100-props.sliderSpeed)/100));
      }
  
      const animate = function() {
        doAnimation(canvas, props, state, groups, animateCanvas, resetCallback);
      };
      window.requestAnimationFrame(animate);
  
      for (let y =0 ; y < groups.length; y++){
        drawAltitudes(canvas, context, groups[y].startX + 20, groups[y].startY - 11, groups[y].z);
      }
    }
}

export function animateGroups(
  canvas: HTMLCanvasElement,
  props: ProcCanvasProps, 
  state: ProcCanvasState,
  groups: Group[],
  animateCanvas: ImageData,
  resetCallback: (showMeasure:boolean)=>void):void {
  for (let x = 0; x < groups.length; x++) {
    if (randomNumber(0, 10) <= 2) {
      groups[x].maneuvers = true;
    }
    const BRAA = getBR(state.bluePos.x, state.bluePos.y, {x:groups[x].x, y:groups[x].y})
    groups[x].desiredHeading = parseInt(BRAA.bearing)
  }
  continueAnimation = true;
  doAnimation(canvas, props, state, groups, animateCanvas, resetCallback);
}
  