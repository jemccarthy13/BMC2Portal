import { AircraftIntent } from "./intent"

// mock Point to self-contain intent tests
const mockFn = jest.fn()
jest.mock("../point", () => {
  return function (x: number, y: number) {
    return {
      x,
      y,
      getBR: mockFn,
      getStraightDistanceNM: mockFn,
    }
  }
})
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Point = require("../point")

jest.mock("../../utils/psmath")

describe("Intent", () => {
  describe("alt_aspect_speed", () => {
    it("heading", () => {
      const intent = new AircraftIntent({
        desiredHeading: 180,
      })
      expect(intent.getDesiredHeading()).toEqual(180)
      intent.setDesiredHeading(200)
      expect(intent.getDesiredHeading()).toEqual(200)
    })

    it("altitude", () => {
      const intent = new AircraftIntent({
        desiredAlt: 18,
      })
      expect(intent.getDesiredAltitude()).toEqual(18)
      intent.setDesiredAltitude(20)
      expect(intent.getDesiredAltitude()).toEqual(20)
    })

    it("speed", () => {
      const intent = new AircraftIntent({
        desiredSpeed: 500,
      })
      expect(intent.getDesiredSpeed()).toEqual(500)
      intent.setDesiredSpeed(450)
      expect(intent.getDesiredSpeed()).toEqual(450)
    })

    it("updates_all_hdg_alt_speed", () => {
      const intent = new AircraftIntent({
        desiredSpeed: 500,
        desiredHeading: 180,
        desiredAlt: 20,
      })
      expect(intent.getDesiredSpeed()).toEqual(500)
      expect(intent.getDesiredAltitude()).toEqual(20)
      expect(intent.getDesiredHeading()).toEqual(180)

      intent.updateIntent({
        desiredHeading: 225,
        desiredSpeed: 400,
        desiredAlt: 40,
      })
      expect(intent.getDesiredSpeed()).toEqual(400)
      expect(intent.getDesiredAltitude()).toEqual(40)
      expect(intent.getDesiredHeading()).toEqual(225)
    })

    it("heading_0_chgs_360", () => {
      const intent = new AircraftIntent()
      expect(intent.getDesiredHeading()).toEqual(90)
      intent.updateIntent({
        desiredHeading: 0,
      })
      expect(intent.getDesiredHeading()).toEqual(360)
    })
  })

  describe("intended_routing", () => {
    it("defaults_empty", () => {
      const intent = new AircraftIntent()
      expect(intent.getNextRoutingPoint()).toEqual(undefined)
      expect(intent.atFinalDestination()).toEqual(true)
    })

    it("adds_routing_fifo", () => {
      // first in first out
      const intent = new AircraftIntent()
      const p1 = new Point(50, 50)
      const p2 = new Point(50, 75)
      intent.addRoutingPoint(p1)
      intent.addRoutingPoint(p2)
      expect(intent.atFinalDestination()).toEqual(false)
      expect(intent.getNextRoutingPoint()).toEqual(p1)
    })

    it("removes_routing", () => {
      const p1 = new Point(50, 50)
      const intent = new AircraftIntent({
        desiredLoc: [p1],
      })
      expect(intent.getNextRoutingPoint()).toEqual(p1)
      intent.removeRoutingPoint()
      expect(intent.getNextRoutingPoint()).toEqual(undefined)
      expect(intent.atFinalDestination()).toEqual(true)
    })

    it("calcs_nearto_nextpoint", () => {
      const PIXELS_TO_NM = 4
      const p1 = new Point(50, 50)
      const default_int = new AircraftIntent()
      expect(default_int.atNextRoutingPoint(p1)).toEqual(false)
      const intent = new AircraftIntent({
        desiredLoc: [p1],
      })
      const p = intent.getNextRoutingPoint()
      console.log(p1.x, p1.y, p?.x, p?.y)
      expect(intent.atNextRoutingPoint(p1)).toEqual(true)
      const p2 = new Point(50 + 3 * PIXELS_TO_NM, 50 + 3 * PIXELS_TO_NM)
      expect(intent.atNextRoutingPoint(p2)).toEqual(true)
      const p3 = new Point(50 + 3 * PIXELS_TO_NM, 50 + 7 * PIXELS_TO_NM)
      expect(intent.atNextRoutingPoint(p3)).toEqual(false)
      const p4 = new Point(50 + 7 * PIXELS_TO_NM, 50 + 3 * PIXELS_TO_NM)
      expect(intent.atNextRoutingPoint(p4)).toEqual(false)
      const p5 = new Point(50 + 7 * PIXELS_TO_NM, 50 + 7 * PIXELS_TO_NM)
      expect(intent.atNextRoutingPoint(p5)).toEqual(false)
    })
  })
})
