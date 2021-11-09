import {
  BlueInThe,
  FightAxis,
  PictureCanvasProps,
} from "../../../canvas/canvastypes"
import { SensorType } from "../../../classes/aircraft/datatrail/sensortype"
import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { FORMAT } from "../../../classes/supportedformats"
import { Aspect, trackDirFromHdg } from "../../../utils/aspect"

/**
 * TODO --
 * Rename this file
 * Review names of functions and parameters
 * comment
 */
export const isAnchorNorth = (
  ng: AircraftGroup,
  sg: AircraftGroup
): boolean => {
  let anchorN = false
  const ngBraaseye = ng.getBraaseye()
  const sgBraaseye = sg.getBraaseye()
  if (ngBraaseye.braa.range < sgBraaseye.braa.range) {
    anchorN = true
  } else if (ngBraaseye.braa.range === sgBraaseye.braa.range) {
    const altN: number = ng.getAltitudes().sort((a: number, b: number) => {
      return b - a
    })[0]
    const altS: number = sg.getAltitudes().sort((a: number, b: number) => {
      return b - a
    })[0]

    if (altN > altS) {
      anchorN = true
    } else if (altN === altS) {
      if (ng.getStrength() >= sg.getStrength()) {
        anchorN = true
      }
    }
  }
  return anchorN
}

export const isEchelon = (
  orientation: BlueInThe,
  dataStyle: SensorType,
  ngBraaseye: Braaseye,
  sgBraaseye: Braaseye,
  ng: AircraftGroup,
  sg: AircraftGroup
): string => {
  const nPos = ng.getCenterOfMass(dataStyle)
  const sPos = sg.getCenterOfMass(dataStyle)

  const isNS = FightAxis.isNS(orientation)
  const isEchX = !isNS && nPos.getBR(new Point(sPos.x, nPos.y)).range > 5
  const isEchY = isNS && nPos.getBR(new Point(nPos.x, sPos.y)).range > 5
  let ech = ""
  if (isEchX || isEchY) {
    if (ngBraaseye.braa.range < sgBraaseye.braa.range) {
      ech = " ECHELON " + trackDirFromHdg(nPos.getBR(sPos).bearingNum) + ", "
    } else {
      ech = " ECHELON " + trackDirFromHdg(nPos.getBR(nPos).bearingNum) + ", "
    }
  }
  return ech
}

/**
 * If all groups are tracking the same direction, get the picture track direction
 * and set it for all groups (formatting).
 *
 * Side effect- set the picDir member variable in each group.
 *
 * @param props current PictureCanvasProps
 * @param groups all red air AircraftGroups
 * @param blueAir blue air AircraftGroup (for aspect)
 * @returns {string} Track direction of the picture | "" if track dirs are different
 */
export const picTrackDir = (
  props: PictureCanvasProps,
  groups: AircraftGroup[],
  blueAir: AircraftGroup
): string => {
  let answer = "" // set default return

  // determine if all groups track same direction
  const trackDir: string | undefined = groups[0].getTrackDir()
  const sameTrackDir: boolean = groups.every((group) => {
    return trackDir === group.getTrackDir()
  })

  // Picture track direction is included in answer iff
  // all groups track same direction and the Aspect isn't HOT
  const asp = blueAir.getAspect(groups[0], props.dataStyle)
  if (props.format !== FORMAT.IPE) {
    if (sameTrackDir && asp !== Aspect.HOT) {
      answer = trackDir + ". "
    }
  }

  // ** Side effect **
  // Set whether to use track direction in group formatting
  groups.forEach((group) => {
    if (sameTrackDir) {
      group.setUseTrackDir(false)
    }
  })
  return answer
}
