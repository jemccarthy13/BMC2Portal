import { mount } from "enzyme"
import React from "react"
import VersionInfo from "./versioninfo"

describe("VersionInfo", () => {
  it("has_version", () => {
    const wrapper = mount(<VersionInfo />)
    const vInfo = wrapper.find("#vInfo")
    expect(vInfo).toHaveLength(1)
    expect(vInfo.text().indexOf("Version")).not.toEqual(-1)
    expect(vInfo).toMatchSnapshot()
  })
})
