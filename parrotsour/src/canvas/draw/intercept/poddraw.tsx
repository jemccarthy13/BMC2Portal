import { getAltStack, getTrackDir, randomHeading, randomNumber } from "../../../utils/mathutilities";
import { DrawAnswer, DrawFunction, Group } from "../../../utils/interfaces";
import { PicCanvasProps, PicCanvasState } from "./picturecanvas";
import { drawAltitudes, drawArrow, drawBraaseye, drawText } from "../drawutils";
import { formatGroup } from "../formatutils";

export const drawPOD:DrawFunction = (
    canvas: HTMLCanvasElement,
    ctx:CanvasRenderingContext2D,
    props: PicCanvasProps,
    state: PicCanvasState):DrawAnswer => {

    if (!state.bluePos) { return { pic: "", groups: []} }   
    const numGrps: number = randomNumber(5,11);
    
    drawText(canvas, ctx, '"DARKSTAR, EAGLE01, PICTURE"',state.bluePos.x-200, 20);
    
    let groups:Group[] = [];
    for (let x = 0; x <= numGrps; x++){
      groups.push( drawArrow(
        canvas,
        props.orientation,
        randomNumber(1, 5),
        randomNumber(canvas.width *0.2, canvas.width*0.75),
        randomNumber(canvas.height * 0.2, canvas.height*0.8),
        randomHeading(props.isHardMode?"alsa":"ipe", state.bluePos.heading) + randomNumber(-10,10),
        props.dataStyle
      ));
  
      drawAltitudes(
        canvas, ctx,
        groups[x].x+20,
        groups[x].y-10,
        groups[x].z
      );
      groups[x].braaseye = (
        drawBraaseye(canvas, ctx,
          state.bluePos,
          { x: groups[x].x, y: groups[x].y},
          state.bullseye,
          props.showMeasurements,
          props.braaFirst
        )
      );
    }
    function sortFun(a:Group,b:Group) {
      if (a.braaseye && b.braaseye){
        return (a.braaseye.braa.range > b.braaseye.braa.range) ?1 : -1;
      } else {
          return 1
      }
    }
    groups = groups.sort(sortFun)
    
    let response = groups.length + " GROUPS, " 
    for (let z = 0; z < 3; z++){
      response += formatGroup("", groups[z].braaseye || { braa:{ bearing: "000", range:0}, bull: {bearing:"000", range:0}}, getAltStack(groups[z].z, props.format), groups[z].numContacts, true, getTrackDir(groups[z].heading)) + " ";
    }
  
    return { 
      pic:response, 
      groups: groups 
    };
  }