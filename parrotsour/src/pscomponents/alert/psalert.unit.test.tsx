import { mount } from "enzyme"
import React from "react"
import { act } from "react-dom/test-utils"

import GlobalAlertProvider from "./globalalertprovider"
import snackActions from "./psalert"

jest.setTimeout(10000)

beforeAll(() => {
  console.warn(
    "05/07/2021- Surpressing external usage of console.error\r\n" +
      "Use '(test command) --silent' to turn off all console messages."
  )
  jest.spyOn(console, "error").mockImplementation()
})

/**
 * For each of these snackbar tests; since the developer can override
 * styling and such, all I care about is that the message is 'displayed'
 * (i.e. correctly added to the DOM.)
 */
describe("snackbar_test", () => {
  it("snackbar_shows_default", async () => {
    const testTxt = "hello world"
    const wrapper = mount(
      <div id="root">
        <GlobalAlertProvider>
          <div />
        </GlobalAlertProvider>
      </div>,
      { attachTo: document.getElementById("root") }
    )
    snackActions.toast(testTxt)

    if (!wrapper) fail("Failed to mount.")
    expect(wrapper.text()).toEqual(testTxt)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 6000))
    })
    expect(wrapper?.text()).toEqual("")
  })

  it("snackbar_shows_indefinite", () => {
    const testTxt = "hello world"
    const wrapper = mount(
      <div id="root">
        <GlobalAlertProvider>
          <div />
        </GlobalAlertProvider>
      </div>,
      { attachTo: document.getElementById("root") }
    )
    snackActions.toast(testTxt, { persist: true })

    expect(wrapper.text()).toEqual(testTxt)
  })

  it("snackbar_programatically_closes", async () => {
    const testTxt = "hello world"
    const wrapper = mount(
      <div id="root">
        <GlobalAlertProvider>
          <div />
        </GlobalAlertProvider>
      </div>,
      { attachTo: document.getElementById("root") }
    )
    const key = snackActions.toast(testTxt, { persist: true })

    expect(wrapper.text()).toEqual(testTxt)

    snackActions.closeSnackbar(key)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 1500))
    })
    expect(wrapper.text()).toEqual("")
  })

  it("snackbar_closes_when_clicked", async () => {
    const testTxt = "hello world"
    const wrapper = mount(
      <div id="root">
        <GlobalAlertProvider>
          <div id="app" />
        </GlobalAlertProvider>
      </div>,
      { attachTo: document.getElementById("root") }
    )
    const key = snackActions.toast(testTxt, { persist: true })

    const dismissNot = wrapper.find(GlobalAlertProvider)
    const gap: GlobalAlertProvider = dismissNot.instance() as GlobalAlertProvider
    gap.dismissNotification(key)()

    await act(async () => {
      await new Promise((r) => setTimeout(r, 1500))
    })
    expect(wrapper.text()).toEqual("")
  })

  it("snackbar_stacks_custom_max", async () => {
    const testTxt = "hello world"
    const wrapper = mount(
      <div id="root">
        <GlobalAlertProvider maxSnack={10}>
          <div />
        </GlobalAlertProvider>
      </div>,
      { attachTo: document.getElementById("root") }
    )

    snackActions.success(testTxt, { persist: true })
    snackActions.error(testTxt, { persist: true })
    snackActions.warning(testTxt, { persist: true })
    snackActions.info(testTxt, { persist: true })
    snackActions.success(testTxt)
    snackActions.error(testTxt)
    snackActions.warning(testTxt)
    snackActions.info(testTxt)

    expect(wrapper.text()).toEqual(
      testTxt +
        testTxt +
        testTxt +
        testTxt +
        testTxt +
        testTxt +
        testTxt +
        testTxt
    )
  })
})
