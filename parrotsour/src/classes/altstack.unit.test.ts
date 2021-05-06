import { getAltStack } from "./altstack"
import { FORMAT } from "./supportedformats"

describe("AltStack", () => {
  it("formats_single_altitude_stacks", () => {
    const altStack = getAltStack([10], FORMAT.ALSA)
    expect(altStack.stack).toEqual("10k")
  })

  it("returns_single_alt_hi_>40", () => {
    const altStack = getAltStack([41], FORMAT.ALSA)
    expect(altStack.stack).toEqual("41k")
    expect(altStack.fillIns).toEqual("HIGH")
  })

  it("formats_double_altitude_stacks", () => {
    const altStack = getAltStack([20, 10], FORMAT.ALSA)
    expect(altStack.stack).toEqual("STACK 20k AND 10k")
    expect(altStack.fillIns).toEqual("")
  })

  it("returns_altitude_fillins", () => {
    const altStack = getAltStack([40, 38, 20], FORMAT.ALSA)
    expect(altStack.stack).toEqual("STACK 40k AND 20k")
    expect(altStack.fillIns).toEqual("2 HIGH 1 LOW") // ??? is it high > 40k
  })

  it("returns_altitude_fillins_3alts", () => {
    const altStack = getAltStack([30, 20, 10], FORMAT.ALSA)
    expect(altStack.stack).toEqual("STACK 30k 20k AND 10k")
    expect(altStack.fillIns).toEqual("")
  })
  it("returns_altitude_fillins_3alts_weighted", () => {
    const altStack = getAltStack([31, 30, 20, 10], FORMAT.ALSA)
    expect(altStack.stack).toEqual("STACK 31k 20k AND 10k")
    expect(altStack.fillIns).toEqual("2 HIGH 1 MEDIUM 1 LOW")
  })

  it("formats_altitude_stacks_ipe", () => {
    const altStack = getAltStack([10, 20], FORMAT.IPE)
    expect(altStack.stack).toEqual("STACK 20k 10k")
    expect(altStack.fillIns).toEqual("")
  })
})
