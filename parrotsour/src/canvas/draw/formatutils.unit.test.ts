import { formatAlt } from "./formatutils"

describe("FormatUtils", () => {
  it("formats_2digit_alt", () => {
    expect(formatAlt(2.7)).toEqual("027")
    expect(formatAlt(0.5)).toEqual("005")
  })

  it("formats_3digit_alt", () => {
    expect(formatAlt(20)).toEqual("200")
    expect(formatAlt(18.5)).toEqual("185")
    expect(formatAlt(18.3)).toEqual("183")
  })
})
