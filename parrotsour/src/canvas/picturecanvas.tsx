// Components
import ParrotSourCanvas from "../canvas/parrotsourcanvas"

// Interfaces
import {
  BlueInThe,
  PictureAnswer,
  PictureDrawFunction,
  PictureCanvasState,
  PictureCanvasProps,
} from "../canvas/canvastypes"
import { AircraftGroup } from "../classes/groups/group"
import { Point } from "../classes/point"

// Functions
import { drawBullseye, drawFullInfo } from "./draw/drawutils"
import { drawLadder } from "../canvas/draw/intercept/ladder"
import { drawVic } from "../canvas/draw/intercept/vic"
import { drawChampagne } from "../canvas/draw/intercept/champagne"
import { drawPackage } from "../canvas/draw/intercept/packages"
import { drawLeadEdge } from "./draw/intercept/leadingedge"
import { drawThreat } from "./draw/intercept/threat"
import { drawEA } from "./draw/intercept/ea"
import { drawPOD } from "./draw/intercept/pod"
import { IDMatrix } from "../classes/aircraft/id"
import { randomNumber } from "../utils/psmath"
import { PaintBrush } from "./draw/paintbrush"
import DrawSingleGroup from "./draw/intercept/singlegroup"
import DrawAzimuth from "./draw/intercept/azimuth"
import DrawRange from "./draw/intercept/range"
import DrawWall from "./draw/intercept/drawwall"

/**
 * This component is the main control for drawing pictures for intercepts.
 *
 * To implement a new [yourtype]Canvas, extend ParrotSourCanvas.
 * Provide a new AnimationHandler in the constructor, and provide a
 * new 'draw' function that handles the drawing.
 */
export default class PictureCanvas extends ParrotSourCanvas {
  /**
   * Pick a random picture type for drawing
   * @param leadingEdge - true iff leading edge or packages. Set to true to
   * limit the types of pictures to the standard (with caveat: wall is
   * not allowed in lead edge/pkg due to separation requirement)
   */
  getRandomPicType = (
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

  /**
   * On dataStyle change only re-draw the current picture.
   */
  componentDidUpdate = (prevProps: PictureCanvasProps): void => {
    this._componentDidUpdate(prevProps)
    let animateImage = undefined
    const ctx = PaintBrush.getContext()
    if (
      prevProps.isHardMode !== this.props.isHardMode ||
      prevProps.orientation !== this.props.orientation ||
      prevProps.picType !== this.props.picType
    ) {
      if (this.props.resetCallback) this.props.resetCallback()
    }
    if (
      prevProps.dataStyle !== this.props.dataStyle ||
      prevProps.showMeasurements !== this.props.showMeasurements ||
      prevProps.braaFirst !== this.props.braaFirst
    ) {
      if (
        this.props.animate === prevProps.animate &&
        prevProps.animate === true
      ) {
        this.animationHandler.pauseFight()
      }
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      drawBullseye(PaintBrush.getContext(), this.state.bullseye)
      animateImage = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)

      this.state.answer.groups.forEach((grp) => {
        grp.draw(ctx, this.props.dataStyle)
      })
      this.state.blueAir.draw(PaintBrush.getContext(), this.props.dataStyle)
      drawFullInfo(ctx, this.state, this.props, this.state.answer.groups)
      if (
        this.props.animate === prevProps.animate &&
        prevProps.animate === true
      ) {
        this.animationHandler.animate(
          ctx,
          this.props,
          this.state,
          this.state.answer.groups,
          animateImage,
          this.props.resetCallback
        )
      }
    }
  }

  /**
   * Perform a picture draw on the drawing context using the correct DrawFunction
   *
   * @param context The context of the v
   * @param forced true iff picture type should be forced as random, !lead edge and !packages
   * @param start (optional) start position for the picture
   */
  drawPicture = (
    context: CanvasRenderingContext2D,
    forced?: boolean,
    start?: Point
  ): PictureAnswer => {
    const { picType } = this.props
    const { desiredNumContacts } = this.props

    const isLeadEdge =
      picType === "leading edge" || picType === "package" || picType === "ea"

    let type = "azimuth"
    if (forced) {
      type = this.getRandomPicType(true, desiredNumContacts)
    } else {
      type =
        picType === "random" || picType === "cap"
          ? this.getRandomPicType(isLeadEdge, desiredNumContacts)
          : picType
    }

    console.log("TYPE ---- " + type)

    const drawFunc: PictureDrawFunction =
      this.functions[type] || this.azimuthDraw.draw

    const answer = drawFunc(
      context,
      this.props,
      this.state,
      picType === "cap",
      desiredNumContacts,
      start
    )

    const { blueAir } = this.state
    blueAir.updateIntent({
      desiredHeading: blueAir
        .getCenterOfMass(this.props.dataStyle)
        .getBR(answer.groups[0].getCenterOfMass(this.props.dataStyle))
        .bearingNum,
    })

    answer.groups.forEach((grp) => {
      const bearingToBlue = grp
        .getCenterOfMass(this.props.dataStyle)
        .getBR(blueAir.getCenterOfMass(this.props.dataStyle)).bearingNum
      grp.updateIntent({
        desiredHeading: Math.round(bearingToBlue / 90.0) * 90,
      })
    })

    return answer
  }

  singleDraw = new DrawSingleGroup()
  azimuthDraw = new DrawAzimuth()
  rangeDraw = new DrawRange()
  wallDraw = new DrawWall()

  // A list of all avaiable functions
  functions: { [key: string]: PictureDrawFunction } = {
    azimuth: this.azimuthDraw.draw,
    range: this.rangeDraw.draw,
    ladder: drawLadder,
    wall: this.wallDraw.draw,
    vic: drawVic,
    champagne: drawChampagne,
    //cap: drawCap,
    threat: drawThreat,
    ea: drawEA,
    pod: drawPOD,
    "leading edge": drawLeadEdge,
    package: drawPackage,
    singlegroup: this.singleDraw.draw,
  }

  /**
   * Draw function to be called from the Canvas component - handles pre-picture logic
   * (i.e. blue arrows, bullseye, and image 'snap' for mouse draw)
   * @param context the Context to draw in
   */
  draw = async (ctx: CanvasRenderingContext2D): Promise<void> => {
    const bullseye = drawBullseye(ctx)

    let xPos = ctx.canvas.width - 20
    let yPos = randomNumber(ctx.canvas.height * 0.33, ctx.canvas.height * 0.66)
    let heading = 270

    const { orientation } = this.props

    if (orientation.orient === BlueInThe.NORTH) {
      xPos = randomNumber(ctx.canvas.width * 0.33, ctx.canvas.width * 0.66)
      yPos = 20
      heading = 180
    }

    const blueAir = new AircraftGroup({
      ctx,
      sx: xPos,
      sy: yPos,
      hdg: heading,
      nContacts: 4,
      id: IDMatrix.FRIEND,
    })

    await this.setState({ blueAir, bullseye })

    const blueOnly = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)

    const answer: PictureAnswer = this.drawPicture(ctx)
    this.props.setAnswer(answer)

    blueAir.draw(ctx, this.props.dataStyle)

    this.setState({ ctx, answer, animateCanvas: blueOnly })
  }

  state: PictureCanvasState = {
    ...this.state,
    reDraw: this.drawPicture,
  }
}
