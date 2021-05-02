// Interfaces
import { AltStack } from "../../../classes/interfaces";
import { FightAxis, PictureAnswer, PictureDrawFunction, PictureCanvasProps, PictureCanvasState } from "canvas/canvastypes";
import { AircraftGroup } from "classes/groups/group";
import { Point } from "classes/point";
import { GroupFactory } from "classes/groups/groupfactory";
import { Braaseye } from "classes/braaseye";

// Functions
import { drawAltitudes, drawGroupCap, drawMeasurement, getStartPos } from "../drawutils";
import { formatGroup } from "../formatutils";
import { randomNumber } from "utils/psmath";

/**
 * A wrapper to actually draw a CAP picture
 * 
 * TODO -- to allow other pictures to include CAPs, convert 
 * group.draw() to draw caps, and this function wraps 
 * drawRandomPic with establishing random group.setCapping(true)
 * 
 * @param context the current drawing context
 * @param props PicCanvasProps with settings from the controls
 * @param state PicCanvasState current state of canvas
 * @param start (Optional) point to start drawing at
 * @returns 
 */
export const drawCap:PictureDrawFunction = (
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    start?: Point|undefined ): PictureAnswer => {

    const bounds = {
        tall: { lowX: 0.2, hiX: 0.6, lowY: 0.35, hiY: 0.9},
        wide: { lowX: 0.2, hiX: 0.6, lowY: 0.2, hiY: 0.6}
    }
    //start = getStartPos(ctx, props.orientation.orient, bounds, start)
    start = getStartPos(ctx, state.bluePos, props.orientation.orient, start)

    const incr:number = ctx.canvas.width / (ctx.canvas.width / 10);
    const drawDist:number = randomNumber(3.5 * incr, 10 * incr);

    // TODO -- this will be replaced with CAP in group draw/format logic??
    const capCheck = randomNumber(0,100)
    let ngCap = false
    let sgCap = false

    if (capCheck < 33){
        ngCap = true
    } else if (capCheck < 66) {
        sgCap = true
    } else {
        ngCap = true
        sgCap = true
    }
    let ng: AircraftGroup, sg: AircraftGroup
    let nOffset = 0
    let sOffset = 0

    if (ngCap){
        nOffset = 12
        ng = drawGroupCap (ctx, props.orientation.orient, randomNumber(1,4), start.x, start.y);
    } else {
        ng = GroupFactory.randomGroupAtLoc(ctx, props, state, start)
        ng.draw(ctx, props.dataStyle)
    }
    
    const offsetX = props.orientation.orient === FightAxis.NS ? drawDist : 0
    const offsetY = props.orientation.orient === FightAxis.EW ? drawDist : 0

    if (sgCap){
        sOffset = 12
        sg = drawGroupCap (ctx, props.orientation.orient, randomNumber(1,4), start.x + offsetX, start.y + offsetY);
    } else {
        sg = GroupFactory.randomGroupAtLoc(ctx, props, state, new Point(start.x+offsetX, start.y+offsetY ))
        sg.draw(ctx, props.dataStyle)
    }
    
    let realWidth:number

    const ngPos = ng.getCenterOfMass()
    const sgPos = sg.getCenterOfMass()
    if (props.orientation.orient===FightAxis.NS){
        realWidth = new Point(sgPos.x-sOffset, ngPos.y).getBR(new Point(ngPos.x-nOffset, ngPos.y)).range
        drawMeasurement(ctx, ngPos.x - nOffset, ngPos.y, sgPos.x - sOffset, ngPos.y, realWidth, props.showMeasurements);
    } else {
        realWidth = new Point(ngPos.x, sgPos.y+sOffset).getBR(new Point(ngPos.x, ngPos.y+nOffset)).range
        drawMeasurement(ctx, ngPos.x, ngPos.y + nOffset, ngPos.x, sgPos.y + sOffset, realWidth, props.showMeasurements);
    }
    
    const drawOffsetX = props.orientation.orient === FightAxis.NS ? -70 : 0
    
    drawAltitudes(ctx, ngPos, ng.getAltitudes(), drawOffsetX);
    drawAltitudes(ctx, sgPos, sg.getAltitudes());
    
    const ngBraaseye: Braaseye = new Braaseye(ngPos, state.bluePos.getCenterOfMass(), state.bullseye)
    const sgBraaseye: Braaseye = new Braaseye(sgPos, state.bluePos.getCenterOfMass(), state.bullseye)
    
    ngBraaseye.draw(ctx, props.showMeasurements, props.braaFirst, drawOffsetX)
    sgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst)

    const ngAlts: AltStack = ng.getAltStack( props.format );
    const sgAlts: AltStack = sg.getAltStack( props.format );

    let answer = "";
   
    // anchor cap if width > 0 for alsa
    const includeBull = realWidth >= 10 && props.format !== "ipe";
   
    answer = "TWO GROUPS AZIMUTH " + realWidth + ", ";

    let nLbl = "NORTH";
    let sLbl = "SOUTH";
    if (props.orientation.orient===FightAxis.NS){
        nLbl = "WEST";
        sLbl = "EAST";
    }
    // TODO -- assess anchoring P's 
    if (ngBraaseye.braa.range < sgBraaseye.braa.range) {
        answer += formatGroup(nLbl, ngBraaseye, ngAlts, ng.getStrength(), true, ng.getTrackDir());
        answer +=
        " " + formatGroup(sLbl, sgBraaseye, sgAlts, sg.getStrength(), includeBull, sg.getTrackDir());
    } else {
        answer += formatGroup(sLbl, sgBraaseye, sgAlts, sg.getStrength(), true, sg.getTrackDir());
        answer +=
        " " + formatGroup(nLbl, ngBraaseye, ngAlts, ng.getStrength(), includeBull, ng.getTrackDir());
    }
    
    const groups = [];
    
    ng.setLabel(nLbl + " GROUP")
    sg.setLabel(sLbl + " GROUP")
    groups.push(ng);
    groups.push(sg);
    
    return {
        pic: answer,
        groups: groups
    };
}
