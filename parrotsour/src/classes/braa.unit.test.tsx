import { BRAA } from "./braa"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const canvasSerializer = require("jest-canvas-snapshot-serializer")

expect.addSnapshotSerializer(canvasSerializer)

describe("BRAA Class", () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D

  beforeAll(() => {
    canvas = document.createElement("canvas")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ctx = canvas.getContext("2d")!
    canvas.height = 20
    canvas.width = 50
  })

  afterEach(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  })

  it("constructABraa", () => {
    const br = new BRAA(90, 20)
    expect(br.bearing).toEqual("090")
    expect(br.range).toEqual(20)
    expect(br.bearingNum).toEqual(90)
  })

  it("BraaToString", () => {
    const br = new BRAA(90, 20)
    expect(br.toString()).toEqual("090/20")
  })

  it("drawsCorrectly", () => {
    const br = new BRAA(90, 20)
    br.draw(ctx, 10, 10, "black", true)
    expect(canvas).toMatchSnapshot()
  })

  it("drawsOnlyOnShowMeasurements", () => {
    const br = new BRAA(90, 20)
    br.draw(ctx, 10, 10, "black", false)
    expect(canvas).toMatchSnapshot()
  })
})
