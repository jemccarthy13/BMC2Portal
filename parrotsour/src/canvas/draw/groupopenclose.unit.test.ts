import { SensorType } from "../../classes/aircraft/datatrail/sensortype"
import { AircraftGroup } from "../../classes/groups/group"
import { getOpenCloseAzimuth } from "./formatutils"
import { PaintBrush } from "./paintbrush"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const canvasSerializer = require("jest-canvas-snapshot-serializer")
expect.addSnapshotSerializer(canvasSerializer)

describe("FormatUtils", () => {
  const canvas = document.createElement("canvas")
  canvas.width = 200
  canvas.height = 200
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!
  PaintBrush.use(ctx)
  PaintBrush.clearCanvas()

  describe("groupOpenClose_BlueInTheEast", () => {
    let grp1: AircraftGroup
    let grp2: AircraftGroup

    beforeEach(() => {
      grp1 = new AircraftGroup({
        sx: 50,
        sy: 25,
        hdg: 1,
        nContacts: 1,
      })

      grp2 = new AircraftGroup({
        sx: 50,
        sy: 100,
        hdg: 180,
        nContacts: 1,
      })

      PaintBrush.clearCanvas()
    })

    it("openclose_verywide_opening", () => {
      grp1.setHeading(1)
      grp2.setHeading(180)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })

    it("openclose_onlyone_opening", () => {
      grp1.setHeading(90)
      grp2.setHeading(135)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })

    it("openclose_onlyone_closing", () => {
      grp1.setHeading(90)
      grp2.setHeading(45)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" CLOSING ")
    })

    it("openclose_onlyone_sg_closing", () => {
      grp1.setHeading(135)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" CLOSING ")
    })

    it("openclose_onlyone_ng_opening", () => {
      grp1.setHeading(45)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })

    it("openclose_narrow_closing", () => {
      grp1.setHeading(135)
      grp2.setHeading(45)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" CLOSING ")
    })

    it("openclose_normal_opening", () => {
      grp1.setHeading(45)
      grp2.setHeading(135)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })

    it("openclose_westerly_closing", () => {
      grp1.setHeading(270)
      grp2.setHeading(45)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" CLOSING ")
    })

    it("openclose_west_closing", () => {
      grp1.setHeading(270)
      grp2.setHeading(330)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" CLOSING ")
    })

    it("openclose_west_opening", () => {
      grp1.setHeading(330)
      grp2.setHeading(270)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })

    it("openclose_drastic_closing", () => {
      grp1.setHeading(180)
      grp2.setHeading(360)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" CLOSING ")
    })

    it("openclose_verynarrow_closing", () => {
      grp1.setHeading(92)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_heading_too_close_together_closing", () => {
      grp1.setHeading(95)
      grp2.setHeading(85)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_heading_too_close_together_opening", () => {
      grp1.setHeading(275)
      grp2.setHeading(280)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_heading_west_closing", () => {
      grp1.setHeading(225)
      grp2.setHeading(295)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" CLOSING ")
    })

    it("openclose_heading_opposite_closing", () => {
      grp1.setHeading(225)
      grp2.setHeading(45)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" CLOSING ")
    })

    it("openclose_parallel", () => {
      grp1.setHeading(90)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_parallel_west", () => {
      grp1.setHeading(270)
      grp2.setHeading(271)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })
    it("openclose_90_offset", () => {
      grp1.setHeading(1)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })
    it("openclose", () => {
      grp1.setHeading(310)
      grp2.setHeading(40)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_multicontact-closing-west", () => {
      grp1 = new AircraftGroup({
        sx: 50,
        sy: 25,
        hdg: 180,
        nContacts: 3,
      })
      grp2 = new AircraftGroup({
        sx: 50,
        sy: 150,
        hdg: 290,
        nContacts: 4,
      })
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" CLOSING ")
    })
  })

  describe("getGroupOpenClose_BlueInTheSOUTH", () => {
    let grp1: AircraftGroup
    let grp2: AircraftGroup

    beforeEach(() => {
      grp1 = new AircraftGroup({
        sx: 50,
        sy: 50,
        hdg: 1,
        nContacts: 1,
      })

      grp2 = new AircraftGroup({
        sx: 100,
        sy: 50,
        hdg: 180,
        nContacts: 1,
      })

      PaintBrush.clearCanvas()
    })

    it("openclose_verywide_opening", () => {
      grp1.setHeading(271)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })

    it("openclose_opp_leadtrail", () => {
      grp1.setHeading(1)
      grp2.setHeading(180)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_samedir", () => {
      grp1.setHeading(90)
      grp2.setHeading(135)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_onlyone_closing", () => {
      grp1.setHeading(90)
      grp2.setHeading(45)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_onlyone_sg_closing", () => {
      grp1.setHeading(135)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_onlyone_ng_opening", () => {
      grp1.setHeading(45)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_narrow_closing", () => {
      grp1.setHeading(135)
      grp2.setHeading(45)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_normal_opening", () => {
      grp1.setHeading(45)
      grp2.setHeading(135)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_westerly_closing", () => {
      grp1.setHeading(270)
      grp2.setHeading(45)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })

    it("openclose_west_closing", () => {
      grp1.setHeading(270)
      grp2.setHeading(330)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_west_opening", () => {
      grp1.setHeading(330)
      grp2.setHeading(270)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_drastic_closing", () => {
      grp1.setHeading(180)
      grp2.setHeading(360)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_verynarrow_closing", () => {
      grp1.setHeading(92)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_heading_too_close_together_closing", () => {
      grp1.setHeading(95)
      grp2.setHeading(85)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_heading_too_close_together_opening", () => {
      grp1.setHeading(275)
      grp2.setHeading(280)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_heading_west_closing", () => {
      grp1.setHeading(225)
      grp2.setHeading(295)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_heading_opposite_closing", () => {
      grp1.setHeading(225)
      grp2.setHeading(45)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })

    it("openclose_parallel", () => {
      grp1.setHeading(90)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })

    it("openclose_parallel_west", () => {
      grp1.setHeading(270)
      grp2.setHeading(271)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual("")
    })
    it("openclose_90_offset", () => {
      grp1.setHeading(1)
      grp2.setHeading(90)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })
    it("openclose", () => {
      grp1.setHeading(310)
      grp2.setHeading(40)
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" OPENING ")
    })

    it("openclose_multicontact-closing-west", () => {
      grp1 = new AircraftGroup({
        sx: 50,
        sy: 25,
        hdg: 180,
        nContacts: 3,
      })
      grp2 = new AircraftGroup({
        sx: 50,
        sy: 150,
        hdg: 290,
        nContacts: 4,
      })
      grp1.draw(SensorType.ARROW)
      grp2.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
      expect(getOpenCloseAzimuth(grp1, grp2)).toEqual(" CLOSING ")
    })
  })
})
