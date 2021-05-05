import { PIXELS_TO_NM } from "../utils/psmath"
import { Braaseye } from "./braaseye"
import { Point } from "./point"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const canvasSerializer = require("jest-canvas-snapshot-serializer")

expect.addSnapshotSerializer(canvasSerializer)

describe("Braaseye", () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D

  beforeAll(() => {
    canvas = document.createElement("canvas")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ctx = canvas.getContext("2d")!
    canvas.height = 50
    canvas.width = 100
  })

  afterEach(() => {
    canvas.height = 50
    canvas.width = 100
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  })

  const bluePos = new Point(10, 10)
  const bullseye = new Point(5, 10)
  const toPoint = new Point(20, 10)
  it("constructs_correctly", () => {
    const braaseye = new Braaseye(toPoint, bluePos, bullseye)
    expect(braaseye.braa.bearing).toEqual("090")
    expect(braaseye.braa.bearingNum).toEqual(90)
    expect(braaseye.braa.range).toEqual(Math.floor(10 / PIXELS_TO_NM))
    expect(braaseye.bull.bearing).toEqual("090")
    expect(braaseye.bull.bearingNum).toEqual(90)
    expect(braaseye.bull.range).toEqual(Math.floor(15 / PIXELS_TO_NM))
  })

  it("draws_correctly_noOffset", () => {
    const braaseye = new Braaseye(toPoint, bluePos, bullseye)
    braaseye.draw(ctx, true, true)
    expect(canvas).toMatchSnapshot()
  })

  it("draws_correctly_withOffset", () => {
    const braaseye = new Braaseye(toPoint, bluePos, bullseye)
    braaseye.draw(ctx, true, true, -10, 10)
    expect(canvas).toMatchSnapshot()
  })

  it("draws_correctly_braaFirst", () => {
    const braaseye = new Braaseye(toPoint, bluePos, bullseye)
    braaseye.draw(ctx, true, false, -10, 10)
    expect(canvas).toMatchSnapshot()
  })
})
