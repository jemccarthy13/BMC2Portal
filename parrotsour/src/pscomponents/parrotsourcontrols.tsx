import React, { ChangeEvent, ReactElement } from 'react'

import {Dialog, DialogContent, DialogContentText} from '@material-ui/core'

interface PSCProps {
    handleSliderChange: {(val: number):void},
    startAnimate: {():void}
    pauseAnimate: {():void},
    braaChanged: {():void},
    modifyCanvas: {():void},
    handleDataStyleChange:{():void}
}

interface PSCState {
    speedSliderValue: number,
    showHelpText: boolean
}

/**
 * 'Basic' controls for the ParrotSour pictures.
 * 
 * Includes:
 * - Play/Pause
 * - Speed Slider
 * - Orientation toggle
 * - BRAA/Bull first toggle
 */
export default class ParrotSourControls extends React.PureComponent<PSCProps, PSCState> {

    constructor(props:PSCProps){
        super(props)
        this.state = {
            speedSliderValue: 50,
            showHelpText: false,
        }
    }

    /**
     * Called when the slider changes speed
     * @param evt - a ChangeEvent containing the new speed value
     */
    handleSliderChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        const val = parseInt(evt.currentTarget.value)
        this.setState({speedSliderValue: val})

        const {handleSliderChange} = this.props
        handleSliderChange(val)
    }

    /**
     * Called to start the animation
     */
    handleFightsOn = ():void => {
        const {startAnimate} = this.props
        startAnimate()
    }

    /**
     * Called to stop the animation
     */
    handlePauseFight = ():void =>{
        const {pauseAnimate} = this.props
        pauseAnimate()
    }

    /**
     * Toggle display of help text
     */
    handleToggleHelp = ():void => {
        this.setState(prevState=>({showHelpText: !prevState.showHelpText}))
    }

    /**
     * Close the help text dialog
     */
    handleHelpClose = ():void =>{
        this.setState({showHelpText: false})
    }

    /**
     * Handle data trail toggle
     */
    dataStyleChanged = ():void =>{
        this.props.handleDataStyleChange()
    }

    render(): ReactElement{
        const {speedSliderValue, showHelpText} = this.state
        const {modifyCanvas, braaChanged} = this.props
        return(
            <div>
                <div style={{display:"inline"}}>
                    <button type="button" id="fightsOn" style={{marginBottom:"20px",width:"100px", marginRight:"10px"}} onClick={this.handleFightsOn} >
                        Fights On
                    </button>
                    <button type="button" id="pause" style={{marginBottom:"20px", width:"100px"}} onClick={this.handlePauseFight}>
                        Pause
                    </button>
                    <div style={{display:"inline", marginLeft:"50px"}} className="slidecontainer">
                        <label htmlFor="speedSlider"> Animation Speed: </label>
                        <input 
                            type="range"
                            min="1"
                            max="100"
                            value={speedSliderValue}
                            className="slider-color"
                            id="speedSlider"
                            onChange={this.handleSliderChange} />
                    </div>
                </div>

                <br/>
                
                <div style={{display:"inline-flex", marginBottom:"10px"}}> 
                    <div>
                        <label style={{float:"left", paddingRight:"10px"}}> 
                            Orientation: 
                        </label>
                        <label className="switch">
                            <input type="checkbox" id="orientation" onChange={modifyCanvas} />
                            <span className="slider round"><span className="on">N/S</span><span className="off">E/W</span></span>
                        </label>
                    </div>
                    <div>
                        <label style={{float:"left", paddingLeft:"75px", paddingRight:"10px"}}> 
                            Display first: 
                        </label>
                        <label className="switch">
                            <input type="checkbox" id="cursordisp" defaultChecked onChange={braaChanged} />
                            <span className="slider round"><span className="on"> BRAA </span><span className="off"> BULL </span></span>
                        </label>
                        <button 
                            style={{padding:"0px", margin:"5px", float:"right"}}
                            className="helpicon"
                            id="btnDisplayAlert"
                            type="button"
                            onClick={this.handleToggleHelp}>
                                ?
                        </button>                
                        <Dialog
                            open={showHelpText}
                            onClose={this.handleHelpClose} >
                            <DialogContent>
                                <DialogContentText>
                                    The BULL/BRAA toggle will change the order of the bullseye and braa measurements on screen.
                                </DialogContentText>
                                <DialogContentText>
                                    BULL = ALT, BULL, BRAA
                                </DialogContentText>
                                <DialogContentText>
                                    BRAA = ALT, BRAA, BULL
                                </DialogContentText>
                                <DialogContentText>
                                    The ARROW/RADAR toggle changes the picture from arrows to radar trails.
                                </DialogContentText>
                            </DialogContent>
                        </Dialog>
                        <label style={{float:"left", paddingLeft:"75px", paddingRight:"10px"}}> 
                            Data Trail: 
                        </label>
                        <label className="switch">
                            <input type="checkbox" id="cursordisp" defaultChecked onChange={this.dataStyleChanged} />
                            <span className="slider round"><span className="on"> Arrow </span><span className="off"> Radar </span></span>
                        </label>
                    </div>
                </div>    
            </div>        
        )
    }
}
