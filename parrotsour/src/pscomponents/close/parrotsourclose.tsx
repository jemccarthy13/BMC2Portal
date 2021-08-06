import React, { lazy, ReactElement, Suspense } from "react"

import "../../css/select.css"
import "../../css/slider.css"
import "../../css/parrotsour.css"
import "../../css/toggle.css"

import { InterceptQT } from "../quicktips/interceptQT"
import {
  BlueInThe,
  CanvasOrient,
  PictureAnswer,
} from "../../canvas/canvastypes"
import { SensorType } from "../../classes/aircraft/datatrail/sensortype"
import { FORMAT } from "../../classes/supportedformats"
import PSCookies from "../../utils/pscookies"
import CloseCommandBox from "./commandbox"

const ParrotSourHeader = lazy(() => import("../parrotsourheader"))
const ParrotSourControls = lazy(() => import("../parrotsourcontrols"))

const CloseCanvas = lazy(() => import("../../canvas/closecanvas"))
const VersionInfo = lazy(() => import("../../versioninfo"))

interface PSCState {
  speedSliderValue: number
  canvasConfig: CanvasOrient
  braaFirst: boolean
  animate: boolean
  newPic: boolean
  dataStyle: SensorType
  answer: PictureAnswer
}

/**
 * A Component to display intercept pictures on an HTML5 canvas
 */
export default class ParrotSourClose extends React.PureComponent<
  Record<string, unknown>,
  PSCState
> {
  constructor(props: Record<string, unknown>) {
    super(props)

    this.state = {
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
      newPic: false,
      animate: false,
      answer: {
        pic: "",
        groups: [],
      },
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
   * Called when an answer is avaiable; to be displayed in the answer collapsible
   * @param answer - the answer to the displayed picture
   */
  setAnswer = (answer: PictureAnswer): void => {
    this.setState({ answer })
  }

  /**
   * Called to display a new Picture
   */
  onNewPic = (): void => {
    this.setState({ animate: false })
    this.setState((prevState) => ({ newPic: !prevState.newPic }))
  }

  /**
   * Called when the BRAAFirst option is changed
   */
  braaChanged = (): void => {
    this.setState((prevState) => ({ braaFirst: !prevState.braaFirst }))
  }

  /**
   * Called to start the animation
   */
  startAnimate = (): void => {
    // const { answer } = this.state
    // answer.groups.forEach((grp) => grp.setCapping(false))
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

  onDataStyleChange = (): void => {
    const { dataStyle } = this.state
    if (dataStyle === SensorType.ARROW) {
      this.setState({ dataStyle: SensorType.RAW })
    } else {
      this.setState({ dataStyle: SensorType.ARROW })
    }
  }

  render(): ReactElement {
    const { canvasConfig, braaFirst } = this.state
    const { animate, newPic, speedSliderValue } = this.state
    const { answer } = this.state

    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <ParrotSourHeader comp={<InterceptQT />} />
        </Suspense>

        <hr />

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

        <br />
        <br />

        <Suspense fallback={<div />}>
          <div style={{ display: "inline-flex", width: "100%" }}>
            <CloseCanvas
              setAnswer={this.setAnswer}
              showMeasurements
              isHardMode={false}
              orientation={canvasConfig}
              braaFirst={braaFirst}
              picType="random"
              format={FORMAT.ALSA}
              newPic={newPic}
              animate={animate}
              sliderSpeed={speedSliderValue}
              resetCallback={this.pauseAnimate}
              animateCallback={this.startAnimate}
              dataStyle={SensorType.RAW}
              desiredNumContacts={0}
            />

            <CloseCommandBox answer={answer} />
          </div>
        </Suspense>

        <Suspense fallback={<div>Loading...</div>}>
          <VersionInfo />
        </Suspense>
      </div>
    )
  }
}
