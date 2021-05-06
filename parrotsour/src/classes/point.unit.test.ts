const PIXELS_TO_NM = 4

// Come back to this to self-contain 100% coverage in unit tests
// // mock BRAA to self-contain intent tests
// const mockFn = jest.fn()
// jest.mock("./braa", () => {
//   return function (x: number, y: number) {
//     return {
//       x,
//       y,
//       getBR: mockFn,
//       getStraightDistanceNM: mockFn,
//     }
//   }
// })
// // // eslint-disable-next-line @typescript-eslint/no-var-requires
// // import { BRAA } from "./braa"
// jest.mock("./braa")

import { Point } from "./point"

import { BlueInThe } from "../canvas/canvastypes"

describe("point", () => {
  it("has_XY", () => {
    const p: Point = new Point(10, 10)
    expect(p.x).toEqual(10)
    expect(p.y).toEqual(10)
  })

  it("computs_BR_to_other_point", () => {
    const p: Point = new Point(10, 10)

    // p2 is directly West
    let p2: Point = new Point(20, 10)
    let br = p.getBR(p2)
    expect(br.range).toEqual(~~(10 / PIXELS_TO_NM))
    expect(br.bearingNum).toEqual(90)
    expect(br.bearing).toEqual("090")

    // p2 is directly West
    p2 = new Point(0, 10)
    br = p.getBR(p2)
    expect(br.range).toEqual(~~(10 / PIXELS_TO_NM))
    expect(br.bearingNum).toEqual(270)
    expect(br.bearing).toEqual("270")

    // y = 0 is actually the north of the canvas;
    // canvas Point (0,0) is the top left corner
    // p2 is directly North
    p2 = new Point(10, 0)
    br = p.getBR(p2)
    expect(br.range).toEqual(~~(10 / PIXELS_TO_NM))
    expect(br.bearingNum).toEqual(360)
    expect(br.bearing).toEqual("360")

    // p2 is directly South
    p2 = new Point(10, 20)
    br = p.getBR(p2)
    expect(br.range).toEqual(~~(10 / PIXELS_TO_NM))
    expect(br.bearingNum).toEqual(180)
    expect(br.bearing).toEqual("180")

    // p2 is NorthEast
    p2 = new Point(15, 5)
    br = p.getBR(p2)
    expect(br.range).toEqual(~~(5 / PIXELS_TO_NM))
    expect(br.bearingNum).toEqual(45)
    expect(br.bearing).toEqual("045")

    // p2 is SouthEast
    p2 = new Point(15, 15)
    br = p.getBR(p2)
    expect(br.range).toEqual(~~(5 / PIXELS_TO_NM))
    expect(br.bearingNum).toEqual(135)
    expect(br.bearing).toEqual("135")

    // p2 is NorthWest
    p2 = new Point(5, 15)
    br = p.getBR(p2)
    expect(br.range).toEqual(~~(5 / PIXELS_TO_NM))
    expect(br.bearingNum).toEqual(225)
    expect(br.bearing).toEqual("225")

    // p2 is SouthWest
    p2 = new Point(5, 5)
    br = p.getBR(p2)
    expect(br.range).toEqual(~~(5 / PIXELS_TO_NM))
    expect(br.bearingNum).toEqual(315)
    expect(br.bearing).toEqual("315")
  })

  it("computes_straight_distance_NM_to_other_point", () => {
    const p: Point = new Point(100, 100)
    const p2: Point = new Point(52, 76)
    let dist = p.straightDistNM(p2, BlueInThe.NORTH)
    expect(dist).toEqual(~~(24 / PIXELS_TO_NM))

    dist = p.straightDistNM(p2, BlueInThe.SOUTH)
    expect(dist).toEqual(~~(24 / PIXELS_TO_NM))

    dist = p.straightDistNM(p2, BlueInThe.EAST)
    expect(dist).toEqual(~~(48 / PIXELS_TO_NM))

    dist = p.straightDistNM(p2, BlueInThe.WEST)
    expect(dist).toEqual(~~(48 / PIXELS_TO_NM))
  })
})
