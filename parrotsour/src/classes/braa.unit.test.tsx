import { PaintBrush } from "../canvas/draw/paintbrush"
import { BRAA } from "./braa"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const canvasSerializer = require("jest-canvas-snapshot-serializer")

expect.addSnapshotSerializer(canvasSerializer)

describe("BRAA", () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D

  beforeAll(() => {
    canvas = document.createElement("canvas")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ctx = canvas.getContext("2d")!
    canvas.height = 20
    canvas.width = 50
    PaintBrush.use(ctx)
  })

  afterEach(() => {
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  })

  it("constructs_correctly", () => {
    const br = new BRAA(90, 20)
    expect(br.bearing).toEqual("090")
    expect(br.range).toEqual(20)
    expect(br.bearingNum).toEqual(90)
  })

  it("converts_to_pretty_string", () => {
    const br = new BRAA(90, 20)
    expect(br.toString()).toEqual("090/20")
  })

  it("draws_correctly", () => {
    const br = new BRAA(90, 20)
    br.draw(10, 10, "black", true)
    expect(canvas).toMatchSnapshot()
  })

  it("draws_only_when_showmeasure_true", () => {
    const br = new BRAA(90, 20)
    br.draw(10, 10, "black", false)
    expect(canvas).toMatchSnapshot()
  })
})
