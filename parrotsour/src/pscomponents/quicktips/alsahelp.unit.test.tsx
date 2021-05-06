import React from "react"
import { mount } from "enzyme"
import { AlsaHelp } from "./alsahelp"
import { DialogContent } from "@material-ui/core"

/**
 * All it has to do is show up (render) with some text.
 *
 * NOTE: This shallow test was done such that a developer
 * can add or remove help text. It doesn't matter what the
 * help text says, as long as it renders.
 *
 * This test should be updated if the help becomes stateful
 * or controlled.
 */
describe("ALSAHelp_Dialog", () => {
  it("renders", () => {
    const helpDialog = mount(<AlsaHelp />)
    expect(helpDialog.find(DialogContent)).toBeDefined()
    expect(helpDialog.text()).not.toEqual("")
  })
})
