import { SensorType } from "../../classes/aircraft/datatrail/sensortype"
import { AircraftGroup } from "../../classes/groups/group"
import { getGroupOpenClose } from "./formatutils"

describe("FormatUtils", () => {
  it("openclose_opening", () => {
    const grp1 = new AircraftGroup({
      sx: 50,
      sy: 25,
      hdg: 1,
    })

    const grp2 = new AircraftGroup({
      sx: 50,
      sy: 100,
      hdg: 180,
    })

    expect(getGroupOpenClose(grp1, grp2, SensorType.ARROW)).toEqual("OPENING")
  })
})
