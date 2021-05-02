// Interfaces
import { AircraftGroup } from "classes/groups/group";
import { PictureAnswer, PictureDrawFunction, PictureCanvasProps, PictureCanvasState } from "canvas/canvastypes";

// Functions
import { Bounds, drawAltitudes, drawLine, drawText } from "../drawutils";
import { formatGroup } from "../formatutils";
import { GroupFactory } from "classes/groups/groupfactory";
import { Braaseye } from "classes/braaseye";
import { randomNumber } from "utils/psmath";

export const drawPOD:PictureDrawFunction = (
    ctx:CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState):PictureAnswer => {

    if (!state.bluePos) { return { pic: "", groups: []} }   
    const numGrps: number = randomNumber(3,11);

    const bPos = state.bluePos.getCenterOfMass()
    
    drawText( ctx, '"DARKSTAR, EAGLE01, PICTURE"',bPos.x-200, 20);
    
    const groups2:AircraftGroup[] = [];

    const groups:AircraftGroup[] = [];
    for (let x = 0; x <= numGrps; x++){
      const bounds:Bounds = {
        tall:{lowX:0.2, hiX:0.75, lowY:0.2, hiY:0.8},
        wide:{lowX:0.2, hiX:0.75, lowY:0.2, hiY:0.8}

      }
      groups.push(GroupFactory.randomGroup(ctx, props, state, bounds))
      groups[x].draw(ctx, props.dataStyle)
      
      const grpPos = groups[x].getCenterOfMass()
      drawLine(ctx, state.bullseye.x, state.bullseye.y, state.bullseye.x-2,state.bullseye.y-2)

      new Braaseye(grpPos, state.bluePos.getCenterOfMass(), state.bullseye)
        .draw(ctx, props.showMeasurements, props.braaFirst)
      drawAltitudes( ctx, grpPos, groups[x].getAltitudes()
      );
    }

    function sortFun(a:AircraftGroup, b:AircraftGroup){
      const aBR = state.bluePos.getCenterOfMass().getBR(a.getCenterOfMass())
      const bBR = state.bluePos.getCenterOfMass().getBR(b.getCenterOfMass())
      return aBR.range > bBR.range ? 1 : -1
    }

    const closestGroups = groups.sort(sortFun).slice(0,3)

    let response = groups.length + " GROUPS, " 

    for (let z = 0; z < closestGroups.length; z++ ){
      const braaseye = new Braaseye(closestGroups[z].getCenterOfMass(), state.bluePos.getCenterOfMass(), state.bullseye)
      response += formatGroup("", braaseye, groups[z].getAltStack(props.format), groups[z].getStrength(), true, groups[z].getTrackDir() + " ")
    }
  
    return { 
      pic:response, 
      groups: groups2
    };
  }