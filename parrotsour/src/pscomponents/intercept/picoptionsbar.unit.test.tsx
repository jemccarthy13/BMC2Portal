import React from "react"
import { Select } from "@material-ui/core"
import { mount, ReactWrapper } from "enzyme"
import PicOptionsBar, { POBSelProps } from "./picoptionsbar"

const fakeProps: POBSelProps = {
  picType: "azimuth",
  handleChangePicType: jest.fn(),
  handleToggleHardMode: jest.fn(),
  handleToggleMeasurements: jest.fn(),
  handleNewPic: jest.fn(),
}

let wrapper: ReactWrapper

describe("PicOptionsBar", () => {
  beforeEach(() => {
    wrapper = mount(<PicOptionsBar {...fakeProps} />)
  })

  it("calls_selection_change", () => {
    const sel = wrapper.find(Select).find("input")
    expect(sel).toBeDefined()

    let myVal = "az"
    jest
      .spyOn(fakeProps, "handleChangePicType")
      .mockImplementationOnce((val) => {
        console.log(val)
        myVal = val.target.value as string
      })
    sel.simulate("change", { target: { value: "wall" } })

    expect(myVal).toEqual("wall")
  })

  it("calls_showmeasure_change", () => {
    const measure = wrapper.find("#measureMyself")
    expect(measure).toBeDefined()
    const measureSpy = jest.spyOn(fakeProps, "handleToggleMeasurements")
    measure.simulate("change")
    expect(measureSpy).toHaveBeenCalledTimes(1)
  })

  it("calls_hardmode_change", () => {
    const hardMode = wrapper.find("#hardMode")
    expect(hardMode).toBeDefined()
    const measureSpy = jest.spyOn(fakeProps, "handleToggleHardMode")
    hardMode.simulate("change")
    expect(measureSpy).toHaveBeenCalledTimes(1)
  })

  it("calls_newpic_change", () => {
    const newPicBtn = wrapper.find("#newpicbtn")
    const newPicSpy = jest.spyOn(fakeProps, "handleNewPic")
    newPicBtn.simulate("click")
    expect(newPicSpy).toHaveBeenCalledTimes(1)
  })
})
