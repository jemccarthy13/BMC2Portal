import React, { ReactElement } from "react"

// Components
import DrawingCanvas from "../canvas/drawingcanvas"

// Classes & types
import {
  PictureAnswer,
  PictureCanvasProps,
  PictureCanvasState,
} from "../canvas/canvastypes"
import { PicAnimationHandler } from "../animation/picanimator"
import { AircraftGroup } from "../classes/groups/group"
import { AnimationHandler } from "../animation/animationhandler"

// Functions
import { drawFullInfo } from "../canvas/draw/drawutils"
import { Point } from "../classes/point"

/**
 * This component is the main control for drawing pictures for intercepts
 */
export default abstract class ParrotSourCanvas extends React.PureComponent<
  PictureCanvasProps,
  PictureCanvasState
> {
  constructor(props: PictureCanvasProps) {
    super(props)
    this.state = {
      bullseye: Point.DEFAULT,
      blueAir: new AircraftGroup(), // TODO -- avoid creating new group twice just for it to be GC'd
      reDraw: (): PictureAnswer => {
        throw "Should not use parent reDraw"
      },
      answer: { pic: "", groups: [] },
    }
    this.animationHandler = new PicAnimationHandler()
  }

  /**
   * This lifecycle function serves as a check to make sure the only props
   * value that changed is the animation value (i.e. button pressed) so the
   * animation is not re-triggered when any other prop value changes
   * @param prevProps - previous set of PicCanvasProps
   */
  componentDidUpdate = (prevProps: PictureCanvasProps): void => {
    const oldAnimate = prevProps.animate
    const { animate } = this.props

    if (oldAnimate !== animate) {
      const { animate, showMeasurements, braaFirst, resetCallback } = this.props
      const { ctx, animateCanvas, answer } = this.state
      if (ctx) {
        if (animate) {
          if (animateCanvas) {
            this.animationHandler.continueAnimate = true
            this.animationHandler.animate(
              ctx,
              this.props,
              this.state,
              answer.groups,
              animateCanvas,
              resetCallback
            )
          }
        } else {
          const callback = () =>
            drawFullInfo(
              ctx,
              this.state,
              braaFirst,
              showMeasurements,
              answer.groups
            )
          this.animationHandler.pauseFight(callback)
        }
      }
    }
  }

  animationHandler: AnimationHandler

  draw = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ctx: CanvasRenderingContext2D | null | undefined
  ): Promise<void> => {
    return undefined
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
    const { bullseye } = this.state
    return (
      <DrawingCanvas
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
