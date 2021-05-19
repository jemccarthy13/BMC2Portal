import { shallow } from "enzyme"
import React from "react"
import { SensorType } from "../classes/aircraft/datatrail/sensortype"
import { FORMAT } from "../classes/supportedformats"
import { BlueInThe, PictureCanvasProps } from "./canvastypes"

import ParrotSourCanvas from "./parrotsourcanvas"
import DrawingCanvas from "./drawingcanvas"
import { PicAnimationHandler } from "../animation/picanimator"

const picAnimator = jest.mock("../animation/picanimator")
const animatorAnimate = jest.spyOn(PicAnimationHandler.prototype, "animate")
const animatorPause = jest.spyOn(PicAnimationHandler.prototype, "pauseFight")

const resetFn = jest.fn()

const canvas = document.createElement("canvas")
canvas.width = 10
canvas.height = 30
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!
ctx.fillStyle = "white"
ctx.fillRect(0, 0, 0, 0)

describe("ParrotSourCanvas", () => {
  const testProps: PictureCanvasProps = {
    format: FORMAT.ALSA,
    setAnswer: jest.fn(),
    sliderSpeed: 100,
    orientation: {
      height: 200,
      width: 200,
      orient: BlueInThe.SOUTH,
    },
    picType: "azimuth",
    braaFirst: true,
    dataStyle: SensorType.ARROW,
    showMeasurements: true,
    isHardMode: false,
    newPic: false,
    animate: true,
    animateCallback: jest.fn(),
    resetCallback: resetFn,
  }

  it("renders", () => {
    const wrapper = shallow(<ParrotSourCanvas {...testProps} />)
    expect(wrapper.find(DrawingCanvas)).toHaveLength(1)
  })

  it("does_nothing_no_context", () => {
    const wrapper = shallow(<ParrotSourCanvas {...testProps} />)
    expect(animatorAnimate).not.toHaveBeenCalled()
    expect(animatorPause).not.toHaveBeenCalled()
    wrapper.setProps({ animate: false })
    expect(animatorAnimate).not.toHaveBeenCalled()
    expect(animatorPause).not.toHaveBeenCalled()
  })

  it("handles_animation_toggled_false", () => {
    const wrapper = shallow(<ParrotSourCanvas {...testProps} />)
    wrapper.setState({ ctx })
    expect(animatorAnimate).not.toHaveBeenCalled()
    expect(animatorPause).not.toHaveBeenCalled()
    wrapper.setProps({ animate: false })
    expect(animatorAnimate).not.toHaveBeenCalled()
    expect(animatorPause).toHaveBeenCalled()
  })

  it("no_change_when_other_props_change", () => {
    const wrapper = shallow(<ParrotSourCanvas {...testProps} />)
    expect(wrapper.find(DrawingCanvas)).toHaveLength(1)
    expect(animatorAnimate).not.toHaveBeenCalled()
    expect(animatorPause).not.toHaveBeenCalled()
    wrapper.setProps({ isHardMode: true })
    expect(animatorAnimate).not.toHaveBeenCalled()
    expect(animatorPause).not.toHaveBeenCalled()
  })

  it("handles_animation_toggled_true", () => {
    const wrapper = shallow(<ParrotSourCanvas {...testProps} animate={false} />)
    wrapper.setState({ ctx, animateCanvas: "test" })
    expect(animatorAnimate).not.toHaveBeenCalled()
    expect(animatorPause).not.toHaveBeenCalled()
    wrapper.setProps({ animate: true })
    expect(animatorAnimate).toHaveBeenCalled()
    expect(animatorPause).not.toHaveBeenCalled()
  })

  it("no_change_when_no_previous_imagedata", () => {
    const wrapper = shallow(<ParrotSourCanvas {...testProps} animate={false} />)
    wrapper.setState({ ctx })
    expect(animatorAnimate).not.toHaveBeenCalled()
    expect(animatorPause).not.toHaveBeenCalled()
    wrapper.setProps({ animate: true })
    expect(animatorAnimate).not.toHaveBeenCalled()
    expect(animatorPause).not.toHaveBeenCalled()
  })
})
