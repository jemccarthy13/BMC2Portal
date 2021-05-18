import React from "react"
import { shallow } from "enzyme"
import DrawingCanvas from "./drawingcanvas"

import { Point } from "../classes/point"
import { BlueInThe } from "./canvastypes"
import { SensorType } from "../classes/aircraft/datatrail/sensortype"

// eslint-disable-next-line @typescript-eslint/no-empty-function
function emptyFunc() {}

/**
 * Mock draw function for a drawing canvas
 * @param context the Context to draw in
 */
const drawMock = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ctx: CanvasRenderingContext2D | null | undefined
): Promise<void> => {
  return new Promise(emptyFunc)
}

describe("drawingCanvas", () => {
  it("isACanvas", () => {
    const canvasMock = shallow(
      <DrawingCanvas
        draw={drawMock}
        bullseye={new Point(0, 0)}
        orientation={{ height: 400, width: 400, orient: BlueInThe.NORTH }}
        picType="azimuth"
        braaFirst
        dataStyle={SensorType.ARROW}
        showMeasurements
        isHardMode={false}
        newPic
        animate
        animateCallback={emptyFunc}
        answer={{ pic: "2 GRPS AZ", groups: [] }}
      />
    )

    expect(canvasMock).not.toBe(null)
  })
})
