import { mount, ReactWrapper } from "enzyme"
import React from "react"
import ParrotSourControls, { PSCProps } from "./parrotsourcontrols"

const fakeProps: PSCProps = {
  handleSliderChange: jest.fn(),
  startAnimate: jest.fn(),
  pauseAnimate: jest.fn(),
  displayFirstChanged: jest.fn(),
  modifyCanvas: jest.fn(),
  handleDataStyleChange: jest.fn(),
}

describe("ParrotSourControls", () => {
  let wrapper: ReactWrapper

  beforeEach(() => {
    wrapper = mount(<ParrotSourControls {...fakeProps} />)
  })

  it("alerts_parent_animate_start", () => {
    const fightsOn = wrapper.find("#fightsOnBtn")
    expect(fightsOn).toHaveLength(1)
    const animateSpy = jest.spyOn(fakeProps, "startAnimate")
    fightsOn.simulate("click")
    expect(animateSpy).toHaveBeenCalledTimes(1)
  })

  it("alerts_parent_animate_pause", () => {
    const pause = wrapper.find("#pauseBtn")
    expect(pause).toHaveLength(1)
    const pauseSpy = jest.spyOn(fakeProps, "pauseAnimate")
    pause.simulate("click")
    expect(pauseSpy).toHaveBeenCalledTimes(1)
  })

  it("alerts_parent_animate_speed_change", () => {
    const speedSlider = wrapper.find("#speedSlider")
    expect(speedSlider).toHaveLength(1)
    const pauseSpy = jest.spyOn(fakeProps, "handleSliderChange")
    //pauseBtn.simulate("click")
    wrapper.setState({ speedSliderValue: 1 })
    speedSlider.simulate("change", speedSlider)
    expect(pauseSpy).toHaveBeenCalledTimes(1)
    expect(pauseSpy).toHaveBeenCalledWith(1)
  })

  it("alerts_parent_datastyle_change", () => {
    const dsToggle = wrapper.find("#dataTrailToggle")
    expect(dsToggle).toHaveLength(1)
    const dsChangeSpy = jest.spyOn(fakeProps, "handleDataStyleChange")
    dsToggle.simulate("change", dsToggle)
    expect(dsChangeSpy).toHaveBeenCalledTimes(1)
  })

  it("alerts_parent_displayfirst_change", () => {
    const disFirstToggle = wrapper.find("#cursordispToggle")
    expect(disFirstToggle).toHaveLength(1)
    const disFirstSpy = jest.spyOn(fakeProps, "displayFirstChanged")
    disFirstToggle.simulate("change", disFirstToggle)
    expect(disFirstSpy).toHaveBeenCalledTimes(1)
  })

  it("displays_help_for_disp_first_toggle", () => {
    console.warn(
      "05/07/2021- Surpressing external usage of console.error\r\n" +
        "Use '(test command) --silent' to turn off all console messages."
    )
    jest.spyOn(console, "error").mockImplementation()
    const disFirstHelpBtn = wrapper.find("#btnDisplayFirstHelp")
    expect(disFirstHelpBtn).toHaveLength(1)
    let helpDialog = wrapper.find("#dispFirstHelpDialog").get(0)
    expect(helpDialog.props.open).toEqual(false)
    disFirstHelpBtn.simulate("click")
    wrapper.update()
    helpDialog = wrapper.find("#dispFirstHelpDialog").get(0)
    expect(helpDialog.props.open).toEqual(true)
  })

  it("displays_help_for_datatrail_toggle", () => {
    console.warn(
      "05/07/2021- Surpressing external usage of console.error\r\n" +
        "Use '(test command) --silent' to turn off all console messages."
    )
    jest.spyOn(console, "error").mockImplementation()
    const disFirstHelpBtn = wrapper.find("#btnDisplayDatatrailHelp")
    expect(disFirstHelpBtn).toHaveLength(1)
    let helpDialog = wrapper.find("#datatrailHelpDialog").get(0)
    expect(helpDialog.props.open).toEqual(false)
    disFirstHelpBtn.simulate("click")
    wrapper.update()
    helpDialog = wrapper.find("#datatrailHelpDialog").get(0)
    expect(helpDialog.props.open).toEqual(true)
  })
})
