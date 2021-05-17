import React from "react"

import { mount } from "enzyme"
import { FORMAT } from "../classes/supportedformats"
import PictureCanvas from "./picturecanvas"
import { SensorType } from "../classes/aircraft/datatrail/sensortype"
import { BlueInThe } from "./canvastypes"

describe("PictureCanvas", () => {
  it("full_renders", () => {
    const wrapper = mount(
      <PictureCanvas
        format={FORMAT.ALSA}
        setAnswer={jest.fn()}
        sliderSpeed={100}
        picType="azimuth"
        braaFirst
        showMeasurements
        dataStyle={SensorType.ARROW}
        isHardMode={false}
        newPic
        animate
        animateCallback={jest.fn()}
        orientation={{
          height: 200,
          width: 200,
          orient: BlueInThe.NORTH,
        }}
      />
    )
    expect(wrapper.find("canvas")).toHaveLength(2)
  })
})
