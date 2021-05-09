import React from "react"
import { mount, ReactWrapper } from "enzyme"
import StandardSelector, { StdSelectorProps } from "./standardselector"
import { FORMAT } from "../../classes/supportedformats"
import { Dialog } from "@material-ui/core"

describe("StandardSelector", () => {
  const mockSelChg = jest.fn()
  const fakeProps: StdSelectorProps = {
    selectionChanged: () => mockSelChg,
  }

  let wrapper: ReactWrapper
  beforeEach(() => {
    wrapper = mount(<StandardSelector {...fakeProps} />)
  })

  it("handles_format_standard_change", () => {
    const ipe = wrapper.find("#ipe")
    expect(ipe).toBeDefined()
    let myVal = FORMAT.ALSA

    mockSelChg.mockImplementationOnce((val) => {
      myVal = val.format
    })

    ipe.simulate("change", { format: FORMAT.IPE })

    expect(myVal).toEqual(FORMAT.IPE)
  })

  it("handles_toggle_alsa_tips", () => {
    console.warn(
      "05/07/2021- Surpressing external usage of console.error\r\n" +
        "Use '(test command) --silent' to turn off all console messages."
    )
    jest.spyOn(console, "error").mockImplementation()

    const dialog = wrapper.find(Dialog)
    expect(dialog.prop("open")).toEqual(false)

    const qtBtn = wrapper.find("#alsaQTBtn")
    expect(qtBtn).toHaveLength(1)

    qtBtn.simulate("click")

    const dialogOpen = wrapper.find(Dialog)
    expect(dialogOpen.prop("open")).toEqual(true)
  })
})
