import DrawSingleGroup from "./singlegroup"
import DrawAzimuth from "./azimuth"
import DrawRange from "./range"
import DrawWall from "./wall"
import DrawLadder from "./ladder"
import DrawChampagne from "./champagne"
import DrawVic from "./vic"
import DrawThreat from "./threat"
import DrawEA from "./ea"
import { randomNumber } from "../../../utils/psmath"
import { drawPOD } from "./pod"
import { drawLeadEdge } from "./leadingedge"
import { drawPackage } from "./packages"
import { DrawPic } from "./drawpic"

export class PictureFactory {
  private static singleDraw = new DrawSingleGroup()
  private static azimuthDraw = new DrawAzimuth()
  private static rangeDraw = new DrawRange()
  private static wallDraw = new DrawWall()
  private static ladderDraw = new DrawLadder()
  private static champDraw = new DrawChampagne()
  private static vicDraw = new DrawVic()
  private static threatDraw = new DrawThreat()
  private static eaDraw = new DrawEA()

  private static DrawMap = new Map<string, DrawPic>([
    ["azimuth", PictureFactory.azimuthDraw],
    ["range", PictureFactory.rangeDraw],
    ["ladder", PictureFactory.ladderDraw],
    ["wall", PictureFactory.wallDraw],
    ["vic", PictureFactory.vicDraw],
    ["champagne", PictureFactory.champDraw],
    ["threat", PictureFactory.threatDraw],
    ["ea", PictureFactory.eaDraw],
    //["pod", drawPOD],
    //["leading edge", drawLeadEdge],
    //["package", drawPackage],
    ["singlegroup", PictureFactory.singleDraw],
  ])

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
    const isLeadEdge = picType === "leading edge" || picType === "package"

    desiredNumContacts = desiredNumContacts ? desiredNumContacts : 0

    let complexity = desiredNumContacts
    if (complexity === 0) complexity = 4
    if (complexity > 4) complexity = 4
    if (forced) complexity = 3
    if (isLeadEdge) complexity = 3

    let type = picType || "azimuth"
    if (picType === "random" || picType === "cap" || isLeadEdge) {
      type = this._getRandomPicType(complexity)
    }

    console.log("trying to find " + type)
    let drawFunc = this.DrawMap.get(type)
    if (drawFunc === undefined) {
      drawFunc = this.azimuthDraw
    }

    console.log("USING TYPE ---- ", drawFunc)
    return drawFunc
  }
}
