import { SensorType } from "../../../classes/aircraft/datatrail/sensortype"
import { AircraftGroup, GroupParams } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { PictureCanvasState } from "../../canvastypes"
import DrawEA from "./ea"
import { testProps } from "./mockutils.unit.test"
import { PictureFactory } from "./picturefactory"

describe("DrawEA", () => {
  let testState: PictureCanvasState
  let ctx: CanvasRenderingContext2D
  let p: Partial<GroupParams>
  let draw: DrawEA

  beforeAll(() => {
    console.warn(
      "11/09/2021- Surpressing external usage of console.error\r\n" +
        "Use '(test command) --silent' to turn off all console messages."
    )
    jest.spyOn(console, "warn").mockImplementation()
    const canvas = document.createElement("canvas")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ctx = canvas.getContext("2d")!
    canvas.width = 800
    canvas.height = 500

    const startX = 200
    const startY = 200
    p = {
      ctx,
      dataTrailType: SensorType.ARROW,
      sx: startX,
      sy: startY,
      nContacts: 4,
      hdg: 90,
      alts: [20, 20, 20, 20],
    }
    testState = {
      bullseye: new Point(400, 400),
      blueAir: new AircraftGroup({ sx: 600, sy: 400, hdg: 270, nContacts: 4 }),
      answer: { pic: "2 grps az", groups: [] },
      reDraw: jest.fn(),
      ctx: ctx,
    }

    draw = PictureFactory.getPictureDraw("ea") as DrawEA
    draw.initialize(ctx, testProps, testState)
    draw.chooseNumGroups(1)
    draw.createGroups(new Point(startX, startY), [1])
    draw.drawInfo()

    const sg = new AircraftGroup(p)
    draw.groups = [sg]
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it("bogey_dope", () => {
    draw.getPictureInfo()
    draw.requestType = 1
    draw.getAnswer()
    expect(draw.getAnswer()).toEqual(
      "GROUP BRAA 297/98 20k, HOT HOSTILE HEAVY 4 CONTACTS "
    )
  })
})
