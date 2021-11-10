import { PaintBrush } from "../../canvas/draw/paintbrush"
import { IDMatrix } from "../aircraft/id"
import { AircraftGroup } from "./group"
import { drawGroupCap } from "./groupcap"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const canvasSerializer = require("jest-canvas-snapshot-serializer")
expect.addSnapshotSerializer(canvasSerializer)

describe("draw_group_cap", () => {
  const canvas = document.createElement("canvas")
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx = canvas.getContext("2d")!
  PaintBrush.use(ctx)

  afterEach(() => {
    PaintBrush.clearCanvas()
  })

  it("draws_capping_group", () => {
    const grp = new AircraftGroup({
      nContacts: 4,
      hdg: 135,
      id: IDMatrix.HOSTILE,
      sx: 50,
      sy: 50,
    })
    grp.setCapping(true)
    drawGroupCap(grp)
    expect(canvas).toMatchSnapshot()
  })

  it("draws_singleship_cap", () => {
    const grp = new AircraftGroup({
      nContacts: 1,
      hdg: 135,
      id: IDMatrix.HOSTILE,
      sx: 50,
      sy: 50,
    })
    grp.setCapping(true)
    drawGroupCap(grp)
    expect(canvas).toMatchSnapshot()
  })
})
