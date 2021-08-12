import { randomNumber } from "../../../utils/psmath"
import DrawSingleGroup from "./singlegroup"
import DrawAzimuth from "./azimuth"
import DrawRange from "./range"
import DrawWall from "./wall"
import DrawLadder from "./ladder"
import DrawChampagne from "./champagne"
import DrawVic from "./vic"
import DrawThreat from "./threat"
import DrawEA from "./ea"
import DrawPOD from "./pod"
import DrawPackage from "./packages"
import { DrawPic } from "./drawpic"
import DrawLeadEdge from "./drawleadedge"

export class PictureFactory {
  private static DrawMap = new Map<string, () => DrawPic>([
    ["azimuth", new DrawAzimuth().create],
    ["range", new DrawRange().create],
    ["ladder", new DrawLadder().create],
    ["wall", new DrawWall().create],
    ["vic", new DrawVic().create],
    ["champagne", new DrawChampagne().create],
    ["threat", new DrawThreat().create],
    ["ea", new DrawEA().create],
    ["pod", new DrawPOD().create],
    ["leading edge", new DrawLeadEdge().create],
    ["package", new DrawPackage().create],
    ["singlegroup", new DrawSingleGroup().create],
  ])

  /**
   * Pick a random picture type for drawing
   * @param leadingEdge - true iff leading edge or packages. Set to true to
   * limit the types of pictures to the standard (with caveat: wall is
   * not allowed in lead edge/pkg due to separation requirement)
   */
  private static _getRandomPicType = (complexity: number): string => {
    const type1 = ["singlegroup"]
    const type2 = type1.concat(["range", "azimuth"])
    const type3 = type2.concat(["vic", "champagne", "wall", "ladder"])
    const type4 = type3.concat(["leading edge", "package"])

    const types = [[], type1, type2, type3, type4]

    if (complexity === 0) {
      complexity = 4
    } else if (complexity > 4) {
      complexity = 4
    }
    const numType = randomNumber(0, types[complexity].length - 1)

    return types[complexity][numType]
  }

  public static getPictureDraw(
    picType: string,
    desiredNumContacts?: number,
    forced?: boolean
  ): DrawPic {
    desiredNumContacts = desiredNumContacts ? desiredNumContacts : 0

    let complexity = desiredNumContacts
    if (complexity === 0) complexity = 4
    if (complexity > 4) complexity = 4
    if (forced) complexity = Math.min(desiredNumContacts, 3)
    if (picType === "cap") complexity = 2

    let type = picType || "azimuth"
    if (picType === "random" || picType === "cap") {
      type = this._getRandomPicType(complexity)
    }

    let drawFunc = this.DrawMap.get(type)
    if (drawFunc === undefined) {
      drawFunc = new DrawAzimuth().create
    }
    return drawFunc()
  }
}
