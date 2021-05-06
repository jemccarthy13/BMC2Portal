import { mount } from "enzyme"
import React from "react"
import IssueSelector from "./issueselector"

const mockChangeFn = jest.fn(() => {
  return jest.fn()
})

describe("IssueSelector_Component", () => {
  afterEach(() => {
    mockChangeFn.mockClear()
  })

  it("renders_picprob_default_checked", () => {
    const selWrapper = mount(<IssueSelector selectionChanged={mockChangeFn} />)
    expect(selWrapper.find("#picprob").props().value).toEqual("picprob")
    expect(selWrapper).toMatchSnapshot()
  })

  it("alerts_parent_only_when_sel_changes", () => {
    const selWrapper = mount(<IssueSelector selectionChanged={mockChangeFn} />)
    selWrapper.find("#othprob").simulate("change")
    expect(mockChangeFn).toHaveBeenCalledTimes(1)
    expect(mockChangeFn).toHaveBeenCalledWith("othprob")

    selWrapper.find("#picprob").simulate("change")
    expect(mockChangeFn).toHaveBeenCalledTimes(2)
    expect(mockChangeFn).toHaveBeenCalledWith("picprob")

    selWrapper.find("#feature").simulate("change")
    expect(mockChangeFn).toHaveBeenCalledTimes(3)
    expect(mockChangeFn).toHaveBeenCalledWith("feature")

    selWrapper.find("#feature").simulate("change")
    expect(mockChangeFn).toHaveBeenCalledTimes(3)
  })
})
