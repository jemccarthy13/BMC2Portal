export const test=""
// // Interfaces
// import { FightAxis, PictureAnswer, PictureDrawFunction, PictureCanvasProps, PictureCanvasState } from 'canvas/canvastypes';
// import { AircraftGroup } from 'classes/groups/group';

// // Functions
// import { Bounds, drawBullseye, getStartPos } from '../drawutils'
// import { Point } from 'classes/point';

// export const drawLeadEdge:PictureDrawFunction = (
//   ctx: CanvasRenderingContext2D,
//   props: PictureCanvasProps,
//   state: PictureCanvasState,
//   start?: Point|undefined ): PictureAnswer => {

//   const isNS = props.orientation.orient === FightAxis.NS

//   const boundaries: Bounds = {
//     tall: { lowX: 0.2, hiX: 0.8, lowY: 0.3, hiY: 0.5 },
//     wide: { lowX: 0.5, hiX: 0.6, lowY: 0.42, hiY: 0.5 }
//   }

//   const startPos = getStartPos(ctx, props.orientation.orient, boundaries, start)
//   let finalAnswer: PictureAnswer = {
//     pic:"", groups:[]
//   }
//   const answer1 = state.reDraw( ctx, true, startPos)
   
//   const boundaries2: Bounds = {
//     tall: { lowX: 0.2, hiX: 0.8, lowY: 0.8, hiY: 0.9 },
//     wide: { lowX: 0.30, hiX: 0.40, lowY: 0.25, hiY: 0.29 }
//   }
  
//   const startPos2 = getStartPos(ctx, props.orientation.orient, boundaries2, start )
//   const answer2 = state.reDraw( ctx, true, startPos2 )
  
//   if (!state.bluePos) { return { pic: "", groups: []} }
//   const groups1 = answer1.groups;
//   const groups2 = answer2.groups;

//   const followFunc = (props.orientation.orient === FightAxis.NS) ? Math.min : Math.max
//   const leadFunc = (props.orientation.orient === FightAxis.NS) ? Math.max : Math.min
//   const closestFollow = followFunc(...groups2.map(function(o:AircraftGroup) { const oPos = o.getCenterOfMass(); return isNS ? oPos.y : oPos.x}))
//   const closestLead = leadFunc(...groups1.map(function(o:AircraftGroup) { const oPos = o.getCenterOfMass(); return isNS ? oPos.y : oPos.x}))

//   let rngBack;
  
//   const grpStPos = groups1[0].getCenterOfMass()
//   if (props.orientation.orient===FightAxis.EW) {
//     rngBack = new Point(closestLead, grpStPos.y).getBR(new Point(closestFollow, grpStPos.y))
//   } else {
//     rngBack = new Point(grpStPos.x, closestFollow).getBR(new Point(grpStPos.x, closestLead))
//   }

//   let overlap = false
//   if (isNS){
//     overlap = closestLead > closestFollow
//   }
//   else {
//     overlap = closestFollow > closestLead
//   }

//   if (overlap || rngBack.range <=5 || rngBack.range >= 40){
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     drawBullseye(ctx, state.bullseye);
//     state.bluePos.draw(ctx, props.dataStyle)
//     finalAnswer = drawLeadEdge(ctx, props, state, start);
//   }
//   else {
//     finalAnswer=  {
//       pic:
//         (groups1.length +groups2.length) +
//         " GROUPS, LEADING EDGE " +
//         answer1.pic +
//         " FOLLOW ON " + (props.format ==="ipe" ? " GROUPS " : "") +
//         (rngBack.range > 40 ? " 40 " : rngBack.range) +
//         (props.format==="ipe" ? " MILES" : ""),
//       groups: groups1.concat(groups2)
//     };
//   }
  
//   return finalAnswer;
// }
