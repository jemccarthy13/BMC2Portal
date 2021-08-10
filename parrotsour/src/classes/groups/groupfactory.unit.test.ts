import {
  BlueInThe,
  PictureCanvasProps,
  PictureCanvasState,
} from "../../canvas/canvastypes"
import { SensorType } from "../aircraft/datatrail/sensortype"
import { Point } from "../point"
import { FORMAT } from "../supportedformats"
import { AircraftGroup } from "./group"
import { GroupFactory } from "./groupfactory"

jest.mock("../../utils/psmath", () => {
  return {
    randomNumber: () => 55,
    randomHeading: () => 96,
    headingToRadians: () => 0.5,
  }
})

const randomPt = new Point(25, 25)
jest.mock("../../canvas/draw/intercept/pictureclamp", () => {
  return {
    getStartPos: () => {
      return { x: 25, y: 25 }
    },
  }
})

describe("GroupFactory", () => {
  const canvas = document.createElement("canvas")
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx = canvas.getContext("2d")!

  const fakeProps: PictureCanvasProps = {
    format: FORMAT.ALSA,
    setAnswer: jest.fn(),
    sliderSpeed: 50,
    orientation: { height: 400, width: 400, orient: BlueInThe.NORTH },
    picType: "azimuth",
    braaFirst: true,
    dataStyle: SensorType.ARROW,
    showMeasurements: true,
    isHardMode: false,
    newPic: false,
    animate: false,
    resetCallback: jest.fn(),
    animateCallback: jest.fn(),
    desiredNumContacts: 0,
  }

  const fakeState: PictureCanvasState = {
    bullseye: new Point(0, 0),
    blueAir: new AircraftGroup(),
    answer: { pic: "test", groups: [] },
    reDraw: jest.fn(),
  }

  it("creates_random_grp_at_loc", () => {
    const startPt = new Point(50, 50)
    const group = GroupFactory.randomGroupAtLoc(
      ctx,
      fakeProps,
      fakeState,
      new Point(50, 50),
      237
    )
    expect(group.getHeading()).toEqual(237)
    expect(group.getStartPos()).toEqual(startPt)
  })

  it("creates_random_grp_at_loc_random_hdg", () => {
    const startPt = new Point(50, 50)
    const group = GroupFactory.randomGroupAtLoc(
      ctx,
      fakeProps,
      fakeState,
      startPt
    )
    expect(group.getHeading()).toEqual(96)
    expect(group.getStartPos()).toEqual(startPt)
  })

  it("creates_default_random_group", () => {
    const grp = GroupFactory.randomGroup(ctx, fakeProps, fakeState)
    expect(grp.getStartPos()).toEqual(randomPt)
    expect(grp.getHeading()).toEqual(96)
  })

  it("creates_default_random_group_with_hdg", () => {
    const grp = GroupFactory.randomGroup(ctx, fakeProps, fakeState, 237)
    expect(grp.getStartPos()).toEqual(randomPt)
    expect(grp.getHeading()).toEqual(237)
  })
})
