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
import DrawPackage from "./drawpackage"
import { DrawPic } from "./drawpic"

import { drawLeadEdge } from "./leadingedge"

export class PictureFactory {
  private static wallDraw = new DrawWall()
  private static ladderDraw = new DrawLadder()
  private static champDraw = new DrawChampagne()
  private static vicDraw = new DrawVic()
  private static threatDraw = new DrawThreat()
  private static eaDraw = new DrawEA()
  private static PODDraw = new DrawPOD()
  private static packDraw = new DrawPackage()

  // TODO -- generalize the map
  // getPictureDrawer(type) should return a class
  // to call new or 'create' on
  //private map = new Map<string>(["azimuth", DrawAzimuth])

  private static DrawMap = new Map<string, () => DrawPic>([
    ["azimuth", new DrawAzimuth().create],
    ["range", new DrawRange().create],
    ["ladder", PictureFactory.ladderDraw.create],
    ["wall", PictureFactory.wallDraw.create],
    ["vic", PictureFactory.vicDraw.create],
    ["champagne", PictureFactory.champDraw.create],
    ["threat", PictureFactory.threatDraw.create],
    ["ea", PictureFactory.eaDraw.create],
    ["pod", PictureFactory.PODDraw.create],
    //["leading edge", drawLeadEdge.create],
    ["package", PictureFactory.packDraw.create],
    ["singlegroup", new DrawSingleGroup().create],
  ])

  private static getDrawer(k: string) {
    if (k === "azimuth") {
      return new DrawAzimuth()
    } else if (k === "range") {
      return new DrawRange()
    } else if (k === "ladder") {
      return new DrawLadder()
    } else if (k === "wall") {
      return new DrawWall()
    } else if (k === "vic") {
      return new DrawVic()
    } else if (k === "champagne") {
      return new DrawChampagne()
    } else if (k === "package") {
      return new DrawPackage()
    } else if (k === "threat") {
      return new DrawThreat()
    } else if (k === "ea") {
      return new DrawEA()
    } else if (k === "pod") {
      return new DrawPOD()
    } else if (k === "singlegroup") {
      return new DrawSingleGroup()
    }
  }

  /**
   * Pick a random picture type for drawing
   * @param leadingEdge - true iff leading edge or packages. Set to true to
   * limit the types of pictures to the standard (with caveat: wall is
   * not allowed in lead edge/pkg due to separation requirement)
   */
  private static _getRandomPicType = (complexity: number): string => {
    const type1 = ["singlegroup"]
    const type2 = type1.concat(["range", "azimuth", "cap"])
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
