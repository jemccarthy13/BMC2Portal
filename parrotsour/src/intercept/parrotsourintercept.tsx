import React, { ChangeEvent, lazy, ReactElement, Suspense } from 'react'

import '../css/collapsible.css'
import '../css/select.css'
import '../css/slider.css'
import '../css/parrotsour.css'
import '../css/toggle.css'

import { InterceptQT } from '../quicktips/interceptQT'

const PicTypeSelector = lazy(()=>import('./pictypeselector'))
const StandardSelector = lazy(()=>import('./standardselector'))
const ParrotSourHeader = lazy(()=>import('../pscomponents/parrotsourheader'))
const ParrotSourControls = lazy(()=>import("../pscomponents/parrotsourcontrols"))

const PictureCanvas = lazy(()=>import('../canvas/draw/intercept/picturecanvas'))
const VersionInfo = lazy(()=>import('../versioninfo'))

interface CanvasConfig {
    height: number,
    width: number,
    orient: string
}

interface PSIState {
    showAnswer: boolean,
    showMeasurements: boolean,
    isHardMode: boolean,
    format: string,
    speedSliderValue: number,
    canvasConfig: CanvasConfig,
    braaFirst: boolean,
    picType: string,
    answer: string,
    animate:boolean,
    newPic: boolean,
    dataStyle: string
}

/**
 * A Component to display intercept pictures on an HTML5 canvas
 */
export default class ParrotSourIntercept extends React.PureComponent<Record<string,unknown>, PSIState> {

    constructor(props:Record<string,unknown>){
        super(props)
        this.state = {
            showAnswer: false,
            showMeasurements: true,
            isHardMode: false,
            format:"alsa",
            speedSliderValue: 50,
            canvasConfig: {
                height: 500,
                width:800,
                orient:"EW"
            },
            braaFirst: true,
            picType:"random",
            answer: "",
            newPic: false,
            animate: false,
            dataStyle: "arrow"
        }
    }

    /**
     * Called when the PSControls slider value is changed
     * @param value - new speed of the slider
     */
    onSliderChange = (value: number):void => {
        this.setState({speedSliderValue: value})
    }

    /**
     * Called when the format selection changes
     * @param fmt - new format to use to generate answers
     */
    formatSelChange = (fmt: string):()=>void => {
        return () => {
            this.setState({format: fmt})
            this.onNewPic()
        }
    }

    /**
     * Called to display a new Picture
     */
    onNewPic = ():void =>{
        this.setState(prevState=>({newPic:!prevState.newPic}))
    }

    /**
     * Toggle the answer collapsible
     */
    handleRevealPic = ():void => {
        this.setState(prevState=>({showAnswer: !prevState.showAnswer}))
    }

    /**
     * Called when the BRAAFirst option is changed
     */
    braaChanged = ():void =>{
        this.setState(prevState=>({braaFirst: !prevState.braaFirst}))
    }

    /**
     * Called when the "Show Measurements" check box changes values
     */
    onToggleMeasurements = ():void => {
        this.setState(prevState=>({showMeasurements: !prevState.showMeasurements}))
    }

    /**
     * Called when the hard mode check box changes values
     */
    onToggleHardMode = ():void => {
        this.setState(prevState=>({isHardMode: !prevState.isHardMode}))
    }

    /**
     * Called when an answer is avaiable; to be displayed in the answer collapsible
     * @param answer - the answer to the displayed picture
     */
    setAnswer = (answer: string):void => {
        this.setState({answer: answer})
    }

    /**
     * Called to start the animation
     */
    startAnimate = ():void =>{
        this.setState({animate:true})
    }

    /**
     * Called to pause the animation
     */
    pauseAnimate = ():void => {
        this.setState({animate:false})
    }

    /**
     * Called when the orienation is changed, to modify the canvas dimensions
     */
    modifyCanvas = ():void => {
        const { canvasConfig } = this.state
        const { orient } = canvasConfig

        let newConfig = {
            height:700,
            width:600,
            orient:"NS"
        }
        if (orient==="NS"){
            newConfig = {
                height:500,
                width:800,
                orient:"EW"
            }
        }
        this.setState({canvasConfig:newConfig})
    }

    /**
     * Called when the picture type selector changes values
     * @param e - ChangeEvent for the Select element
     */
    onChangePicType = (e: ChangeEvent<{name?:string|undefined, value:unknown}>):void => {
        if (typeof e.target.value === "string")
            this.setState({picType:e.target.value})
    }

    getAnswer = ():string => {
        // eslint-disable-next-line
        return this.state.answer
    }

    onDataStyleChange = ():void => {
        const { dataStyle } = this.state
        if (dataStyle==="arrow") {
            this.setState({dataStyle:"radar" })
        } else {
            this.setState({dataStyle:"arrow"})
        }
    }

    render():ReactElement {
        const { showAnswer, answer, picType } = this.state
        const { canvasConfig, braaFirst, format } = this.state
        const { showMeasurements, isHardMode, animate, newPic, speedSliderValue } = this.state
        const { dataStyle } = this.state
        return (
            <div>
                <Suspense fallback={<div>Loading...</div>} >
                    <ParrotSourHeader 
                        comp={<InterceptQT/>}
                        getAnswer={this.getAnswer} />
                </Suspense>

                <hr />

                <Suspense fallback={<div/>} >
                    <StandardSelector 
                        selectionChanged={this.formatSelChange}
                    />
                </Suspense>

                <Suspense fallback={<div/>} >
                    <PicTypeSelector
                        handleChangePicType = {this.onChangePicType}
                        picType={picType}
                        handleToggleHardMode = { this.onToggleHardMode}
                        handleNewPic = {this.onNewPic}
                        handleToggleMeasurements = {this.onToggleMeasurements}
                    />
                </Suspense>

                <Suspense fallback={<div/>} >    
                    <ParrotSourControls 
                        handleSliderChange={this.onSliderChange}
                        modifyCanvas={this.modifyCanvas}
                        braaChanged={this.braaChanged}
                        startAnimate={this.startAnimate}
                        pauseAnimate={this.pauseAnimate}
                        handleDataStyleChange={this.onDataStyleChange}
                    />
                </Suspense>  

                <br/>
                
                <button type="button" className={showAnswer ? "collapsible active":"collapsible"} onClick={this.handleRevealPic}>Reveal Pic</button>
                {showAnswer && 
                    <div className="content" id="answerDiv" style={{color:"black", padding:"20px"}}>
                        {answer ? answer : <div/>}
                    </div>
                }  
                <br/><br/><br/>

                <Suspense fallback={<div/>} >
                    <PictureCanvas 
                        height={canvasConfig.height}
                        width={canvasConfig.width}
                        braaFirst={braaFirst}
                        picType={picType}
                        format={format}
                        showMeasurements={showMeasurements}
                        isHardMode={isHardMode}
                        orientation={canvasConfig.orient}
                        setAnswer={this.setAnswer}
                        newPic={newPic}
                        animate={animate}
                        sliderSpeed={speedSliderValue}
                        resetCallback={this.pauseAnimate}
                        animateCallback={this.startAnimate}
                        dataStyle={dataStyle}
                    />
                </Suspense>  

                <Suspense fallback={<div>Loading...</div>}>
                    <VersionInfo/>
                </Suspense>
            </div>
        )
    }   
}