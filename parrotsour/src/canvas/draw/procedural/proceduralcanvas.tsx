import React, { ReactElement } from "react"

import DrawingCanvas from "../../drawingcanvas"

import { PictureAnswer, PictureCanvasProps } from "../../../canvas/canvastypes"

import { drawLine, drawText } from "../drawutils"
import { AircraftGroup } from "../../../classes/groups/group"
import { randomNumber } from "../../../utils/psmath"
import { Point } from "../../../classes/point"
import { getStartPos } from "../../../canvas/draw/intercept/pictureclamp"
import { IDMatrix } from "../../../classes/aircraft/id"
import ParrotSourCanvas from "../../parrotsourcanvas"
import { ProceduralAnimationHandler } from "../../../animation/proceduralanimator"

/**
 * This component is the main control for drawing pictures for procedural control
 */
export default class ProceduralCanvas extends ParrotSourCanvas {
  constructor(props: PictureCanvasProps) {
    super(props)
    this.state = {
      bullseye: Point.DEFAULT,
      blueAir: new AircraftGroup({ sx: -1000, sy: -1000 }),
      reDraw: this.drawPicture,
      answer: { pic: "", groups: [] },
    }
    this.animationHandler = new ProceduralAnimationHandler()
  }

  /**
   * This lifecycle function serves as a check to make sure the only props
   * value that changed is the animation value (i.e. button pressed) so the
   * animation is not re-triggered when any other prop value changes
   * @param prevProps - previous set of PicCanvasProps
   */
  componentDidUpdate = (prevProps: PictureCanvasProps): void => {
    this._componentDidUpdate(prevProps)
  }

  /**
   * Perform a picture draw on the drawing context using the correct DrawFunction
   * @param context The context of the drawing context
   * @param forced true iff picture type should be forced as random, !lead edge and !packages
   * @param start (optional) start position for the picture
   */
  drawPicture = (
    ctx: CanvasRenderingContext2D,
    forced?: boolean,
    start?: Point
  ): PictureAnswer => {
    const { orientation, dataStyle } = this.props
    const { blueAir } = this.state

    blueAir.setCapping(true)

    const startPos = getStartPos(ctx, blueAir, orientation.orient, dataStyle, {
      start,
    })

    const grp = new AircraftGroup({
      sx: startPos.x,
      sy: startPos.y,
      nContacts: 1,
      id: IDMatrix.FRIEND,
    })

    grp.setCapping(true)
    grp.addRoutingPoint(startPos)
    grp.setLabel("VR01")

    grp.updateIntent({
      desiredAlt: grp.getAltitude(),
    })

    grp.draw(ctx, dataStyle)

    const grpPos = grp.getCenterOfMass(dataStyle)

    drawText(ctx, grp.getLabel(), grpPos.x, grpPos.y + 35, 12)
    return {
      pic: "",
      groups: [grp],
    }
  }

  drawCGRSGrid = (ctx: CanvasRenderingContext2D): void => {
    for (let x = 0; x < ctx.canvas.width; x += 40) {
      if (x % 120 === 0) {
        drawLine(ctx, x, 0, x, ctx.canvas.height)
      } else {
        drawLine(ctx, x, 0, x, ctx.canvas.height, "gray")
      }
    }
    for (let y = 0; y < ctx.canvas.height; y += 40) {
      if (y % 120 === 0) {
        drawLine(ctx, 0, y, ctx.canvas.width, y)
      } else {
        drawLine(ctx, 0, y, ctx.canvas.width, y, "gray")
      }
    }

    const startRow = randomNumber(5, 158)
    const startCol1 = randomNumber(0, 25)
    const startCol2 = randomNumber(0, 26)

    localStorage.startRow = startRow
    localStorage.startCol1 = startCol1
    localStorage.startCol2 = startCol2

    const chr = (n: number): string => {
      return String.fromCharCode(65 + n)
    }

    let colC = 0
    let off = 0
    let rowC = startRow
    let col2Chr = startCol2
    for (let y = 10; y < ctx.canvas.height; y += 120) {
      for (let x = 10; x < ctx.canvas.width; x += 120) {
        if (col2Chr + colC > 25) {
          col2Chr = 0
          off++
          colC = 0
        }
        drawText(
          ctx,
          rowC + chr(startCol1 + off) + chr(col2Chr + colC),
          x + 33,
          y + 60
        )
        colC++
      }
      col2Chr = startCol2
      colC = 0
      off = 0
      rowC++
    }
  }

  /**
   * Draw function to be called from the Canvas component - handles pre-picture logic
   * (i.e. blue arrows, bullseye, and image 'snap' for mouse draw)
   * @param context the drawing context to draw in
   */
  draw = async (
    ctx: CanvasRenderingContext2D | null | undefined
  ): Promise<void> => {
    if (ctx === null || ctx === undefined) return

    this.drawCGRSGrid(ctx)

    const imageData = ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    )
    const answer: PictureAnswer = this.drawPicture(ctx)

    const { setAnswer } = this.props
    setAnswer(answer)
    this.setState({ ctx, answer, animateCanvas: imageData })
  }

  render(): ReactElement {
    const {
      orientation,
      braaFirst,
      picType,
      showMeasurements,
      isHardMode,
      newPic,
      resetCallback,
      animateCallback,
      animate,
      dataStyle,
    } = this.props
    const { bullseye, answer } = this.state
    return (
      <DrawingCanvas
        answer={answer}
        draw={this.draw}
        orientation={orientation}
        braaFirst={braaFirst}
        bullseye={bullseye}
        picType={picType}
        showMeasurements={showMeasurements}
        isHardMode={isHardMode}
        newPic={newPic}
        resetCallback={resetCallback}
        animate={animate}
        animateCallback={animateCallback}
        dataStyle={dataStyle}
      />
    )
  }
}
