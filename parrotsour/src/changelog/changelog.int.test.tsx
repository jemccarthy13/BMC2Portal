import React from "react"
import { Accordion } from "@material-ui/core"
import { mount } from "enzyme"
import ChangeLog from "./changelog"

/**
 * I really don't care what the changelog looks like, as long as it renders something.
 */
describe("ChangeLog", () => {
  it("renders_with_children", () => {
    const wrapper = mount(<ChangeLog />)
    expect(wrapper.find(Accordion)).toBeDefined()
  })
})
