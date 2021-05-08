import { shallow, ShallowWrapper } from "enzyme"
import React from "react"
import IssueReport from "./issues/issuereport"
import ParrotSourHeader from "./parrotsourheader"

describe("ParrotSourHeader", () => {
  let wrapper: ShallowWrapper
  beforeEach(() => {
    wrapper = shallow(
      <ParrotSourHeader answer={{ pic: "2 GROUPS AZ", groups: [] }} />
    )
  })

  it("handles_show_quick_tips", () => {
    const qtBtn = wrapper.find("#quickTipBtn")
    let dialog = wrapper.find("#quickTipDialog")
    expect(dialog).toHaveLength(0)
    qtBtn.simulate("click")
    wrapper.update()
    dialog = wrapper.find("#quickTipDialog")
    expect(dialog.get(0).props.open).toEqual(true)
  })

  it("renders_issuereport_control", () => {
    const issReport = wrapper.find(IssueReport)
    expect(issReport).toHaveLength(1)
  })
})
