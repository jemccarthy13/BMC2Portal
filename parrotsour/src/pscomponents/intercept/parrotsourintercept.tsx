import React, { ChangeEvent, lazy, ReactElement, Suspense } from "react"

import "../../css/select.css"
import "../../css/slider.css"
import "../../css/parrotsour.css"
import "../../css/toggle.css"

import { InterceptQT } from "../quicktips/interceptQT"
import {
  BlueInThe,
  PictureAnswer,
  CanvasOrient,
} from "../../canvas/canvastypes"
import { SensorType } from "../../classes/aircraft/datatrail/sensortype"
import { FORMAT } from "../../classes/supportedformats"
import PSCookies from "../../utils/pscookies"

const PicTypeSelector = lazy(() => import("./picoptionsbar"))
const StandardSelector = lazy(() => import("./standardselector"))
const ParrotSourHeader = lazy(() => import("../parrotsourheader"))
const ParrotSourControls = lazy(() => import("../parrotsourcontrols"))

const PictureCanvas = lazy(() => import("../../canvas/picturecanvas"))
const VersionInfo = lazy(() => import("../../versioninfo"))

interface PSIState {
  showAnswer: boolean
  showMeasurements: boolean
  isHardMode: boolean
  format: FORMAT
  speedSliderValue: number
  canvasConfig: CanvasOrient
  braaFirst: boolean
  picType: string
  answer: PictureAnswer
  animate: boolean
  newPic: boolean
  dataStyle: SensorType
}

/**
 * A Component to display intercept pictures on an HTML5 canvas
 */
export default class ParrotSourIntercept extends React.PureComponent<
  Record<string, unknown>,
  PSIState
> {
  constructor(props: Record<string, unknown>) {
    super(props)

    this.state = {
      showAnswer: false,
      showMeasurements: !PSCookies.getWantMeasure(),
      isHardMode: PSCookies.getHardMode(),
      format: FORMAT.ALSA,
      speedSliderValue: 50,
      canvasConfig: PSCookies.getOrientNS()
        ? {
            height: 600,
            width: 700,
            orient: BlueInThe.NORTH,
          }
        : {
            height: 500,
            width: 800,
            orient: BlueInThe.EAST,
          },
      braaFirst: PSCookies.getBraaFirst(),
      picType: "random",
      answer: {
        pic: "",
        groups: [],
      },
      newPic: false,
      animate: false,
      dataStyle: PSCookies.getDataStyleIsRadar()
        ? SensorType.RAW
        : SensorType.ARROW,
    }
    this.dummyCallback = this.pauseAnimate.bind(this)
  }

  dummyCallback: () => void

  /**
   * Called when the PSControls slider value is changed
   * @param value - new speed of the slider
   */
  onSliderChange = (value: number): void => {
    this.setState({ speedSliderValue: value })
  }

  /**
   * Called when the format selection changes
   * @param fmt - new format to use to generate answers
   */
  formatSelChange = (fmt: FORMAT): (() => void) => {
    return () => {
      this.setState({ format: fmt })
      this.onNewPic()
    }
  }

  /**
   * Called to display a new Picture
   */
  onNewPic = (): void => {
    this.setState({ animate: false })
    this.setState((prevState) => ({ newPic: !prevState.newPic }))
  }

  /**
   * Toggle the answer collapsible
   */
  handleRevealPic = (): void => {
    this.setState((prevState) => ({ showAnswer: !prevState.showAnswer }))
  }

  /**
   * Called when the BRAAFirst option is changed
   */
  braaChanged = (): void => {
    this.setState((prevState) => ({ braaFirst: !prevState.braaFirst }))
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
   * Called when an answer is avaiable; to be displayed in the answer collapsible
   * @param answer - the answer to the displayed picture
   */
  setAnswer = (answer: PictureAnswer): void => {
    this.setState({ answer })
  }

  /**
   * Called to start the animation
   */
  startAnimate = (): void => {
    const { answer } = this.state
    answer.groups.forEach((grp) => grp.setCapping(false))
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

    /**
     * TODO -- ORIENT -- add support for BlueInThe.N/S/E/W
     */
    let newConfig: CanvasOrient = {
      height: 600,
      width: 700,
      orient: BlueInThe.NORTH,
    }
    if (orient == BlueInThe.NORTH) {
      newConfig = {
        height: 500,
        width: 800,
        orient: BlueInThe.EAST,
      }
    }
    this.setState({ canvasConfig: newConfig })
  }

  /**
   * Called when the picture type selector changes values
   * @param e - ChangeEvent for the Select element
   */
  onChangePicType = (
    e: ChangeEvent<{ name?: string | undefined; value: unknown }>
  ): void => {
    if (typeof e.target.value === "string")
      this.setState({ picType: e.target.value })
  }

  onDataStyleChange = (): void => {
    const { dataStyle } = this.state
    if (dataStyle === SensorType.ARROW) {
      this.setState({ dataStyle: SensorType.RAW })
    } else {
      this.setState({ dataStyle: SensorType.ARROW })
    }
  }

  render(): ReactElement {
    const { showAnswer, answer, picType, dataStyle } = this.state
    const { canvasConfig, braaFirst, format } = this.state
    const { showMeasurements, isHardMode, animate, newPic, speedSliderValue } =
      this.state

    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <ParrotSourHeader comp={<InterceptQT />} answer={answer} />
        </Suspense>

        <hr />

        <Suspense fallback={<div />}>
          <StandardSelector selectionChanged={this.formatSelChange} />
        </Suspense>

        <Suspense fallback={<div />}>
          <PicTypeSelector
            handleChangePicType={this.onChangePicType}
            picType={picType}
            handleToggleHardMode={this.onToggleHardMode}
            handleNewPic={this.onNewPic}
            handleToggleMeasurements={this.onToggleMeasurements}
          />
        </Suspense>

        <Suspense fallback={<div />}>
          <ParrotSourControls
            handleSliderChange={this.onSliderChange}
            modifyCanvas={this.modifyCanvas}
            displayFirstChanged={this.braaChanged}
            startAnimate={this.startAnimate}
            pauseAnimate={this.pauseAnimate}
            handleDataStyleChange={this.onDataStyleChange}
          />
        </Suspense>

        <br />

        <button
          type="button"
          className={showAnswer ? "collapsible active" : "collapsible"}
          onClick={this.handleRevealPic}
        >
          Reveal Pic
        </button>
        {showAnswer && (
          <div
            className="content"
            id="answerDiv"
            style={{ color: "black", padding: "20px", whiteSpace: "pre-wrap" }}
          >
            {answer ? answer.pic : <div />}
          </div>
        )}
        <br />
        <br />
        <br />

        <Suspense fallback={<div />}>
          <PictureCanvas
            orientation={canvasConfig}
            braaFirst={braaFirst}
            picType={picType}
            format={format}
            showMeasurements={showMeasurements}
            isHardMode={isHardMode}
            setAnswer={this.setAnswer}
            newPic={newPic}
            animate={animate}
            sliderSpeed={speedSliderValue}
            resetCallback={this.dummyCallback}
            animateCallback={this.startAnimate}
            dataStyle={dataStyle}
          />
        </Suspense>

        <Suspense fallback={<div>Loading...</div>}>
          <VersionInfo />
        </Suspense>
      </div>
    )
  }
}
