import { SensorType } from "../../../classes/aircraft/datatrail/sensortype"
import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { PaintBrush } from "../paintbrush"
import { testProps } from "./mockutils.unit.test"

import DrawThreat from "./threat"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const canvasSerializer = require("jest-canvas-snapshot-serializer")
expect.addSnapshotSerializer(canvasSerializer)

describe("DrawThreat", () => {
  let dThreat: DrawThreat
  const canvas = document.createElement("canvas")
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx = canvas.getContext("2d")!
  canvas.width = 800
  canvas.height = 500

  beforeEach(() => {
    jest.restoreAllMocks()

    PaintBrush.use(ctx)

    dThreat = new DrawThreat()

    const testState = {
      bullseye: new Point(400, 400),
      blueAir: new AircraftGroup({ sx: 600, sy: 200, hdg: 270, nContacts: 4 }),
      answer: { pic: "3 grp ladder", groups: [] },
      reDraw: jest.fn(),
    }

    dThreat.initialize(testProps, testState)
  })

  it("drawinfo_threat", () => {
    expect(true).toEqual(true)

    const p = {
      dataTrailType: SensorType.ARROW,
      sx: 500,
      sy: 200,
      nContacts: 1,
      hdg: 90,
      alts: [20],
    }
    dThreat.groups = [new AircraftGroup({ ...p })]

    dThreat.drawInfo()

    expect(canvas).toMatchSnapshot()
  })

  it("hot_threat_answer", () => {
    expect(true).toEqual(true)

    const p = {
      dataTrailType: SensorType.ARROW,
      sx: 500,
      sy: 200,
      nContacts: 1,
      hdg: 90,
      alts: [20],
    }
    dThreat.groups = [new AircraftGroup({ ...p })]

    dThreat.drawInfo()
    expect(dThreat.getAnswer()).toEqual(
      "[FTR C/S], THREAT GROUP BRAA " + "257/13 20k HOT HOSTILE"
    )
  })

  // TODO -- flank threat
  // TODO -- beam threat
  // TODO -- drag threat
  // TODO -- test useless functions
  // TODO -- getPictureInfo
})
