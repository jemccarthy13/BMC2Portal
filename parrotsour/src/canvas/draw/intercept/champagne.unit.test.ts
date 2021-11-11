import { SensorType } from "../../../classes/aircraft/datatrail/sensortype"
import { AircraftGroup, GroupParams } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { BlueInThe, PictureCanvasState } from "../../canvastypes"
import { PaintBrush } from "../paintbrush"
import DrawChampange from "./champagne"
import { testProps } from "./mockutils.unit.test"

let testState: PictureCanvasState
let p: Partial<GroupParams>
let champ: DrawChampange

/**
 * Test the azimuth picture drawer
 */
describe("DrawChamp", () => {
  beforeEach(() => {
    const canvas = document.createElement("canvas")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = canvas.getContext("2d")!
    canvas.width = 800
    canvas.height = 500
    PaintBrush.use(ctx)

    testState = {
      bullseye: new Point(400, 400),
      blueAir: new AircraftGroup({ sx: 600, sy: 400, hdg: 270, nContacts: 4 }),
      answer: { pic: "3 grp champ", groups: [] },
      reDraw: jest.fn(),
    }

    p = {
      dataTrailType: SensorType.ARROW,
      sx: 200,
      sy: 200,
      nContacts: 4,
      hdg: 90,
      alts: [20, 20, 20, 20],
    }

    testProps.orientation.orient = BlueInThe.EAST
    champ = new DrawChampange()
    champ.initialize(testProps, testState)
  })

  it("hot_champ", () => {
    const nlg = new AircraftGroup(p)
    const slg = new AircraftGroup({ ...p, sy: 250, alts: [15, 15, 15, 15] })
    const tg = new AircraftGroup({
      ...p,
      sx: 150,
      sy: 225,
      alts: [15, 15, 15, 15],
    })

    champ.groups = [tg, nlg, slg]
    champ.drawInfo()

    expect(champ.getAnswer()).toEqual(
      "THREE GROUP CHAMPAGNE 12 WIDE 12 DEEP, " +
        "SOUTH LEAD GROUP BULLSEYE 308/55, 15k HOSTILE HEAVY 4 CONTACTS " +
        "NORTH LEAD GROUP BULLSEYE 317/64, 20k HOSTILE HEAVY 4 CONTACTS " +
        "TRAIL GROUP 15k HOSTILE HEAVY 4 CONTACTS"
    )
  })

  it("champ_labels_EW", () => {
    const updatedProps = { ...testProps }
    updatedProps.orientation.orient = BlueInThe.NORTH

    champ.initialize(updatedProps, testState)

    const nlg = new AircraftGroup({ ...p, sx: 200, sy: 250 })
    const slg = new AircraftGroup({
      ...p,
      sx: 150,
      sy: 250,
      alts: [15, 15, 15, 15],
    })
    const tg = new AircraftGroup({
      ...p,
      sx: 175,
      sy: 300,
      alts: [15, 15, 15, 15],
    })

    champ.groups = [tg, nlg, slg]
    champ.drawInfo()

    expect(champ.getAnswer()).toEqual(
      "THREE GROUP CHAMPAGNE 12 WIDE 12 DEEP, " +
        "WEST LEAD GROUP BULLSEYE 308/55, 20k HOSTILE HEAVY 4 CONTACTS " +
        "EAST LEAD GROUP BULLSEYE 301/66, 15k HOSTILE HEAVY 4 CONTACTS " +
        "TRAIL GROUP 15k HOSTILE HEAVY 4 CONTACTS"
    )
  })

  it("weighted_N_champ", () => {
    champ.initialize(testProps, testState)
    const nlg = new AircraftGroup(p)
    const slg = new AircraftGroup({
      ...p,
      sx: 200,
      sy: 250,
      alts: [15, 15, 15, 15],
    })
    const tg = new AircraftGroup({
      ...p,
      sx: 150,
      sy: 200,
      alts: [15, 15, 15, 15],
    })

    champ.groups = [tg, nlg, slg]
    champ.drawInfo()

    expect(champ.getAnswer()).toEqual(
      "THREE GROUP CHAMPAGNE 12 WIDE 12 DEEP, WEIGHTED NORTH, " +
        "SOUTH LEAD GROUP BULLSEYE 308/55, 15k HOSTILE HEAVY 4 CONTACTS " +
        "NORTH LEAD GROUP BULLSEYE 317/64, 20k HOSTILE HEAVY 4 CONTACTS " +
        "TRAIL GROUP 15k HOSTILE HEAVY 4 CONTACTS"
    )
  })

  it("weighted_S_champ", () => {
    champ.initialize(testProps, testState)
    const nlg = new AircraftGroup(p)
    const slg = new AircraftGroup({
      ...p,
      sx: 200,
      sy: 250,
      alts: [15, 15, 15, 15],
    })
    const tg = new AircraftGroup({
      ...p,
      sx: 150,
      sy: 250,
      alts: [15, 15, 15, 15],
    })

    champ.groups = [tg, nlg, slg]
    champ.drawInfo()

    expect(champ.getAnswer()).toEqual(
      "THREE GROUP CHAMPAGNE 12 WIDE 12 DEEP, WEIGHTED SOUTH, " +
        "SOUTH LEAD GROUP BULLSEYE 308/55, 15k HOSTILE HEAVY 4 CONTACTS " +
        "NORTH LEAD GROUP BULLSEYE 317/64, 20k HOSTILE HEAVY 4 CONTACTS " +
        "TRAIL GROUP 15k HOSTILE HEAVY 4 CONTACTS"
    )
  })
})
