import { getBR, randomNumber, toRadians } from "../../../utils/mathutilities";
import { BRAA, Group } from "../../../utils/interfaces";
import { PicCanvasProps, PicCanvasState } from "../../picturecanvas";
import { drawAltitudes, drawArrow, drawBraaseye, headingToDeg } from "../drawutils";

let continueAnimation = false;
let pauseShowMeasure = true
  
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
  
export function pauseFight(showMeasure: boolean): void {
    pauseShowMeasure = showMeasure;
    setContinueAnimate(false);
}
  
function isNearBounds(canvas:HTMLCanvasElement, group:Group){
  const buffer = 40
  return group.startX < buffer || group.startX > canvas.width-buffer || group.startY < buffer || group.startY > canvas.height-buffer
}

// eslint-disable-next-line complexity
function doAnimation(
    canvas: HTMLCanvasElement,
    props: PicCanvasProps,
    state: PicCanvasState,
    groups:Group[],
    animateCanvas: ImageData,
    resetCallback: (showMeasure:boolean)=>void):void {

    const context = canvas.getContext("2d");

    if (!context || !state.bluePos) return 
    
    context.putImageData(animateCanvas, 0, 0);

    let br: BRAA
    for (let x = 0; x < groups.length; x++) {
      
      drawArrow(canvas,props.orientation, groups[x].numContacts, groups[x].startX, groups[x].startY, groups[x].heading );
  
      const xyDeg = headingToDeg(groups[x].heading).degrees
      const rads: number = toRadians(xyDeg);
      const offsetX: number = 7 * Math.cos(rads);
      const offsetY: number = -7 * Math.sin(rads);
  
      // TODO - better handling for running into walls
      // should readjust heading to be towards blue air
      // if (isNearBounds(canvas, groups[x])){
      //   // offsetX = 0
      //   // offsetY = 0
        
      //   groups[x].desiredHeading = parseInt(getBR(state.bluePos.x, state.bluePos.y, {x:groups[x].startX, y: groups[x].startY}).bearing)
      // }

      groups[x].startX = groups[x].startX + offsetX;
      groups[x].startY = groups[x].startY + offsetY;

      if (!groups[x].maneuvers || isNearBounds(canvas, groups[x]))
        groups[x].desiredHeading = parseInt(getBR(state.bluePos.x, state.bluePos.y, {x:groups[x].startX, y: groups[x].startY}).bearing)
      
      let deltaA: number

      const LH = (groups[x].heading - groups[x].desiredHeading + 360) % 360
      const RH = (groups[x].desiredHeading - groups[x].heading + 360) % 360
      
      if (LH < RH) {
        deltaA = -LH
      } else {
        deltaA = RH
      }

      let divisor = 7
      const absDelt = Math.abs(deltaA)
      if (absDelt > 90 ){
        divisor = 15
      } else if (absDelt < 7 ) {
        divisor = 1
      }
      const newHeading = groups[x].heading + deltaA / divisor
      groups[x].heading = newHeading 

      if (groups[x].maneuvers) {
        br = getBR(state.bluePos.x, state.bluePos.y, { x: groups[x].startX, y: groups[x].startY});
  
        if (br.range < 70 && !groups[x].maneuvered) {
          console.log("maneuver")
          groups[x].desiredHeading = randomNumber(45,330)
          groups[x].maneuvered = true
          // TODO - set maneuver comm in answer DIV (initial detect)
        } 

        // TODO - once established on heading, 
        // var aspectH = ;
        // var mxUpdate = groups[x].label + " MANEUVER, " + 
        //                getAspect(state.bluePos, groups[x]) + " " +
        //                getTrackDir(groups[x].heading);
      }
    }

    groups.forEach((grp) => {
      if (getBR(state.bluePos.x, state.bluePos.y, {x:grp.startX, y:grp.startY}).range < 30 ){
        continueAnimation = false
        resetCallback(true)
      }
    })
  
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
    } else {
    //   var mxCommDiv = document.getElementById("maneuverComm");
  
      let closest: BRAA = { bearing: "90", range: 1000 };
    //   var closestGrp: Group = groups[0];
  
      for (let y = 0; y < groups.length; y++) {
        if (pauseShowMeasure) {
          drawBraaseye(
            canvas,
            context,
            state.bluePos,
            { x: groups[y].startX, y: groups[y].startY },
            state.bullseye,
            true,
            props.braaFirst
          );
        }
  
        drawAltitudes(canvas, context, groups[y].startX + 20, groups[y].startY - 11, groups[y].z);
  
        br = getBR(groups[y].startX, groups[y].startY, {
          x: state.bluePos.x,
          y: state.bluePos.y
        });
        if (br.range < closest.range) {
          closest = br;
        //   closestGrp = groups[y];
        }
      }
  
      if (closest.range < 40) {
        // var altStack: AltStack = getAltStack(closestGrp.z, props.format);
        // mxCommDiv.innerHTML =
        //   mxCommDiv.innerHTML +
        //   "<br/> THREAT BRAA " +
        //   closest.bearing +
        //   "/" +
        //   closest.range +
        //   " " +
        //   altStack.stack +
        //   " HOT, HOSTILE " +
        //   altStack.fillIns;
      }
    }
}

export function animateGroups(
  canvas: HTMLCanvasElement,
  props: PicCanvasProps, 
  state: PicCanvasState,
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
  
  