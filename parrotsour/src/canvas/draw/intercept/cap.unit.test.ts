import { SensorType } from "../../../classes/aircraft/datatrail/sensortype"
import { AircraftGroup, GroupParams } from "../../../classes/groups/group"
import { checkCaps } from "./cap"

describe("cap_util", () => {
  let ctx: CanvasRenderingContext2D
  //let testState: PictureCanvasState
  let p: Partial<GroupParams>
  let grps: AircraftGroup[]

  beforeAll(() => {
    const canvas = document.createElement("canvas")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ctx = canvas.getContext("2d")!
    canvas.width = 800
    canvas.height = 500
    p = {
      ctx,
      dataTrailType: SensorType.ARROW,
      sx: 200,
      sy: 200,
      nContacts: 4,
      hdg: 90,
      alts: [20, 20, 20, 20],
    }
    const ng = new AircraftGroup(p)
    grps = [ng]
  })

  beforeEach(() => {
    grps.forEach((grp) => {
      grp.setCapping(false)
    })
  })

  it("flags_caps", () => {
    checkCaps(true, grps)
    expect(grps[0].isCapping()).toEqual(true)
  })

  it("flags_no_caps", () => {
    checkCaps(false, grps)
    expect(grps[0].isCapping()).toEqual(false)
  })

  it("flags_some_caps", () => {
    const sg = new AircraftGroup(p)
    grps.push(sg)
    checkCaps(true, grps)

    const hasCap =
      grps.find((grp) => {
        return grp.isCapping() === true
      }) !== undefined
    expect(hasCap).toEqual(true)
  })
})
