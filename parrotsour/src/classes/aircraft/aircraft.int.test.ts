import { Point } from "../point"
import { ACType, Aircraft } from "./aircraft"
import { SensorType } from "./datatrail/sensortype"
import { IDMatrix } from "./id"
import Tasking from "../taskings/tasking"
import { PaintBrush } from "../../canvas/draw/paintbrush"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const canvasSerializer = require("jest-canvas-snapshot-serializer")
expect.addSnapshotSerializer(canvasSerializer)

/**
 * Integration tests for Aircraft.
 *
 * NOTE:
 * This integration test covers Aircraft with the real underlying external
 * references.
 *
 * This means if the underlying unit tests (like Point) were to fail,
 * there's a high likelihood this test will also fail.
 */
describe("Aircraft", () => {
  const canvas = document.createElement("canvas")
  canvas.width = 10
  canvas.height = 30
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, 0, 0)
  PaintBrush.use(ctx)

  describe("constructors", () => {
    it("constructs_FTR_correctly", () => {
      const acft = new Aircraft()
      expect(acft.getHeading()).toEqual(90)
      expect(acft.getAltitude()).toBeLessThanOrEqual(45)
      expect(acft.getAltitude()).toBeGreaterThanOrEqual(15)
      expect(acft.getIDMatrix()).toEqual(IDMatrix.HOSTILE)
      expect(acft.getNextRoutingPoint()).toEqual(undefined)
      expect(acft.getType()).toEqual(ACType.FTR)
      const startPos = acft.getStartPos()
      expect(startPos.x).toBeLessThanOrEqual(100)
      expect(startPos.y).toBeLessThanOrEqual(100)
      expect(startPos.x).toBeGreaterThanOrEqual(1)
      expect(startPos.y).toBeGreaterThanOrEqual(1)
    })

    it("constructs_RPA_correctly", () => {
      const acft = new Aircraft({ type: ACType.RPA })
      expect(acft.getAltitude()).toBeLessThanOrEqual(18)
      expect(acft.getAltitude()).toBeGreaterThanOrEqual(0o5)
    })
  })

  describe("center_of_mass", () => {
    it("computes_for_arrows", () => {
      const bluePos = new Point(50, 50)
      const acft = new Aircraft({ sx: bluePos.x, sy: bluePos.y })
      expect(acft.getCenterOfMass()).toEqual({ x: 74, y: 50 })

      acft.setHeading(180)
      expect(acft.getCenterOfMass()).toEqual({ x: 49, y: 74 })
    })
    it("computes_for_rawdata", () => {
      const acft = new Aircraft({ sx: 50, sy: 50, hdg: 90 })
      const centMass = acft.getCenterOfMass(SensorType.RAW)
      expect(centMass.x).toBeGreaterThanOrEqual(82)
      expect(centMass.x).toBeLessThanOrEqual(102)
      expect(centMass.y).toBeGreaterThanOrEqual(47)
      expect(centMass.y).toBeLessThanOrEqual(57)
    })
  })

  describe("draws_id_matrix", () => {
    it("hostile", () => {
      const bluePos = new Point(5, 5)
      const acft = new Aircraft({
        sx: bluePos.x,
        sy: bluePos.y,
        hdg: 180,
      })
      acft.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
    })
    it("suspect", () => {
      const bluePos = new Point(5, 5)
      const acft = new Aircraft({
        sx: bluePos.x,
        sy: bluePos.y,
        hdg: 180,
      })
      acft.setIDMatrix(IDMatrix.SUSPECT)
      acft.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
    })
    it("neutral", () => {
      const bluePos = new Point(5, 5)
      const acft = new Aircraft({
        sx: bluePos.x,
        sy: bluePos.y,
        hdg: 180,
      })
      acft.setIDMatrix(IDMatrix.NEUTRAL)
      acft.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
    })
    it("assume_friend", () => {
      const bluePos = new Point(5, 5)
      const acft = new Aircraft({
        sx: bluePos.x,
        sy: bluePos.y,
        hdg: 180,
      })
      acft.setIDMatrix(IDMatrix.ASSUME_FRIEND)
      acft.draw(SensorType.ARROW)
      expect(canvas).toMatchSnapshot()
    })
  })

  describe("intent", () => {
    it("handles_intent_alt", () => {
      const bluePos = new Point(5, 5)
      const acft = new Aircraft({
        sx: bluePos.x,
        sy: bluePos.y,
        hdg: 180,
        alt: 30,
      })
      acft.updateIntent({
        desiredAlt: 10,
      })
      acft.doNextAltChange()
      expect(acft.getAltitude()).toEqual(29.5)
      acft.updateIntent({
        desiredAlt: 40,
      })
      acft.doNextAltChange()
      expect(acft.getAltitude()).toEqual(30)
      acft.updateIntent({
        desiredAlt: 30,
      })
      acft.doNextAltChange()
      expect(acft.getAltitude()).toEqual(30)
    })

    it("set_task_functions", () => {
      const acft = new Aircraft()

      const tasking = new Tasking({
        locationXY: new Point(0, 0),
        locationStr: "88LC",
        description: "BOMBING STUFF",
      })
      acft.setTasking(tasking)
      expect(acft.isTasked()).toEqual(true)
      expect(acft.getTasking()).toEqual(tasking)

      acft.clearTasking()
      expect(acft.isTasked()).toEqual(false)
      expect(acft.getTasking()).toEqual(undefined)
    })
  })

  describe("move_turns", () => {
    it("no_turn_when_no_target", () => {
      const acft = new Aircraft()
      acft.turnToTarget()
      expect(acft.getHeading()).toEqual(90)
    })

    it("turns_to_target", () => {
      // the turn goes off of center of mass, so here we position the aircraft
      // such that the turn math becomes easier ('desired Hdg' = 90, so the updated
      // heading is easier to expect)
      const acft = new Aircraft({
        sx: 25,
        sy: 26,
        hdg: 180,
      })
      acft.addRoutingPoint(new Point(50, 50))
      acft.turnToTarget()
      expect(acft.getHeading()).toEqual(180 - 90 / 15)
      expect(acft.getStartPos()).toEqual(new Point(25, 26))
    })

    it("doesnt_turn_at_target", () => {
      const dest = new Point(50, 50)
      const acft = new Aircraft({
        sx: dest.x,
        sy: 38,
        hdg: 180,
      })
      acft.turnToTarget() // expect nothing to change
      expect(acft.getHeading()).toEqual(180)
      expect(acft.getStartPos()).toEqual(new Point(50, 38))
    })

    it("sharp_turn_near_desired_hdg", () => {
      const dest = new Point(50, 50)
      const acft = new Aircraft({
        sx: dest.x,
        sy: dest.y,
        hdg: 180,
      })
      acft.updateIntent({ desiredHeading: 175 })
      acft.turnToTarget() // < 7 turn delta is snap to desired (to avoid data trail sin wave)
      expect(acft.getHeading()).toEqual(175)
      expect(acft.getStartPos()).toEqual(dest)
    })

    it("moves_along_heading", () => {
      const dest = new Point(50, 50)
      const acft = new Aircraft({
        sx: dest.x,
        sy: 38,
        hdg: 180,
      })
      acft.move() // move once
      expect(acft.getHeading()).toEqual(180)
      expect(acft.getStartPos()).toEqual(new Point(50, 45))
    })

    it("turns_during_move_if_intent", () => {
      const dest = new Point(50, 50)
      const acft = new Aircraft({
        sx: dest.x,
        sy: 38,
        hdg: 180,
      })
      acft.updateIntent({ desiredHeading: 135 })
      acft.move() // move once
      expect(acft.getHeading()).toEqual(Math.floor(180 - (180 - 135) / 7))
      expect(acft.getStartPos()).toEqual(new Point(50, 45))
    })
  })

  describe("handles_routing", () => {
    it("handles_at_next_routing_point", () => {
      const acft = new Aircraft({
        sx: 10,
        sy: 30,
        hdg: 90,
      })
      acft.addRoutingPoint(new Point(34, 30))
      acft.addRoutingPoint(new Point(56, 30))
      expect(acft.isCapping()).toEqual(false)
      expect(acft.atFinalDestination()).toEqual(false)
      expect(acft.getHeading()).toEqual(90)
      expect(acft.getStartPos()).toEqual(new Point(10, 30))
      for (let x = 0; x < 50; x++) {
        acft.doNextRouting()
        acft.move()
      }
      expect(acft.atFinalDestination()).toEqual(true)
      expect(acft.isCapping()).toEqual(true)
    })
    it("chained_routing", () => {
      const acft = new Aircraft({
        sx: 10,
        sy: 30,
        hdg: 90,
      })
      acft.addRoutingPoint(new Point(100, 100))
      acft.addRoutingPoint(new Point(200, 200))
      acft.doNextRouting()
      expect(acft.isCapping()).toEqual(false)
      expect(acft.atFinalDestination()).toEqual(false)
      expect(acft.getHeading()).toEqual(96)
      expect(acft.getStartPos()).toEqual(new Point(10, 30))
      acft.move()
      acft.doNextRouting()
      acft.move()
      acft.doNextRouting()
      acft.move()
      acft.doNextRouting()
      acft.move()
      acft.doNextRouting()
      expect(acft.atFinalDestination()).toEqual(false)
      expect(acft.isCapping()).toEqual(false)
    })
  })
})
