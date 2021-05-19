import React from "react"
import { mount } from "enzyme"
import DrawingCanvas, { CanvasMouseEvent } from "./drawingcanvas"

import { Point } from "../classes/point"
import { BlueInThe, DrawCanvasProps } from "./canvastypes"
import { SensorType } from "../classes/aircraft/datatrail/sensortype"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const canvasSerializer = require("jest-canvas-snapshot-serializer")
expect.addSnapshotSerializer(canvasSerializer)

/**
 * Mock draw function for a drawing canvas
 * @param context the Context to draw in
 */
const drawMock = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ctx: CanvasRenderingContext2D | null | undefined
): Promise<void> => {
  return new Promise(jest.fn())
}

const testProps: DrawCanvasProps = {
  draw: drawMock,
  bullseye: new Point(0, 0),
  orientation: { height: 400, width: 400, orient: BlueInThe.NORTH },
  picType: "azimith",
  braaFirst: true,
  dataStyle: SensorType.ARROW,
  newPic: false,
  animate: false,
  resetCallback: jest.fn(),
  animateCallback: jest.fn(),
  answer: { pic: "2 GRPS AZ", groups: [] },
  showMeasurements: true,
  isHardMode: false,
}

describe("drawingCanvas", () => {
  let drawingCanvas = mount(<DrawingCanvas {...testProps} />)

  it("renders", () => {
    expect(drawingCanvas).not.toBe(null)
  })

  it("mousemove_singular", () => {
    drawingCanvas = mount(<DrawingCanvas {...testProps} />)
    expect(drawingCanvas).not.toBe(null)

    const moveEvent: CanvasMouseEvent = {
      clientX: 50,
      clientY: 50,
      getModifierState: () => false,
    }

    const mouseCanvas = drawingCanvas.find("#mousecanvas")
    mouseCanvas.simulate("mousemove", { ...moveEvent })

    const mCanvasInstance = mouseCanvas.instance()
    expect(mCanvasInstance).toMatchSnapshot()
  })

  it("mousemove_multiple", () => {
    drawingCanvas = mount(<DrawingCanvas {...testProps} />)
    expect(drawingCanvas).not.toBe(null)

    const moveEvent: CanvasMouseEvent = {
      clientX: 50,
      clientY: 50,
      getModifierState: () => false,
    }
    const moveEvent2: CanvasMouseEvent = {
      clientX: 75,
      clientY: 50,
      getModifierState: () => false,
    }

    const mouseCanvas = drawingCanvas.find("#mousecanvas")
    mouseCanvas.simulate("mousemove", { ...moveEvent })
    mouseCanvas.simulate("mousemove", { ...moveEvent2 })

    const mCanvasInstance = mouseCanvas.instance()
    expect(mCanvasInstance).toMatchSnapshot()
  })

  it("click_and_drag", () => {
    drawingCanvas = mount(<DrawingCanvas {...testProps} />)
    expect(drawingCanvas).not.toBe(null)

    const moveEvent: CanvasMouseEvent = {
      clientX: 50,
      clientY: 50,
      getModifierState: () => false,
    }
    const moveEvent2: CanvasMouseEvent = {
      clientX: 75,
      clientY: 50,
      getModifierState: () => false,
    }

    const mouseCanvas = drawingCanvas.find("#mousecanvas")
    mouseCanvas.simulate("mousedown", { ...moveEvent })
    mouseCanvas.simulate("mousemove", { ...moveEvent2 })
    mouseCanvas.simulate("mouseup", { ...moveEvent2 })

    const mCanvasInstance = mouseCanvas.instance()
    expect(mCanvasInstance).toMatchSnapshot()
  })
})
