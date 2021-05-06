import { Dialog } from "@material-ui/core"
import React, { ReactElement } from "react"
import { FORMAT } from "../classes/supportedformats"
import { AlsaHelp } from "../pscomponents/quicktips/alsahelp"

type StdSelectorProps = {
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

  /**
   * Called when the ALSA quick tips dialog is closed
   */
  handleAlsaQTClose = (): void => {
    this.setState({ showAlsaQT: false })
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
              id="btnAlert"
              type="button"
              onClick={this.handleToggleAlsaQT}
            >
              ?
            </button>
          </li>
        </ul>

        <Dialog open={showAlsaQT} onClose={this.handleAlsaQTClose}>
          <AlsaHelp />
        </Dialog>
      </div>
    )
  }
}
