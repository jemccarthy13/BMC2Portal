import React, { ChangeEvent, ReactElement } from "react"

import {
  Dialog,
  DialogContent,
  DialogContentText,
  FormControlLabel,
} from "@material-ui/core"
import { IOSSwitch } from "./iosswitch"
import PSCookies from "../utils/pscookies"

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
  isBraaFirst: boolean
  dataStyleIsRadar: boolean
  isOrientNS: boolean
}

/**
 * 'Basic' controls for the ParrotSour pictures.
 *
 * TODO -- CONTROLS -- Consider breaking this file into smaller components
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

    this.state = {
      speedSliderValue: PSCookies.getSliderValue(),
      showHelpText: false,
      showHelpArrowText: false,
      isBraaFirst: PSCookies.getBraaFirst(),
      dataStyleIsRadar: PSCookies.getDataStyleIsRadar(),
      isOrientNS: PSCookies.getOrientNS(),
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
    PSCookies.setSliderValue(speedSliderValue)
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
    const { dataStyleIsRadar } = this.state
    this.setState({ dataStyleIsRadar: !dataStyleIsRadar })
    PSCookies.setDataStyleIsRadar(!dataStyleIsRadar)
    const { handleDataStyleChange } = this.props
    handleDataStyleChange()
  }

  handleDisplayFirstChanged = (): void => {
    const { isBraaFirst } = this.state
    this.setState({ isBraaFirst: !isBraaFirst })
    PSCookies.setBraaFirst(!isBraaFirst)
    const { displayFirstChanged } = this.props
    displayFirstChanged()
  }

  handleOrientationChange = (): void => {
    const { isOrientNS } = this.state
    this.setState({ isOrientNS: !isOrientNS })
    PSCookies.setOrientNS(!isOrientNS)
    const { modifyCanvas } = this.props
    modifyCanvas()
  }

  render(): ReactElement {
    const {
      speedSliderValue,
      showHelpText,
      showHelpArrowText,
      isBraaFirst,
      dataStyleIsRadar,
      isOrientNS,
    } = this.state
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
          <div style={{ display: "flex" }}>
            {/** TODO -- ORIENTATION -- Support 'blue in the' N/S/E/W */}
            <FormControlLabel
              control={
                <IOSSwitch
                  checked={isOrientNS}
                  onChange={this.handleOrientationChange}
                  name="Orientation"
                />
              }
              label="Orientation:"
              labelPlacement="start"
            />
            <div
              style={{
                width: "50px",
                margin: "auto",
                marginLeft: "15px",
                textAlign: "center",
              }}
            >
              {isOrientNS ? "N/S" : "E/W"}
            </div>
          </div>
          <div style={{ display: "inline-flex" }}>
            <FormControlLabel
              control={
                <IOSSwitch
                  id="cursordispToggle"
                  checked={isBraaFirst}
                  onChange={this.handleDisplayFirstChanged}
                  name="BRAA"
                />
              }
              label="Display First:"
              labelPlacement="start"
            />
            <div
              style={{
                width: "50px",
                margin: "auto",
                marginLeft: "15px",
                textAlign: "center",
              }}
            >
              {isBraaFirst ? "BRAA" : "BULL"}
            </div>
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
                  The BULL/BRAA toggle will change the order of the bullseye and
                  braa measurements on screen.
                </DialogContentText>
                <DialogContentText>BULL = ALT, BULL, BRAA</DialogContentText>
                <DialogContentText>BRAA = ALT, BRAA, BULL</DialogContentText>
              </DialogContent>
            </Dialog>
          </div>
          <div style={{ display: "inline-flex", marginLeft: "50px" }}>
            <FormControlLabel
              control={
                <IOSSwitch
                  id="dataTrailToggle"
                  checked={dataStyleIsRadar}
                  onChange={this.handleDataStyleChange}
                  name="DataTrail"
                />
              }
              label="Data Trail:"
              labelPlacement="start"
            />
            <div
              style={{
                width: "50px",
                margin: "auto",
                marginLeft: "15px",
                textAlign: "center",
              }}
            >
              {dataStyleIsRadar ? "Radar" : "Arrow"}
            </div>
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
    )
  }
}
