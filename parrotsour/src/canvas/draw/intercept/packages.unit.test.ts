import { SensorType } from "../../../classes/aircraft/datatrail/sensortype"
import { AircraftGroup, GroupParams } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { PictureCanvasState } from "../../canvastypes"
import { PaintBrush } from "../paintbrush"
import { testProps } from "./mockutils.unit.test"
import { PictureFactory } from "./picturefactory"
import DrawPackage from "./packages"
import { Package } from "./package"

describe("DrawPackages", () => {
  let testState: PictureCanvasState
  let p: Partial<GroupParams>
  let pkg: DrawPackage

  beforeEach(() => {
    jest.restoreAllMocks()
    const canvas = document.createElement("canvas")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = canvas.getContext("2d")!
    canvas.width = 800
    canvas.height = 500
    PaintBrush.use(ctx)

    testState = {
      bullseye: new Point(400, 400),
      blueAir: new AircraftGroup({ sx: 600, sy: 350, hdg: 270, nContacts: 4 }),
      answer: { pic: "3 grp ladder", groups: [] },
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

    pkg = PictureFactory.getPictureDraw("package") as DrawPackage
    pkg.initialize(testProps, testState)
    pkg.chooseNumGroups(2)
    pkg.createGroups(new Point(-1, -1), [1, 1])
    pkg.drawInfo()
  })

  it("casts_correctly", () => {
    const pkg: Package = new Package()
    const pt = new Point(50, 50)
    pkg.setBullseyePt(pt)
    expect(pkg.getBullseyePt()).toEqual(pt)
  })

  it("2_pkgs_az_single_groups", () => {
    expect(true).toEqual(true)
    const sg1 = new AircraftGroup({
      ...p,
      sy: 380,
      alts: [15],
      nContacts: 1,
    })
    const sg2 = new AircraftGroup({
      ...p,
      sy: 550,
      alts: [10],
      nContacts: 1,
    })
    pkg.pictures[0].groups = [sg1]
    pkg.pictures[1].groups = [sg2]

    expect(pkg.getAnswer()).toEqual(
      "2 PACKAGES AZIMUTH 50 NORTH PACKAGE BULLSEYE 319/66 " +
        "SOUTH PACKAGE BULLSEYE 270/44"
    )
  })

  it("2_pkgs_az_anchor_south", () => {
    expect(true).toEqual(true)
    const sg1 = new AircraftGroup({
      ...p,
      sx: 150,
      sy: 200,
      alts: [15],
      nContacts: 1,
    })
    const sg2 = new AircraftGroup({
      ...p,
      sx: 225,
      sy: 420,
      alts: [10],
      nContacts: 1,
    })
    pkg.pictures[0].groups = [sg1]
    pkg.pictures[1].groups = [sg2]

    expect(pkg.getAnswer()).toEqual(
      "2 PACKAGES AZIMUTH 50 NORTH PACKAGE BULLSEYE 319/66 " +
        "SOUTH PACKAGE BULLSEYE 270/44"
    )
  })
})
