import React, { ChangeEvent, ReactElement } from "react"

import { Dialog, DialogContent, DialogContentText } from "@material-ui/core"
import { Cookies } from "react-cookie-consent"

export interface PSCProps {
  handleSliderChange: { (val: number): void }
  startAnimate: { (): void }
  pauseAnimate: { (): void }
  displayFirstChanged: { (): void }
  modifyCanvas: { (): void }
  handleDataStyleChange: { (): void }
}

interface PSCState {
  speedSliderValue: number
  showHelpText: boolean
  showHelpArrowText: boolean
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
export default class ParrotSourControls extends React.PureComponent<
  PSCProps,
  PSCState
> {
  constructor(props: PSCProps) {
    super(props)
    let savedSliderVal = parseInt(Cookies.get("SavedSpeedSlider"))
    if (Number.isNaN(savedSliderVal)) {
      savedSliderVal = 50
    }
    this.state = {
      speedSliderValue: savedSliderVal,
      showHelpText: false,
      showHelpArrowText: false,
    }
  }

  /**
   * Called when the slider changes speed
   * @param evt - a ChangeEvent containing the new speed value
   */
  handleSliderChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    const val = parseInt(evt.currentTarget.value)
    this.setState({ speedSliderValue: val })

    const { handleSliderChange } = this.props
    handleSliderChange(val)
  }

  handleSliderMouseUp = (): void => {
    const { speedSliderValue } = this.state
    Cookies.set("SavedSpeedSlider", speedSliderValue)
  }

  /**
   * Called to start the animation
   */
  handleFightsOn = (): void => {
    const { startAnimate } = this.props
    startAnimate()
  }

  /**
   * Called to stop the animation
   */
  handlePauseFight = (): void => {
    const { pauseAnimate } = this.props
    pauseAnimate()
  }

  /**
   * Toggle display of help text
   */
  handleToggleHelp = (): void => {
    this.setState((prevState) => ({ showHelpText: !prevState.showHelpText }))
  }

  /**
   * Toggle display of help text
   */
  handleToggleArrowHelp = (): void => {
    this.setState((prevState) => ({
      showHelpArrowText: !prevState.showHelpArrowText,
    }))
  }

  /**
   * Handle data trail toggle
   */
  handleDataStyleChange = (): void => {
    const { handleDataStyleChange } = this.props
    handleDataStyleChange()
  }

  render(): ReactElement {
    const { speedSliderValue, showHelpText, showHelpArrowText } = this.state
    const { modifyCanvas, displayFirstChanged } = this.props
    return (
      <div>
        <div style={{ display: "inline" }}>
          <button
            type="button"
            id="fightsOnBtn"
            style={{
              marginBottom: "20px",
              width: "100px",
              marginRight: "10px",
            }}
            onClick={this.handleFightsOn}
          >
            Fights On
          </button>
          <button
            type="button"
            id="pauseBtn"
            style={{ marginBottom: "20px", width: "100px" }}
            onClick={this.handlePauseFight}
          >
            Pause
          </button>
          <div
            style={{ display: "inline", marginLeft: "50px" }}
            className="slidecontainer"
          >
            <label htmlFor="speedSlider"> Animation Speed: </label>
            <input
              type="range"
              min="1"
              max="100"
              value={speedSliderValue}
              className="slider-color"
              id="speedSlider"
              onChange={this.handleSliderChange}
              onMouseUp={this.handleSliderMouseUp}
            />
          </div>
        </div>

        <br />

        <div style={{ display: "inline-flex", marginBottom: "10px" }}>
          <div>
            <label style={{ float: "left", paddingRight: "10px" }}>
              Orientation:
            </label>
            <label className="switch">
              <input type="checkbox" id="orientation" onChange={modifyCanvas} />
              <span className="slider round">
                <span className="on">N/S</span>
                <span className="off">E/W</span>
              </span>
            </label>
          </div>
          <div style={{ display: "inline-flex" }}>
            <div style={{ display: "inline-flex" }}>
              <label
                style={{
                  float: "left",
                  paddingLeft: "75px",
                  paddingRight: "10px",
                }}
              >
                Display first:
              </label>
              <label className="switch">
                <input
                  type="checkbox"
                  id="cursordispToggle"
                  onChange={displayFirstChanged}
                />
                <span className="slider round">
                  <span className="on"> BRAA </span>
                  <span className="off"> BULL </span>
                </span>
              </label>
              <button
                style={{ padding: "0px", margin: "5px", float: "right" }}
                className="helpicon"
                id="btnDisplayFirstHelp"
                type="button"
                onClick={this.handleToggleHelp}
              >
                ?
              </button>
              <Dialog
                id="dispFirstHelpDialog"
                open={showHelpText}
                onClose={this.handleToggleHelp}
              >
                <DialogContent>
                  <DialogContentText>
                    The BULL/BRAA toggle will change the order of the bullseye
                    and braa measurements on screen.
                  </DialogContentText>
                  <DialogContentText>BULL = ALT, BULL, BRAA</DialogContentText>
                  <DialogContentText>BRAA = ALT, BRAA, BULL</DialogContentText>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <label
                style={{
                  float: "left",
                  paddingLeft: "75px",
                  paddingRight: "10px",
                }}
              >
                Data Trail:
              </label>
              <label className="switch">
                <input
                  type="checkbox"
                  id="dataTrailToggle"
                  defaultChecked
                  onChange={this.handleDataStyleChange}
                />
                <span className="slider round">
                  <span className="on"> Arrow </span>
                  <span className="off"> Radar </span>
                </span>
              </label>
              <button
                style={{ padding: "0px", margin: "5px", float: "right" }}
                className="helpicon"
                id="btnDisplayDatatrailHelp"
                type="button"
                onClick={this.handleToggleArrowHelp}
              >
                ?
              </button>
              <Dialog
                id="datatrailHelpDialog"
                open={showHelpArrowText}
                onClose={this.handleToggleArrowHelp}
              >
                <DialogContent>
                  <DialogContentText>
                    The ARROW/RADAR toggle changes the picture from arrows to
                    radar trails.
                  </DialogContentText>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
