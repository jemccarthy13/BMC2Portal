import { AircraftGroup } from "../../classes/groups/group"
import { Point } from "../../classes/point"
import { PIXELS_TO_NM } from "../../utils/psmath"
import {
  Base26,
  convertToCGRS,
  convertToXY,
  getAsset,
  getColIndex,
} from "./prochelpers"

describe("ProcHelpers", () => {
  describe("findAsset", () => {
    it("find_asset_in_groups", () => {
      const acftGrp = new AircraftGroup({
        nContacts: 1,
      })
      // should have no label
      const acftGrp2 = new AircraftGroup({
        nContacts: 1,
      })
      acftGrp.setLabel("VR01")

      expect(getAsset([acftGrp, acftGrp2], "VR01")).toEqual(acftGrp)
      expect(getAsset([acftGrp, acftGrp2], "SLICE")).toEqual(undefined)
    })
  })

  describe("convertCGRSToXY", () => {
    it("converts_col_to_number", () => {
      expect(Base26("A")).toEqual(1)
      expect(Base26("Z")).toEqual(26)
      expect(getColIndex("CV")).toEqual(100)
      expect(getColIndex("DB")).toEqual(106)
    })

    it("converts_cgrs_to_xy", () => {
      localStorage.startRow = 58
      localStorage.startCol1 = 67
      localStorage.startCol2 = 86

      const kp1 = convertToXY("58CV1")
      const kp3 = convertToXY("58CV3")
      const kp5 = convertToXY("58CV5")
      const center = convertToXY("58CV")
      const lastRow = convertToXY("61DB8")
      const invalid = convertToXY("VR01")

      expect(kp1.x).toEqual(5 * PIXELS_TO_NM)
      expect(kp1.y).toEqual(5 * PIXELS_TO_NM)

      expect(kp3.x).toEqual(25 * PIXELS_TO_NM)
      expect(kp3.y).toEqual(5 * PIXELS_TO_NM)

      expect(kp5.x).toEqual(15 * PIXELS_TO_NM)
      expect(kp5.y).toEqual(15 * PIXELS_TO_NM)

      expect(center.x).toEqual(15 * PIXELS_TO_NM)
      expect(center.y).toEqual(15 * PIXELS_TO_NM)

      expect(invalid.x).toEqual(-1)
      expect(invalid.y).toEqual(-1)

      // 'lastrow' is 6 columns over and 3 columns down,
      // plus 3rd kp row and 2nd kp col
      expect(lastRow.x).toEqual(6 * 30 * PIXELS_TO_NM + 15 * PIXELS_TO_NM)
      expect(lastRow.y).toEqual(3 * 30 * PIXELS_TO_NM + 25 * PIXELS_TO_NM)
    })
  })

  describe("XY_to_CGRS", () => {
    it("convertsXY_to_cgrs", () => {
      const kp1 = new Point(5 * PIXELS_TO_NM, 5 * PIXELS_TO_NM)
      const cgrs1 = convertToCGRS(kp1.x, kp1.y)
      expect(cgrs1).toEqual("58CV1+")

      const kp5 = new Point(15 * PIXELS_TO_NM, 15 * PIXELS_TO_NM)
      const cgrs5 = convertToCGRS(kp5.x, kp5.y)
      expect(cgrs5).toEqual("58CV5+")

      const lastRow = new Point(
        6 * 30 * PIXELS_TO_NM + 15 * PIXELS_TO_NM,
        3 * 30 * PIXELS_TO_NM + 25 * PIXELS_TO_NM
      )
      const lastCGRS = convertToCGRS(lastRow.x, lastRow.y)
      expect(lastCGRS).toEqual("61DB8+")

      const wayOff = new Point(
        20 * 30 * PIXELS_TO_NM + 15 * PIXELS_TO_NM,
        20 * 30 * PIXELS_TO_NM + 25 * PIXELS_TO_NM
      )
      const wayOffCGRS = convertToCGRS(wayOff.x, wayOff.y)
      expect(wayOffCGRS).toEqual("78RP8+")
    })
  })
})
