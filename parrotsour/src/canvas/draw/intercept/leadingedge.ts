// Interfaces
import {
  BlueInThe,
  PictureAnswer,
  PictureDrawFunction,
  PictureCanvasProps,
  PictureCanvasState,
  FightAxis,
} from "../../../canvas/canvastypes"

// Functions
import { drawLine, drawMeasurement } from "../drawutils"
import { Point } from "../../../classes/point"
import { PIXELS_TO_NM } from "../../../utils/psmath"

export const drawLeadEdge: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  start?: Point | undefined
): PictureAnswer => {
  const isNS = FightAxis.isNS(props.orientation.orient)

  // // Draw the first picture (i.e. the leading edge)
  // const pic1Bounds: Bounds = {
  //   tall: { lowX: 0.2, hiX: 0.8, lowY: 0.3, hiY: 0.5 },
  //   wide: { lowX: 0.55, hiX: 0.7, lowY: 0.2, hiY: 0.7 }
  // }
  //const pic1StartPos = getStartPos(ctx, props.orientation.orient, pic1Bounds, start)
  //const answer1 = state.reDraw(ctx, true, pic1StartPos)
  //const groups1 = answer1.groups;

  //let furthestPic1Group = groups1[0]
  //let furthestRange = 0
  //groups1.forEach((grp) => {
  //const grpRange = grp.getCenterOfMass().getBR(state.blueAir.getCenterOfMass()).range
  //if (grpRange > furthestRange){
  //furthestPic1Group = grp
  // furthestRange = grpRange
  //  }
  //})

  //
  // For a picture to be 'leading edge', the leading edge must be
  // at least 5 miles away from follow-on groups and no more than 40,
  // as 40 nm separation would be a package picture.
  //
  // This logic builds the required separation and gets the
  // second picture starting point
  //
  //const pic1TrailPos = furthestPic1Group.getCenterOfMass()
  //const canvasSize = isNS ? ctx.canvas.height : ctx.canvas.width

  //const limitLine = isNS ? pic1TrailPos.y : pic1TrailPos.x

  //const uBound = limitLine / canvasSize
  //const lBound = (limitLine - (40*PIXELS_TO_NM)) / canvasSize

  // drawLine(ctx,
  //   isNS ? 0 : limitLine - 5*PIXELS_TO_NM,
  //   isNS ? limitLine-5*PIXELS_TO_NM : 0,
  //   isNS ? ctx.canvas.width : limitLine -5*PIXELS_TO_NM,
  //   isNS ? limitLine-5*PIXELS_TO_NM: ctx.canvas.height  )

  // const pic2Bounds: Bounds = {
  //   tall: { lowX: 0.2, hiX: 0.8, lowY: lBound, hiY: uBound },
  //   wide: { lowX: lBound, hiX: uBound, lowY: 0.2, hiY: 0.8 }
  // }

  //const pic2StartPos = getStartPos(ctx, state.blueAir, props.orientation.orient, start )

  //const answer2 = state.reDraw( ctx, true, pic2StartPos )
  //const groups2 = answer2.groups

  //let closestPic2Group = groups1[0]
  //let closestRange = Number.MAX_VALUE
  //groups2.forEach((grp) => {
  //  const grpRange = grp.getCenterOfMass().getBR(state.blueAir.getCenterOfMass()).range
  //  if (grpRange < closestRange){
  //    closestPic2Group = grp
  //    closestRange = grpRange
  //  }
  //})

  //const pic2Pos = closestPic2Group.getCenterOfMass()
  //const pic1Pos = furthestPic1Group.getCenterOfMass()

  //const rngBack = pic1Pos.straightDistNM(pic2Pos, props.orientation.orient)

  //const drawXTo = (isNS ? pic1Pos.x : pic2Pos.x)
  //const drawYTo = (isNS ? pic2Pos.y : pic1Pos.y)
  //drawMeasurement(ctx, pic1Pos.x, pic1Pos.y, drawXTo, drawYTo, rngBack, true)

  //const finalAnswer = {
  //  pic:
  //    (( groups1.length + groups2.length ) + "GROUPS, LEADING EDGE " +
  //    answer1.pic + " FOLLOW ON " +
  //    (props.format === "ipe" ? " GROUPS " : "")+
  //    rngBack +
  //   (props.format === "ipe" ? " MILES " : "")),
  // groups: groups1.concat(groups2)
  //}
  //console.log(finalAnswer)
  return {
    pic: "",
    groups: [],
  }
  //return finalAnswer;
}
