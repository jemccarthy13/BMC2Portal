import React, { lazy, ReactElement, Suspense } from 'react'

import '../css/collapsible.css'
import '../css/select.css'
import '../css/slider.css'
import '../css/parrotsour.css'
import '../css/toggle.css'
import '../css/togglebuttongroup.css'

import { InterceptQT } from '../quicktips/interceptQT'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/core'

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const ParrotSourHeader = lazy(()=>import('../pscomponents/parrotsourheader'))
const ParrotSourControls = lazy(()=>import("../pscomponents/parrotsourcontrols"))

const PictureCanvas = lazy(()=>import('../canvas/picturecanvas'))
const VersionInfo = lazy(()=>import('../versioninfo'))

interface CanvasConfig {
    height: number,
    width: number,
    orient: string
}

interface PSPState {
    showMeasurements: boolean,
    isHardMode: boolean,
    speedSliderValue: number,
    canvasConfig: CanvasConfig,
    braaFirst: boolean,
    animate:boolean,
    newPic: boolean,
    picType: string
}

/**
 * A Component to display procedural control on an HTML5 canvas
 */
export default class ParrotSourProcedural extends React.PureComponent<Record<string,unknown>, PSPState> {

    constructor(props:Record<string,unknown>){
        super(props)
        this.state = {
            showMeasurements: true,
            isHardMode: false,
            speedSliderValue: 50,
            canvasConfig: {
                height: 500,
                width:800,
                orient:"EW"
            },
            braaFirst: true,
            newPic: false,
            animate: false,
            picType: "easy"
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
     * Called to display a new Picture
     */
    onNewPic = ():void =>{
        this.setState(prevState=>({newPic:!prevState.newPic}))
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

    getAnswer = ():string => {
        // TODO - return some helpful information about commands?
        return ""
    }

    handlePicTypeChange = (_event: React.MouseEvent<HTMLElement, MouseEvent>, value: any): void => {
        this.setState({picType: value})
    }

    render():ReactElement {
        const { canvasConfig, braaFirst } = this.state
        const { showMeasurements, isHardMode, animate, newPic, speedSliderValue } = this.state

        const { picType } = this.state
        return (
            <div>
                <Suspense fallback={<div>Loading...</div>} >
                    <ParrotSourHeader comp={<InterceptQT/>} getAnswer={this.getAnswer} />
                </Suspense>

                <hr />

                <ToggleButtonGroup 
                    value={picType}
                    exclusive
                    onChange={this.handlePicTypeChange}
                    classes={{
                        root: "buttongroup"
                    }}>
                    <ToggleButton value="easy"
                        classes={{
                            root: "muitoggle"
                    }}>
                        Easy
                    </ToggleButton>
                    <ToggleButton value="med"
                        classes={{
                            root: "muitoggle"
                    }}>
                        Med
                    </ToggleButton>
                    <ToggleButton value="hard"
                        classes={{
                            root: "muitoggle"
                    }}>
                        Hard
                    </ToggleButton>
                    {false && <ToggleButton value="insane">
                        XHard
                    </ToggleButton>}
                </ToggleButtonGroup>

                <Suspense fallback={<div/>} >    
                    <ParrotSourControls 
                        handleSliderChange={this.onSliderChange}
                        modifyCanvas={this.modifyCanvas}
                        braaChanged={this.onToggleMeasurements}
                        startAnimate={this.startAnimate}
                        pauseAnimate={this.pauseAnimate}
                    />
                </Suspense>  

                <br/>

                <Suspense fallback={<div/>} >
                    <PictureCanvas 
                        height={canvasConfig.height}
                        width={canvasConfig.width}
                        braaFirst={braaFirst}
                        picType="random"
                        format="alsa"
                        showMeasurements={showMeasurements}
                        isHardMode={isHardMode}
                        orientation={canvasConfig.orient}
                        // eslint-disable-next-line react/jsx-no-bind
                        setAnswer={()=>{ /* empty for now until removed */ }}
                        newPic={newPic}
                        animate={animate}
                        sliderSpeed={speedSliderValue}
                        resetCallback={this.pauseAnimate}
                        animateCallback={this.startAnimate}
                    />
                </Suspense>  

                <Suspense fallback={<div>Loading...</div>}>
                    <VersionInfo/>
                </Suspense>
            </div>
        )
    }   
}