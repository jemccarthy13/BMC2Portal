/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react"

import { mount } from "enzyme"
import { FORMAT } from "../classes/supportedformats"
import PictureCanvas from "./picturecanvas"
import { SensorType } from "../classes/aircraft/datatrail/sensortype"
import { BlueInThe, PictureCanvasProps } from "./canvastypes"
import { PaintBrush } from "./draw/paintbrush"

import { PicAnimationHandler } from "../animation/picanimator"
import { Point } from "../classes/point"

const picAnimator = jest.mock("../animation/picanimator")
const animatorAnimate = jest.spyOn(PicAnimationHandler.prototype, "animate")
const animatorPause = jest.spyOn(PicAnimationHandler.prototype, "pauseFight")

const resetFn = jest.fn()

describe("PictureCanvas", () => {
  beforeAll(() => {
    jest.spyOn(global.console, "warn").mockImplementation()
  })

  afterEach(() => {
    animatorAnimate.mockReset()
    animatorPause.mockReset()
  })

  const testProps: PictureCanvasProps = {
    picType: "azimuth",
    format: FORMAT.ALSA,
    setAnswer: jest.fn(),
    resetCallback: resetFn,
    sliderSpeed: 100,
    braaFirst: true,
    showMeasurements: true,
    dataStyle: SensorType.ARROW,
    isHardMode: false,
    newPic: false,
    animate: false,
    animateCallback: jest.fn(),
    orientation: {
      height: 200,
      width: 200,
      orient: BlueInThe.EAST,
    },
  }

  it("full_renders_mouse_and_pic_canvas", () => {
    const wrapper = mount(<PictureCanvas {...testProps} />)
    expect(wrapper.find("canvas")).toHaveLength(2)
  })

  it("renders_blueinthe_north", () => {
    const wrapper = mount(
      <PictureCanvas
        {...testProps}
        picType="random"
        orientation={{
          height: 200,
          width: 200,
          orient: BlueInThe.NORTH,
        }}
      />
    )
    expect(wrapper.find("canvas")).toHaveLength(2)
  })

  it("renders_leadedge_forced", () => {
    const wrapper = mount(<PictureCanvas {...testProps} />)
    expect(wrapper.find("canvas")).toHaveLength(2)
    const instance = wrapper.instance() as PictureCanvas
    instance.drawPicture(PaintBrush.getContext(), true)
  })

  it("stops_animate_when_hardmode_changed", () => {
    const wrapper = mount(<PictureCanvas {...testProps} />)
    wrapper.setProps({ isHardMode: true })
    wrapper.update()
    expect(resetFn).toHaveBeenCalled()
  })

  it("stops_animate_when_picType_changed", () => {
    const wrapper = mount(<PictureCanvas {...testProps} />)
    wrapper.setProps({ picType: "range" })
    wrapper.update()
    expect(resetFn).toHaveBeenCalled()
  })

  it("stops_animate_when_orientation_changed", () => {
    const wrapper = mount(<PictureCanvas {...testProps} />)
    wrapper.setProps({
      orientation: { height: 100, width: 100, orient: BlueInThe.WEST },
    })
    wrapper.update()
    expect(resetFn).toHaveBeenCalled()
  })

  it("pause_animate_has_no_reset", () => {
    const wrapper = mount(
      <PictureCanvas {...testProps} resetCallback={undefined} />
    )
    wrapper.setProps({
      orientation: { height: 100, width: 100, orient: BlueInThe.WEST },
    })
    wrapper.update()
    expect(resetFn).not.toHaveBeenCalled()
  })

  it("no_pause_and_resume_animate_if_no_animte", () => {
    const wrapper = mount(
      <PictureCanvas {...testProps} resetCallback={undefined} animate={false} />
    )
    const mockDraw = jest.fn()
    jest.mock("../classes/groups/group")
    wrapper.setState({
      answer: {
        groups: [
          {
            draw: mockDraw,
            getCenterOfMass: () => {
              return new Point(50, 50)
            },
            getAltitudes: () => {
              return [50]
            },
            move: jest.fn(),
            doesManeuvers: jest.fn(),
          },
        ],
        pic: "2 grps az",
      },
    })
    wrapper.setProps({
      showMeasurements: false,
    })
    wrapper.update()
    expect(resetFn).not.toHaveBeenCalled()
    expect(mockDraw).toHaveBeenCalled()
    expect(animatorAnimate).not.toHaveBeenCalled()
    expect(animatorPause).not.toHaveBeenCalled()
  })

  it("pause_and_resume_animate", () => {
    const wrapper = mount(
      <PictureCanvas {...testProps} resetCallback={undefined} animate />
    )
    const mockDraw = jest.fn()
    jest.mock("../classes/groups/group")
    wrapper.setState({
      answer: {
        groups: [
          {
            draw: mockDraw,
            getCenterOfMass: () => {
              return new Point(50, 50)
            },
            getAltitudes: () => {
              return [50]
            },
            move: jest.fn(),
            doesManeuvers: jest.fn(),
          },
        ],
        pic: "2 grps az",
      },
    })
    wrapper.setProps({
      showMeasurements: false,
    })
    wrapper.update()
    expect(resetFn).not.toHaveBeenCalled()
    expect(mockDraw).toHaveBeenCalled()
    expect(animatorAnimate).toHaveBeenCalled()
    expect(animatorPause).toHaveBeenCalled()
  })
})
