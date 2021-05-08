import { MenuItem, Select } from "@material-ui/core"
import React, { ChangeEvent, ReactElement } from "react"

export type POBSelProps = {
  picType: string
  handleChangePicType: (
    e: ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => void
  handleToggleMeasurements: () => void
  handleToggleHardMode: () => void
  handleNewPic: () => void
}

/**
 * Functional component to select and toggles related to picture generation.
 */
const PicOptionsBar = (props: POBSelProps): ReactElement => {
  const { picType, handleChangePicType } = props
  const { handleToggleHardMode, handleToggleMeasurements, handleNewPic } = props
  return (
    <div style={{ display: "flex" }}>
      <div className="custom-sel-div">
        <Select
          // eslint-disable-next-line react/forbid-component-props
          className="parrotsoursel"
          autoWidth
          labelId="picSelLabel"
          id="pictureType"
          value={picType}
          onChange={handleChangePicType}
        >
          <MenuItem value="random">Select Picture</MenuItem>
          <MenuItem value="random">RANDOM</MenuItem>
          <MenuItem value="azimuth">AZIMUTH</MenuItem>
          <MenuItem value="range">RANGE</MenuItem>
          <MenuItem value="wall">WALL</MenuItem>
          <MenuItem value="ladder">LADDER</MenuItem>
          <MenuItem value="champagne">CHAMPAGNE</MenuItem>
          <MenuItem value="vic">VIC</MenuItem>
          <MenuItem value="cap">CAP</MenuItem>
          <MenuItem value="leading edge">LEADING EDGE</MenuItem>
          <MenuItem value="package">PACKAGES</MenuItem>
          <MenuItem value="threat">THREAT</MenuItem>
          <MenuItem value="ea">EA / BOGEY DOPE</MenuItem>
          <MenuItem value="pod">PICTURE OF THE DAY</MenuItem>
        </Select>
      </div>
      <button
        type="button"
        id="newpicbtn"
        style={{ height: "min-content", width: "25%", marginBottom: "20px" }}
        onClick={handleNewPic}
      >
        New Pic
      </button>

      <div
        className="check-container"
        style={{ paddingTop: "0px", paddingBottom: "0px" }}
      >
        <ul style={{ display: "inline-flex" }}>
          <li>
            <input
              type="checkbox"
              id="measureMyself"
              onChange={handleToggleMeasurements}
            />
            <label
              style={{ width: "max-content", paddingRight: "10px" }}
              htmlFor="measureMyself"
            >
              I want to measure
            </label>
            <div className="box" />
          </li>
          <li>
            <input
              type="checkbox"
              id="hardMode"
              onChange={handleToggleHardMode}
            />
            <label style={{ paddingRight: "10px" }} htmlFor="hardMode">
              {" "}
              Hard Mode
            </label>
            <div className="box" />
          </li>
        </ul>
      </div>
    </div>
  )
}

export default PicOptionsBar
