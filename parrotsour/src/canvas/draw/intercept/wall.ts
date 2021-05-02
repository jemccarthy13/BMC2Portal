import { FightAxis, PictureAnswer, PictureCanvasProps, PictureCanvasState, PictureDrawFunction } from "canvas/canvastypes"
import { Bounds, drawAltitudes, drawMeasurement, getStartPos } from "canvas/draw/drawutils"
import { formatGroup } from "canvas/draw/formatutils"
import { isAnchorNorth, picTrackDir } from "canvas/draw/intercept/picturehelpers"
import { Braaseye } from "classes/braaseye"
import { AircraftGroup } from "classes/groups/group"
import { AltStack } from "classes/interfaces"
import { Point } from "classes/point"
import { PIXELS_TO_NM, randomHeading, randomNumber } from "utils/psmath"

export const drawWall: PictureDrawFunction = (
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    start?: Point|undefined ): PictureAnswer => {

    const boundaries: Bounds = {
      tall: { lowX: 0.2, hiX: 0.5, lowY: 0.4, hiY: 0.8},
      wide: { lowX: 0.2, hiX: 0.5, lowY: 0.2, hiY: 0.5}
    }

    const isNS = props.orientation.orient === FightAxis.NS

    // const startPos = getStartPos(ctx, props.orientation.orient, boundaries, start)
    const startPos = getStartPos(ctx, state.bluePos, props.orientation.orient, start)
    const startX = startPos.x
    const startY = startPos.y

    let heading = randomHeading(props.format, state.bluePos.getHeading());
  
    const numGroups = randomNumber(3, 5);
  
    let totalArrowOffset = 0;
  
    const braaseyes:Braaseye[] = [];
    const altStacks:AltStack[] = [];
    const groups:AircraftGroup[] = [];
    for (let x = 0; x < numGroups; x++) {
      const offsetHeading = randomNumber(-10, 10);
      const arrowOffsetY = (x === 0) ? 0 : randomNumber(40, 60);
      totalArrowOffset += arrowOffsetY;
  
      let altOffsetX = 30;
      let altOffsetY = 0;

      if (props.isHardMode) heading = randomHeading(props.format, state.bluePos.getHeading());

      if (isNS){ 
        const grp = new AircraftGroup({
          ctx, 
          sx: startX + totalArrowOffset,
          sy: startY,
          hdg: heading + offsetHeading
        })
        grp.draw(ctx, props.dataStyle)
        groups.push(grp)
        altOffsetX = (-15*(numGroups-x));
        altOffsetY = 40 + 11*(numGroups-(numGroups-x));
      } else {
        const grp = new AircraftGroup({
          ctx, 
          sx: startX,
          sy: startY + totalArrowOffset,
          hdg: heading + offsetHeading
        })
        grp.draw(ctx, props.dataStyle)
        groups.push(grp)
      }
  
      const grp = groups[x]
      const grpPos = grp.getCenterOfMass()
      drawAltitudes( ctx, grpPos, grp.getAltitudes(), altOffsetX, altOffsetY);

      const grpBraaseye = new Braaseye(grpPos, state.bluePos.getCenterOfMass(), state.bullseye)
      grpBraaseye.draw(ctx, props.showMeasurements, props.braaFirst, altOffsetX, altOffsetY)
      braaseyes.push(grpBraaseye)
      altStacks.push(grp.getAltStack(props.format));
    }
  
    let width = 0;
    let nLbl = "WEST"
    let sLbl = "EAST"

    const prevGpPos = groups[groups.length-1].getCenterOfMass()
    const gpPos = groups[0].getCenterOfMass()

    if (isNS){
      width = Math.floor((prevGpPos.x - gpPos.x) / PIXELS_TO_NM);
      drawMeasurement(ctx, gpPos.x, gpPos.y-25, prevGpPos.x, gpPos.y - 25, width, props.showMeasurements)
    } else {
      width = Math.floor((prevGpPos.y - gpPos.y) / PIXELS_TO_NM);
      drawMeasurement(ctx, gpPos.x+25, gpPos.y, gpPos.x+25, prevGpPos.y, width, props.showMeasurements)
      nLbl = "NORTH";
      sLbl = "SOUTH";
    }
    
    switch (numGroups) {
      case 3:
        groups[0].setLabel(nLbl + " GROUP")
        groups[1].setLabel("MIDDLE GROUP")
        groups[2].setLabel(sLbl + " GROUP")
        break;
      case 4:
        groups[0].setLabel(nLbl + " GROUP")
        groups[1].setLabel(nLbl + " MIDDLE GROUP")
        groups[2].setLabel(sLbl +" MIDDLE GROUP")
        groups[3].setLabel(sLbl + " GROUP")
        break;
      case 5:
        groups[0].setLabel(nLbl + " GROUP")
        groups[1].setLabel(nLbl +" MIDDLE GROUP")
        groups[2].setLabel("MIDDLE GROUP")
        groups[3].setLabel(sLbl + " MIDDLE GROUP")
        groups[4].setLabel(sLbl + " GROUP")
        break;
    }
  
    let answer = numGroups + " GROUP WALL " + width + " WIDE, ";

    answer += picTrackDir(props.format, groups)

    const anchorNorth = isAnchorNorth(braaseyes[0], braaseyes[braaseyes.length-1], groups[0], groups[groups.length-1])
  
    //console.log("DETERMINE IF WEIGHTED WALL");
    
    const includeBull = (width > 10 && props.format !== "ipe");
   
    for (let g = 0; g < numGroups; g++){
        const idx: number = anchorNorth ? g : (numGroups-1) - g
        answer += formatGroup((groups[idx].getLabel()+"").replace(/GROUP/, ""), braaseyes[idx], altStacks[idx], groups[idx].getStrength(), (g===0) || (g === numGroups-1 && includeBull) || false, groups[idx].getTrackDir())+ " ";
    }

    return {
      pic: answer,
      groups: groups
    };
}  