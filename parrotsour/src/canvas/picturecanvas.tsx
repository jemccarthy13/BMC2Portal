// Components
import ParrotSourCanvas from "../canvas/parrotsourcanvas"

// Interfaces
import {
  BlueInThe,
  PictureAnswer,
  PictureCanvasState,
  PictureCanvasProps,
} from "../canvas/canvastypes"
import { AircraftGroup } from "../classes/groups/group"
import { Point } from "../classes/point"

// Functions
import { drawBullseye, drawFullInfo } from "./draw/drawutils"
import { IDMatrix } from "../classes/aircraft/id"
import { randomNumber } from "../utils/psmath"
import { PaintBrush } from "./draw/paintbrush"
import { PictureFactory } from "./draw/intercept/picturefactory"
import { DrawPic } from "./draw/intercept/drawpic"

/**
 * This component is the main control for drawing pictures for intercepts.
 *
 * To implement a new [yourtype]Canvas, extend ParrotSourCanvas.
 * Provide a new AnimationHandler in the constructor, and provide a
 * new 'draw' function that handles the drawing.
 */
export default class PictureCanvas extends ParrotSourCanvas {
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

    const drawFunc: DrawPic = PictureFactory.getPictureDraw(
      picType,
      desiredNumContacts,
      forced
    )

    drawFunc.initialize(context, this.props, this.state)

    const answer = drawFunc.draw(
      context,
      picType === "cap",
      desiredNumContacts,
      start
    )

    const { blueAir } = this.state
    const { dataStyle } = this.props
    const bluePos = blueAir.getCenterOfMass(dataStyle)

    blueAir.updateIntent({
      desiredHeading: bluePos.getBR(answer.groups[0].getCenterOfMass(dataStyle))
        .bearingNum,
    })

    answer.groups.forEach((grp) => {
      const grpPos = grp.getCenterOfMass(dataStyle)
      const bearingToBlue = grpPos.getBR(bluePos).bearingNum
      grp.updateIntent({
        desiredHeading: Math.round(bearingToBlue / 90.0) * 90,
      })
    })

    return answer
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
