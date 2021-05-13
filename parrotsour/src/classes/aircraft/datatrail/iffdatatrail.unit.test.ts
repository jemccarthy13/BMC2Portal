import { Point } from "../../point"
import { IDMatrix } from "../id"
import { IFFDataTrail } from "./iffdatatrail"

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars
const canvasSerializer = require("jest-canvas-snapshot-serializer")

const canvas = document.createElement("canvas")
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ctx = canvas.getContext("2d")!

describe("IFFDataTrail", () => {
  it("draws_correctly", () => {
    const datatrail = new IFFDataTrail(new Point(50, 50), 90)
    datatrail.draw(ctx, 90, IDMatrix.FRIEND)
    expect(canvas).toMatchSnapshot()
  })

  it("doesnt_draw_hos_sus", () => {
    const datatrail = new IFFDataTrail(new Point(50, 50), 90)
    datatrail.draw(ctx, 90, IDMatrix.HOSTILE)
    datatrail.draw(ctx, 90, IDMatrix.SUSPECT)
    expect(canvas).toMatchSnapshot()
  })
})
