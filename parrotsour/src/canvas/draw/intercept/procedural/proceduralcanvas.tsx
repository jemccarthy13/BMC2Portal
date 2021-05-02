import React, { ReactElement } from 'react'

import DrawingCanvas from '../../../drawingcanvas'

import { PictureAnswer, PictureCanvasProps, PictureCanvasState } from 'canvas/canvastypes'

import { Bounds, drawGroupCap, drawLine, drawText, getStartPos } from '../../drawutils'
import { animateGroups, pauseFight } from './animate'
import { AircraftGroup } from 'classes/groups/group'
import { randomNumber } from 'utils/psmath'
import { Point } from 'classes/point'

/**
 * This component is the main control for drawing pictures for procedural control
 */
export default class ProceduralCanvas extends React.PureComponent<PictureCanvasProps, PictureCanvasState> {

    constructor(props: PictureCanvasProps){
        super(props)
        this.state = {
            bullseye: Point.DEFAULT,
            bluePos: new AircraftGroup(),
            reDraw: this.drawPicture,
            answer: {pic:"", groups:[]}
        }
    }

    /**
     * This lifecycle function serves as a check to make sure the only props
     * value that changed is the animation value (i.e. button pressed) so the 
     * animation is not re-triggered when any other prop value changes 
     * @param prevProps - previous set of PicCanvasProps
     */
    componentDidUpdate = (prevProps: PictureCanvasProps):void => {
        // eslint-disable-next-line
        var {animate, ...rest} = prevProps
        const oldAnimate = animate
        // eslint-disable-next-line
        var {animate, ...newrest} = this.props
        const newAnimate = animate
        // eslint-disable-next-line
        function areEqualShallow(a:any, b:any):boolean {
            for(const key in a) {
                if(!(key in b) || a[key] !== b[key]) {
                    return false;
                }
            }
            for(const key2 in b) {
                if(!(key2 in a) || a[key2] !== b[key2]) {
                    return false;
                }
            }
            return true;
        }
    
        if (areEqualShallow(rest, newrest) && oldAnimate !== newAnimate){
            const { animate, resetCallback } = this.props
            const { ctx, animateCanvas, answer } = this.state
            
            if (animate){
                if (ctx && animateCanvas){
                    animateGroups(ctx, this.props, this.state, answer.groups, animateCanvas, resetCallback);
                }
            } else {
                pauseFight()
            }
        }
    }
    
    /**
     * Perform a picture draw on the drawing context using the correct DrawFunction
     * @param context The context of the drawing context
     * @param forced true iff picture type should be forced as random, !lead edge and !packages
     * @param start (optional) start position for the picture
     */
    drawPicture = ( ctx: CanvasRenderingContext2D, forced?: boolean, start?: Point):PictureAnswer => {
        
        const { orientation } = this.props
        const bounds: Bounds = {
            tall: { lowX: 0.1, hiX: 0.9, lowY: 0.1, hiY: 0.9},
            wide: { lowX: 0.1, hiX: 0.9, lowY: 0.1, hiY: 0.9}
        }

        // const startPos = getStartPos(ctx, orientation.orient, bounds, start)
        const { bluePos } = this.state
        const startPos = getStartPos(ctx, bluePos, orientation.orient, start)
        
        const grp = drawGroupCap(ctx, orientation.orient, 1, startPos.x, startPos.y, "blue")
        grp.addRoutingPoint(startPos)
        grp.setLabel("VR01")
        
        const grpPos = grp.getCenterOfMass()
    
        drawText( ctx, grp.getLabel(), grpPos.x, grpPos.y+35, 12);
        return {
        pic: "",
        groups:[grp]
        }
    }

    drawCGRSGrid = ( ctx: CanvasRenderingContext2D ):void => {
        for (let x = 0; x < ctx.canvas.width; x+=40){
            if (x % 120 === 0){
                drawLine( ctx, x, 0, x, ctx.canvas.height)
            } else {
                drawLine( ctx, x, 0, x,  ctx.canvas.height, "gray")
            }
        }
        for (let y = 0; y <  ctx.canvas.height; y += 40){
            if (y % 120 === 0){
                drawLine( ctx, 0, y,  ctx.canvas.width, y)
            } else {
                drawLine( ctx, 0, y,  ctx.canvas.width, y, "gray")
            }
        }

        const startRow = randomNumber(5, 158)
        const startCol1 = randomNumber(0,25)
        const startCol2 = randomNumber(0,26)

        localStorage.startRow = startRow
        localStorage.startCol1 = startCol1
        localStorage.startCol2 = startCol2

        const chr = (n:number):string => {
            return String.fromCharCode (65+n)
        }

        let colC = 0
        let off = 0
        let rowC = startRow
        let col2Chr = startCol2
        for (let y = 10; y <  ctx.canvas.height; y+=120){
            for (let x = 10; x <  ctx.canvas.width; x+=120){
                if (col2Chr + colC > 25){
                    col2Chr = 0
                    off++
                    colC = 0
                }
                drawText( ctx, rowC+chr(startCol1+off)+ chr(col2Chr+colC), x+33, y+60)
                colC ++
            }
            col2Chr = startCol2
            colC = 0;
            off = 0;
            rowC++
        }
    }

    /**
     * Draw function to be called from the Canvas component - handles pre-picture logic 
     * (i.e. blue arrows, bullseye, and image 'snap' for mouse draw)
     * @param context the drawing context to draw in
     */
    draw = async (ctx: CanvasRenderingContext2D|null|undefined):Promise<void> => {
        if (ctx === null || ctx ===undefined) return

        this.drawCGRSGrid( ctx )
        
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
        const answer: PictureAnswer = this.drawPicture(ctx)
        
        const { setAnswer } = this.props
        setAnswer(answer)
        this.setState({ctx, answer, animateCanvas: imageData})
    }

    render(): ReactElement{
        const { orientation, braaFirst, 
            picType, showMeasurements, isHardMode, 
            newPic,resetCallback,animateCallback, animate, dataStyle } = this.props
        const { bullseye } = this.state
        return (<DrawingCanvas 
            draw={this.draw} 
            orientation={orientation}
            braaFirst={braaFirst}
            bullseye={bullseye}
            picType={picType}
            showMeasurements={showMeasurements}
            isHardMode={isHardMode}
            newPic={newPic}
            resetCallback={resetCallback}
            animate={animate}
            animateCallback={animateCallback}
            dataStyle={dataStyle}
        />)
    }
}