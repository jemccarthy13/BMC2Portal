/* eslint-disable react/forbid-component-props */
import {
  Dialog,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@material-ui/core"
import React, { ReactElement } from "react"
import { FORMAT } from "../../classes/supportedformats"
import { AlsaHelp } from "../quicktips/alsahelp"

export type StdSelectorProps = {
  selectionChanged: (val: FORMAT) => () => void
}

type StdSelectorState = {
  showAlsaQT: boolean
}

export default class StandardSelector extends React.PureComponent<
  StdSelectorProps,
  StdSelectorState
> {
  constructor(props: StdSelectorProps) {
    super(props)
    this.state = {
      showAlsaQT: false,
    }
  }

  /**
   * Toggle the quick tips dialog for ALSA help
   */
  handleToggleAlsaQT = (): void => {
    this.setState((prevState) => ({ showAlsaQT: !prevState.showAlsaQT }))
  }

  render(): ReactElement {
    const { selectionChanged } = this.props
    const { showAlsaQT } = this.state
    return (
      <div className="pscontainer">
        <h2>
          <u>Select Standard</u>
        </h2>
        <ul>
          <li>
            <input
              type="radio"
              id="ipe"
              name="format"
              value="ipe"
              onChange={selectionChanged(FORMAT.IPE)}
            />
            <label htmlFor="ipe">3-3 IPE</label>
            <div className="check" />
          </li>
          <li>
            <input
              type="radio"
              id="alsa"
              name="format"
              value="alsa"
              defaultChecked
              onChange={selectionChanged(FORMAT.ALSA)}
            />
            <label htmlFor="alsa">ALSA ACC </label>
            <div className="check" />
            <button
              style={{ padding: "0px" }}
              className="helpicon"
              id="alsaQTBtn"
              type="button"
              onClick={this.handleToggleAlsaQT}
            >
              ?
            </button>
          </li>
        </ul>

        <Dialog open={showAlsaQT} onClose={this.handleToggleAlsaQT}>
          <DialogTitle
            disableTypography
            style={{ paddingBottom: "5px", borderBottom: "1px solid black" }}
          >
            <h2>ALSA</h2>
            <IconButton
              onClick={this.handleToggleAlsaQT}
              style={{
                position: "absolute",
                right: "20px",
                top: "10px",
                width: "fit-content",
              }}
            >
              X
            </IconButton>
            <DialogContentText>
              Download the pub&nbsp;
              <a target="_window" href="https://www.alsa.mil/MTTPs/ACC/">
                here!
              </a>
            </DialogContentText>
          </DialogTitle>
          <AlsaHelp />
        </Dialog>
      </div>
    )
  }
}
