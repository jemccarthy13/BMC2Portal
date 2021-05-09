import "regenerator-runtime/runtime"
import React, { lazy, ReactElement, Suspense } from "react"

import "../../css/select.css"
import "../../css/slider.css"
import "../../css/parrotsour.css"
import "../../css/toggle.css"
import "../../css/togglebuttongroup.css"

import { ProceduralQT } from "../quicktips/proceduralQT"
import DifficultySelector from "./difficultyselector"
import ChatBox from "./chatbox"
import {
  BlueInThe,
  PictureAnswer,
  CanvasOrient,
} from "../../canvas/canvastypes"
import { SensorType } from "../../classes/aircraft/datatrail/sensortype"
import { FORMAT } from "../../classes/supportedformats"

const ProceduralCanvas = lazy(
  () => import("../../canvas/draw/procedural/proceduralcanvas")
)

const ParrotSourHeader = lazy(() => import("../parrotsourheader"))
const ParrotSourControls = lazy(() => import("../parrotsourcontrols"))

const VersionInfo = lazy(() => import("../../versioninfo"))

interface PSPState {
  showMeasurements: boolean
  isHardMode: boolean
  speedSliderValue: number
  canvasConfig: CanvasOrient
  braaFirst: boolean
  animate: boolean
  newPic: boolean
  answer: PictureAnswer
  // picType: string // for easy/med/hard tracking
}

/**
 * A Component to display procedural control on an HTML5 canvas
 */
export default class ParrotSourProcedural extends React.PureComponent<
  Record<string, unknown>,
  PSPState
> {
  constructor(props: Record<string, unknown>) {
    super(props)
    this.state = {
      showMeasurements: true,
      isHardMode: false,
      speedSliderValue: 50,
      canvasConfig: {
        height: 500,
        width: 800,
        orient: BlueInThe.EAST,
      },
      braaFirst: true,
      newPic: false,
      animate: false,
      answer: {
        pic: "",
        groups: [],
      },
      // picType: "easy" // to be added later, to change simulation difficulty
    }
  }

  /**
   * Called when the PSControls slider value is changed
   * @param value - new speed of the slider
   */
  onSliderChange = (value: number): void => {
    this.setState({ speedSliderValue: value })
  }

  /**
   * Called to display a new Picture
   */
  onNewPic = (): void => {
    this.setState((prevState) => ({ newPic: !prevState.newPic }))
  }

  /**
   * Called when the "Show Measurements" check box changes values
   */
  onToggleMeasurements = (): void => {
    this.setState((prevState) => ({
      showMeasurements: !prevState.showMeasurements,
    }))
  }

  /**
   * Called when the hard mode check box changes values
   */
  onToggleHardMode = (): void => {
    this.setState((prevState) => ({ isHardMode: !prevState.isHardMode }))
  }

  /**
   * Called to start the animation
   */
  startAnimate = (): void => {
    this.setState({ animate: true })
  }

  /**
   * Called to pause the animation
   */
  pauseAnimate = (): void => {
    this.setState({ animate: false })
  }

  /**
   * Called when the orienation is changed, to modify the canvas dimensions
   */
  modifyCanvas = (): void => {
    const { canvasConfig } = this.state
    const { orient } = canvasConfig

    let newConfig = {
      height: 700,
      width: 600,
      orient: BlueInThe.NORTH,
    }
    if (orient === BlueInThe.NORTH) {
      newConfig = {
        height: 500,
        width: 800,
        orient: BlueInThe.EAST,
      }
    }
    this.setState({ canvasConfig: newConfig })
  }

  setAnswer = (answer: PictureAnswer): void => {
    this.setState({ answer })
  }

  /**
   * Do nothing if changing style for procedural
   */
  onDataStyleChange = (): void => {
    // do nothing
  }

  render(): ReactElement {
    const { canvasConfig, braaFirst, answer } = this.state
    const {
      showMeasurements,
      isHardMode,
      animate,
      newPic,
      speedSliderValue,
    } = this.state
    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <ParrotSourHeader comp={<ProceduralQT />} answer={answer} />
        </Suspense>

        <hr />

        <DifficultySelector />

        <Suspense fallback={<div />}>
          <ParrotSourControls
            handleSliderChange={this.onSliderChange}
            modifyCanvas={this.modifyCanvas}
            displayFirstChanged={this.onToggleMeasurements}
            startAnimate={this.startAnimate}
            pauseAnimate={this.pauseAnimate}
            handleDataStyleChange={this.onDataStyleChange}
          />
        </Suspense>

        <br />

        <Suspense fallback={<div />}>
          <div style={{ display: "inline-flex", width: "100%" }}>
            <ProceduralCanvas
              orientation={canvasConfig}
              braaFirst={braaFirst}
              picType="random"
              format={FORMAT.ALSA}
              showMeasurements={showMeasurements}
              isHardMode={isHardMode}
              setAnswer={this.setAnswer}
              newPic={newPic}
              animate={animate}
              sliderSpeed={speedSliderValue}
              resetCallback={this.pauseAnimate}
              animateCallback={this.startAnimate}
              dataStyle={SensorType.ARROW}
            />

            <ChatBox answer={answer} />
          </div>
        </Suspense>

        <Suspense fallback={<div>Loading...</div>}>
          <VersionInfo />
        </Suspense>
      </div>
    )
  }
}
