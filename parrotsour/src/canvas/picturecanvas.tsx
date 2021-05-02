// Components
import ParrotSourCanvas from 'canvas/parrotsourcanvas'

// Interfaces
import { FightAxis, PictureAnswer, PictureDrawFunction, PictureCanvasState } from 'canvas/canvastypes'
import { AircraftGroup } from 'classes/groups/group'
import { Point } from 'classes/point'

// Functions
import { drawBullseye } from './draw/drawutils'
import { drawAzimuth } from 'canvas/draw/intercept/azimuth'
import { drawRange } from 'canvas/draw/intercept/range'
import { drawLadder } from 'canvas/draw/intercept/ladder'
import { drawWall } from 'canvas/draw/intercept/wall'
import { drawVic } from 'canvas/draw/vic'
import { drawChampagne } from 'canvas/draw/intercept/champagne'
import { drawPackage } from 'canvas/draw/intercept/packages'
import { drawLeadEdge } from './draw/intercept/leadingedge'
import { drawThreat } from './draw/intercept/threatdraw'
import { drawCap } from './draw/intercept/capdraw'
import { drawEA } from './draw/intercept/eadraw'
import { drawPOD } from './draw/intercept/poddraw'
import { IDMatrix } from 'classes/groups/id'
import { randomNumber } from 'utils/psmath'

/**
 * This component is the main control for drawing pictures for intercepts.
 * 
 * To implement a new [yourtype]Canvas, extend ParrotSourCanvas. 
 * Provide a new AnimationHandler in the constructor, and provide a 
 * new 'draw' function that handles the drawing.
 */
export default class PictureCanvas extends ParrotSourCanvas {

    /**
     * Pick a random picture type for drawing
     * @param leadingEdge - true iff leading edge or packages. Set to true to avoid
     * recursive redraw
     */
    getRandomPicType = (leadingEdge: boolean):string => {
        const numType = randomNumber(0,(leadingEdge)? 6 : 8)
        const types = ["azimuth", "range", "vic", "wall","ladder", "champagne", "cap","leading edge","package"];
        return types[numType];
    }
    
    /**
     * TODO -- Pictue Draw functions.... have internal _clampToFrame to prevent draw offscreen
     * by moving the picture perp. to axis as required
     * 
     * Perform a picture draw on the drawing context using the correct DrawFunction
     * 
     * @param context The context of the v
     * @param forced true iff picture type should be forced as random, !lead edge and !packages
     * @param start (optional) start position for the picture
     */
    drawPicture = (context: CanvasRenderingContext2D, forced?: boolean, start?: Point):PictureAnswer => {
        const { picType } = this.props

        const isLeadEdge = (picType === "leading edge" || picType === "package" || picType==="ea")

        let type = "azimuth"
        if (forced) {
            type = this.getRandomPicType(true)
        } else {
            type = ((picType ==="random") ? this.getRandomPicType(isLeadEdge) : picType)
        }
      
        let drawFunc:PictureDrawFunction = this.functions[type];
        if (drawFunc === undefined) drawFunc = drawAzimuth;
      
        console.log(type)
        const answer = drawFunc(context, this.props, this.state, start);

        const {bluePos} = this.state
        bluePos.updateIntent({
            desiredHeading: bluePos.getCenterOfMass().getBR(answer.groups[0].getCenterOfMass()).bearingNum
        })

        answer.groups.forEach((grp)=>{
            const bearingToBlue = grp.getCenterOfMass().getBR(bluePos.getCenterOfMass()).bearingNum
            grp.updateIntent({
                desiredHeading: Math.round(bearingToBlue / 90.0) * 90
                //desiredLoc: [bluePos.getCenterOfMass()]
            })
        })

        return answer
    }

    // A list of all avaiable functions
    functions: { [key:string]: PictureDrawFunction } = {
        "azimuth": drawAzimuth,
        "range": drawRange,
        "ladder" : drawLadder,
        "wall" : drawWall,
        "vic": drawVic,
        "champagne":drawChampagne,
        "cap": drawCap,
        "threat": drawThreat,
        "ea": drawEA,
        "pod": drawPOD,
        "leading edge": drawLeadEdge,
        "package": drawPackage,
    }

    /**
     * Draw function to be called from the Canvas component - handles pre-picture logic 
     * (i.e. blue arrows, bullseye, and image 'snap' for mouse draw)
     * @param context the Context to draw in
     */
    draw = async (ctx: CanvasRenderingContext2D|null|undefined):Promise<void> => {
        if (ctx !== null && ctx !==undefined) {
            const bullseye = drawBullseye(ctx)

            let xPos = ctx.canvas.width-20 
            let yPos = randomNumber(ctx.canvas.height * 0.33, ctx.canvas.height *0.66)
            let heading = 270

            const { orientation } = this.props 

            if (orientation.orient === FightAxis.NS){
                xPos = randomNumber(ctx.canvas.width * 0.33, ctx.canvas.width * 0.66);
                yPos = 20;
                heading = 180;
            }
            
            const bluePos = new AircraftGroup({
                ctx,
                sx: xPos, 
                sy: yPos,
                hdg: heading,
                nContacts: 4,
                id: IDMatrix.FRIEND
            })

            await this.setState({bluePos, bullseye})
            
            const blueOnly = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)

            const answer: PictureAnswer = this.drawPicture(ctx)
            this.props.setAnswer(answer)
            
            bluePos.draw(ctx, this.props.dataStyle)
            this.setState({ctx, answer, animateCanvas: blueOnly})
        }
    }

    state:PictureCanvasState = {
        ...this.state,
        reDraw: this.drawPicture
    }
}