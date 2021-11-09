import { SensorType } from "../../../classes/aircraft/datatrail/sensortype"
import { AircraftGroup, GroupParams } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { PictureCanvasState } from "../../canvastypes"
import DrawAzimuth from "./azimuth"
import { testProps } from "./mockutils.unit.test"

let ctx: CanvasRenderingContext2D
let testState: PictureCanvasState
let p: Partial<GroupParams>
let azimuth: DrawAzimuth

beforeAll(() => {
  const canvas = document.createElement("canvas")
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ctx = canvas.getContext("2d")!
  canvas.width = 800
  canvas.height = 500

  testState = {
    bullseye: new Point(400, 400),
    blueAir: new AircraftGroup({ sx: 600, sy: 400, hdg: 270, nContacts: 4 }),
    answer: { pic: "2 grps az", groups: [] },
    reDraw: jest.fn(),
    ctx: ctx,
  }

  p = {
    ctx,
    dataTrailType: SensorType.ARROW,
    sx: 200,
    sy: 200,
    nContacts: 4,
    hdg: 90,
    alts: [20, 20, 20, 20],
  }

  azimuth = new DrawAzimuth()
  azimuth.initialize(ctx, testProps, testState)
})

/**
 * Test the azimuth picture drawer
 */
describe("DrawAzimuth", () => {
  it("hot_azimuth", () => {
    const ng = new AircraftGroup(p)
    const sg = new AircraftGroup({ ...p, sy: 250, alts: [15, 15, 15, 15] })

    azimuth.groups = [ng, sg]
    azimuth.drawInfo()

    expect(sg.getAltitudes()).toEqual([15, 15, 15, 15])

    expect(azimuth.getAnswer()).toEqual(
      "TWO GROUPS AZIMUTH 12 " +
        "SOUTH GROUP BULLSEYE 308/55, 15k HOSTILE HEAVY 4 CONTACTS " +
        "NORTH GROUP BULLSEYE 317/64, 20k HOSTILE HEAVY 4 CONTACTS"
    )
  })

  it("different_track_dirs_echelon", () => {
    const ng = new AircraftGroup(p)
    const sg = new AircraftGroup({
      ...p,
      sy: 250,
      hdg: 180,
      alts: [15, 15, 15, 15],
    })

    azimuth.groups = [ng, sg]
    azimuth.drawInfo()
    expect(azimuth.getAnswer()).toEqual(
      "TWO GROUPS AZIMUTH 7 OPENING ECHELON SOUTHWEST, " +
        "NORTH GROUP BULLSEYE 312/58, 20k TRACK EAST HOSTILE HEAVY 4 CONTACTS " +
        "SOUTH GROUP 15k TRACK SOUTH HOSTILE HEAVY 4 CONTACTS"
    )
  })

  it("different_track_dirs", () => {
    const ng = new AircraftGroup(p)
    const sg = new AircraftGroup({
      ...p,
      sx: 250,
      sy: 300,
      hdg: 180,
      alts: [15, 15, 15, 15],
    })

    azimuth.groups = [ng, sg]
    azimuth.drawInfo()
    expect(azimuth.getAnswer()).toEqual(
      "TWO GROUPS AZIMUTH 12 " +
        "SOUTH GROUP BULLSEYE 295/44, 15k TRACK SOUTH HOSTILE HEAVY 4 CONTACTS " +
        "NORTH GROUP BULLSEYE 305/53, 20k TRACK EAST HOSTILE HEAVY 4 CONTACTS"
    )
  })
})
