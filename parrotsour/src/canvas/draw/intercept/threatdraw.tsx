import { getAltStack, getAspect, getBR, getTrackDir, randomHeading, randomNumber } from "../../../utils/mathutilities";
import { AltStack, BRAA, Bullseye, DrawAnswer, DrawFunction, Group } from "../../../utils/interfaces";
import { PicCanvasProps, PicCanvasState } from "./picturecanvas";
import { drawAltitudes, drawArrow, drawBraaseye } from "../drawutils";


export const drawThreat:DrawFunction = (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    props: PicCanvasProps,
    state: PicCanvasState,
    start?: Bullseye|undefined ): DrawAnswer => {
    
    if (!state.bluePos) { return { pic: "", groups: []} }

    const offsetDeg1:number = randomNumber(-10, 10);

    if (start === undefined){
        start = {
            x: randomNumber(state.bluePos.x-100, state.bluePos.x-40),
            y: randomNumber(state.bluePos.y-100, state.bluePos.y+40)
        }
    }
    if (start && start.y === undefined){
        start.y = randomNumber(state.bluePos.y-100, state.bluePos.y+40);
    }
    if (start && start.x === undefined) {
        start.x = randomNumber(state.bluePos.x-100, state.bluePos.x-40);
    }

    const heading:number = randomHeading(props.format, state.bluePos.heading);

    const sg:Group = drawArrow(canvas, props.orientation, randomNumber(1, 4), start.x, start.y, heading + offsetDeg1, props.dataStyle);

    drawAltitudes(canvas, context, sg.x + 10, sg.y - 11, sg.z);

    const sgAlts: AltStack = getAltStack(sg.z, props.format);

    drawBraaseye(
        canvas, 
        context,
        state.bluePos,
        { x: sg.x, y: sg.y },
        state.bullseye,
        props.showMeasurements,
        props.braaFirst
    );

    const br:BRAA = getBR(sg.x, sg.y, {
          x: state.bluePos.x,
          y: state.bluePos.y
        });
    const closest:BRAA = br;
    const closestGrp:Group = sg;

    const aspectH = getAspect(state.bluePos, sg);
    const trackDir = getTrackDir(sg.heading);

    let answer:string = "[FTR C/S], THREAT GROUP BRAA " + closest.bearing + "/" + closest.range + " " + sgAlts.stack + " " + aspectH + " " + (aspectH !== "HOT" ? trackDir : "") + " HOSTILE "

    if (closestGrp.numContacts > 1) {
        answer += (closestGrp.numContacts >= 3 ? "HEAVY " : "") + closestGrp.numContacts + " CONTACTS ";
    }

    answer += sgAlts.fillIns;
  
    const groups = [];
    sg.label = "SINGLE GROUP";
    groups.push(sg);

    return {
        pic: answer,
        groups: groups
    };  
}