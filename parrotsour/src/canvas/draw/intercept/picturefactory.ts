import DrawSingleGroup from "./singlegroup"
import DrawAzimuth from "./azimuth"
import DrawRange from "./range"
import DrawWall from "./wall"
import DrawLadder from "./ladder"
import DrawChampagne from "./champagne"
import DrawVic from "./vic"
import { randomNumber } from "../../../utils/psmath"
import { PictureDrawFunction } from "../../canvastypes"
import { drawEA } from "./ea"
import { drawThreat } from "./threat"
import { drawPOD } from "./pod"
import { drawLeadEdge } from "./leadingedge"
import { drawPackage } from "./packages"

export class PictureFactory {
  private static singleDraw = new DrawSingleGroup()
  private static azimuthDraw = new DrawAzimuth()
  private static rangeDraw = new DrawRange()
  private static wallDraw = new DrawWall()
  private static ladderDraw = new DrawLadder()
  private static champDraw = new DrawChampagne()
  private static vicDraw = new DrawVic()

  // A list of all avaiable functions
  private static functions: { [key: string]: PictureDrawFunction } = {
    azimuth: PictureFactory.azimuthDraw.draw,
    range: PictureFactory.rangeDraw.draw,
    ladder: PictureFactory.ladderDraw.draw,
    wall: PictureFactory.wallDraw.draw,
    vic: PictureFactory.vicDraw.draw,
    champagne: PictureFactory.champDraw.draw,
    threat: drawThreat,
    ea: drawEA,
    pod: drawPOD,
    "leading edge": drawLeadEdge,
    package: drawPackage,
    singlegroup: PictureFactory.singleDraw.draw,
  }

  /**
   * Pick a random picture type for drawing
   * @param leadingEdge - true iff leading edge or packages. Set to true to
   * limit the types of pictures to the standard (with caveat: wall is
   * not allowed in lead edge/pkg due to separation requirement)
   */
  private static _getRandomPicType = (
    leadingEdge: boolean,
    desiredNumContacts: number
  ): string => {
    //const numType = randomNumber(0, leadingEdge ? 3 : 8)
    const type1 = ["singlegroup"]
    const type2 = type1.concat(["range", "azimuth", "cap"])
    const type3 = type2.concat(["vic", "champagne", "wall", "ladder"])
    const type4 = type3.concat(["leading edge", "package"])

    const types = [[], type1, type2, type3, type4]

    if (desiredNumContacts === 0) {
      desiredNumContacts = 4
    }
    const numType = randomNumber(0, types[desiredNumContacts].length - 1)

    console.log(types[desiredNumContacts][numType])
    return types[desiredNumContacts][numType]
  }

  public static getPictureDraw(
    picType: string,
    forced?: boolean,
    desiredNumContacts?: number
  ): PictureDrawFunction {
    const isLeadEdge =
      picType === "leading edge" || picType === "package" || picType === "ea"

    desiredNumContacts = desiredNumContacts ? desiredNumContacts : 0
    let type = "azimuth"
    if (forced) {
      type = this._getRandomPicType(true, desiredNumContacts)
    } else {
      type =
        picType === "random" || picType === "cap"
          ? this._getRandomPicType(isLeadEdge, desiredNumContacts)
          : picType
    }
    const drawFunc: PictureDrawFunction =
      this.functions[type] || this.azimuthDraw.draw

    console.log("GENERATING TYPE ---- " + type)
    return drawFunc
  }
}
