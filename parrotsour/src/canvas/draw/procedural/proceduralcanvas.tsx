import React, { ReactElement } from 'react'

import Canvas from '../../canvas'

import { randomNumber } from '../../../utils/mathutilities'
import { drawBullseye, drawGroupCap, drawLine, drawText } from '../drawutils'
import { drawProcedural } from './draw'
import { Bullseye, DrawAnswer, Group } from '../../../utils/interfaces'
//import { animateGroups, pauseFight } from './draw/procedural/animate'
import { pauseFight } from './animate'

export type ProcCanvasProps = {
    height: number,
    width: number,
    picType: string,
    orientation: string,
    braaFirst: boolean,
    showMeasurements:boolean,
    isHardMode: boolean,
    setAnswer: {(answer:DrawAnswer):void},
    newPic: boolean,
    animate:boolean,
    sliderSpeed: number,
    dataStyle: string,
    resetCallback: ()=>void,
    animateCallback: ()=>void
}

export interface ReDrawFunction {
    (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, forced?: boolean, start?: Bullseye):DrawAnswer
}

export type ProcCanvasState = {
    bullseye: Bullseye
    bluePos: Group,
    reDraw: ReDrawFunction,
    answer:DrawAnswer,
    canvas?:HTMLCanvasElement,
    animateCanvas?: ImageData,
}

/**
 * This component is the main control for drawing pictures for intercepts
 */
export default class ProceduralCanvas extends React.PureComponent<ProcCanvasProps, ProcCanvasState> {

    constructor(props: ProcCanvasProps){
        super(props)
        this.state = {
            bullseye: {x:0, y:0},
            bluePos: {x:0, y:0, startX:0, startY:0, heading:270, desiredHeading: 270, numContacts:4, z:[100], type:"ftr", radarPoints:[], drawnRadar:[]},
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
    componentDidUpdate = (prevProps: ProcCanvasProps):void => {
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
            // const { animate, showMeasurements, resetCallback } = this.props 
            // const { canvas, animateCanvas, answer } = this.state
            const { animate, showMeasurements } = this.props
            const { canvas, animateCanvas } = this.state
            
            if (animate){
                if (canvas && animateCanvas){
                    // TODO - animate for procedural
                    // animateGroups(canvas, this.props, this.state, answer.groups, animateCanvas, resetCallback);
                }
            } else {
                pauseFight(showMeasurements)
            }
        }
    }
    
    /**
     * Perform a picture draw on the canvas using the correct DrawFunction
     * @param canvas Canvas to draw on
     * @param context The context of the canvas
     * @param forced true iff picture type should be forced as random, !lead edge and !packages
     * @param start (optional) start position for the picture
     */
    drawPicture = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, forced?: boolean, start?: Bullseye):DrawAnswer => {
        return drawProcedural(canvas, context, this.props, this.state, start);
    }

    drawCGRSGrid = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D):void => {
        for (let x = 0; x < canvas.width; x+=40){
            if (x % 120 === 0){
                drawLine(context, x, 0, x, canvas.height)
            } else {
                drawLine(context, x, 0, x, canvas.height, "gray")
            }
        }
        for (let y = 0; y < canvas.height; y += 40){
            if (y % 120 === 0){
                drawLine(context, 0, y, canvas.width, y)
            } else {
                drawLine(context, 0, y, canvas.width, y, "gray")
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
        for (let y = 10; y < canvas.height; y+=120){
            for (let x = 10; x < canvas.width; x+=120){
                if (col2Chr + colC > 25){
                    col2Chr = 0
                    off++
                    colC = 0
                }
                drawText(canvas,context, rowC+chr(startCol1+off)+ chr(col2Chr+colC), x+33, y+60)
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
     * @param context the Context to draw in
     * @param frameCount (unused) animation counter
     * @param canvas the Canvas element to draw in
     */
    draw = async (context: CanvasRenderingContext2D|null|undefined, frameCount: number, canvas: HTMLCanvasElement):Promise<void> => {
        if (context === null || context ===undefined) return
        const bullseye = drawBullseye(canvas, context)

        this.drawCGRSGrid(canvas, context)

        const xPos = randomNumber(canvas.width * 0.33, canvas.height * 0.66)
        const yPos = randomNumber(canvas.height * 0.33, canvas.height *0.66)
       
        const { orientation } = this.props 
        
        //const bluePos = drawArrow(canvas, orientation, 1, xPos, yPos, heading, "blue");
        const bluePos = drawGroupCap(canvas, orientation, 1, xPos, yPos, "blue")
        bluePos.callsign="VR01"
        drawText(canvas, context, bluePos.callsign, bluePos.x, bluePos.y+35, 12);
        await this.setState({bluePos, bullseye})
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const answer: DrawAnswer = await this.drawPicture(canvas, context)
        answer.groups[0].callsign = bluePos.callsign
        
        const { setAnswer } = this.props
        setAnswer(answer)
        this.setState({canvas, answer, animateCanvas: imageData})
    }

    render(): ReactElement{
        const { height, width, braaFirst, 
            picType, showMeasurements, isHardMode, 
            newPic,resetCallback,animateCallback, animate, dataStyle } = this.props
        const { bullseye } = this.state
        return (<Canvas 
            draw={this.draw} 
            height={height} 
            width={width} 
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