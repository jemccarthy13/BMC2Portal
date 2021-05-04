import { mount } from "enzyme"
import React from "react"
import PSAlert from "./psalert"

describe("snackbar_test", () => {
  it("snackbar_shows_indefinite", () => {
    const testTxt = "hello world"

    PSAlert.success(testTxt)
    //expect(wrapper.find("#snackbar")).toBe(true)
    //console.log(sbar)
    //expect(sbar?.innerText).toContain(testTxt)
  })
})
