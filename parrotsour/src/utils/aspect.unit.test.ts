import { SensorType } from "../classes/aircraft/datatrail/sensortype"
import { IDMatrix } from "../classes/aircraft/id"
import { AircraftGroup } from "../classes/groups/group"
import { trackDirFromHdg } from "./aspect"

describe("Aspect", () => {
  const blueAir = new AircraftGroup({
    nContacts: 4,
    hdg: 270,
    id: IDMatrix.FRIEND,
    sx: 200,
    sy: 50,
  })

  const redAir = new AircraftGroup({
    nContacts: 2,
    id: IDMatrix.SUSPECT,
    sx: 25,
    sy: 50,
  })

  it("calculates_aspect_hot", () => {
    redAir.setHeading(95)
    expect(blueAir.getAspect(redAir, SensorType.ARROW)).toEqual("HOT")
  })
  it("calculates_aspect_beam", () => {
    redAir.setHeading(1)
    expect(blueAir.getAspect(redAir, SensorType.ARROW)).toEqual("BEAM")
  })
  it("calculates_aspect_flank", () => {
    redAir.setHeading(135)
    expect(blueAir.getAspect(redAir, SensorType.ARROW)).toEqual("FLANK")
  })
  it("calculates_aspect_drag", () => {
    redAir.setHeading(260)
    expect(blueAir.getAspect(redAir, SensorType.ARROW)).toEqual("DRAG")
  })
  it("calculates_aspect_drag", () => {
    redAir.setHeading(270)
    expect(blueAir.getAspect(redAir, SensorType.ARROW)).toEqual("DRAG")
  })
  it("calculates_aspect_drag", () => {
    redAir.setHeading(269)
    expect(blueAir.getAspect(redAir, SensorType.ARROW)).toEqual("DRAG")
  })

  it("calculates_track_dir_from_hdg", () => {
    expect(trackDirFromHdg(blueAir.getHeading())).toEqual("WEST")
  })
})
