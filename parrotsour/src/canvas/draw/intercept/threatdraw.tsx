// Interfaces
import { AltStack } from "../../../classes/interfaces";
import { PictureAnswer, PictureDrawFunction, PictureCanvasProps, PictureCanvasState } from "canvas/canvastypes";
import { AircraftGroup } from "classes/groups/group";

// Functions
import { drawAltitudes } from "../drawutils";
import { getAspect } from "../../../utils/mathutilities";
import { Braaseye } from "classes/braaseye";
import { randomHeading, randomNumber } from "utils/psmath";
import { Point } from "classes/point";

export const drawThreat:PictureDrawFunction = (
    ctx: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    start?: Point|undefined ): PictureAnswer => {
    
    if (!state.bluePos) { return { pic: "", groups: []} }

    const offsetDeg1:number = randomNumber(-10, 10);

    const bPos = state.bluePos.getCenterOfMass()

    if (start === undefined){
        start = new Point(
            randomNumber(bPos.x-100, bPos.x-40),
            randomNumber(bPos.y-100, bPos.y+40))
    }
    if (start && start.y === undefined){
        start.y = randomNumber(bPos.y-100, bPos.y+40);
    }
    if (start && start.x === undefined) {
        start.x = randomNumber(bPos.x-100, bPos.x-40);
    }

    const heading:number = randomHeading(props.format, state.bluePos.getHeading());

    const sg = new AircraftGroup({
        ctx, 
        sx: start.x, 
        sy: start.y,
        hdg: heading + offsetDeg1
    })
    sg.draw(ctx, props.dataStyle)
    const sgPos = sg.getCenterOfMass()

    drawAltitudes( ctx, sgPos, sg.getAltitudes());

    const sgAlts: AltStack = sg.getAltStack( props.format );


    const closestBraaseye = new Braaseye(sgPos, state.bluePos.getCenterOfMass(), state.bullseye)
    closestBraaseye.draw(ctx, props.showMeasurements, props.braaFirst)

    const closestGrp:AircraftGroup = sg;

    const aspectH = getAspect(state.bluePos, sg);
    const trackDir = sg.getTrackDir();

    let answer:string = "[FTR C/S], THREAT GROUP BRAA " + closestBraaseye.braa.bearing + "/" + closestBraaseye.braa.range + " " + sgAlts.stack + " " + aspectH + " " + (aspectH !== "HOT" ? trackDir : "") + " HOSTILE "

    if (closestGrp.getStrength() > 1) {
        answer += (closestGrp.getStrength() >= 3 ? "HEAVY " : "") + closestGrp.getStrength() + " CONTACTS ";
    }

    answer += sgAlts.fillIns;
  
    const groups = [];
    sg.setLabel("SINGLE GROUP");
    groups.push(sg);

    return {
        pic: answer,
        groups: groups
    };  
}