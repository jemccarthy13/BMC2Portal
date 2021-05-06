import React from "react"
import { mount } from "enzyme"
import { PsQT } from "./psQT"
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
describe("PsQT_Dialog", () => {
  it("renders", () => {
    const helpDialog = mount(<PsQT />)
    expect(helpDialog.find(DialogContent)).toBeDefined()
    expect(helpDialog.text()).not.toEqual("")
  })
})
