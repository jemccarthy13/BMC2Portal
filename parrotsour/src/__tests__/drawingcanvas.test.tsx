import React from "react"
import { shallow } from "enzyme"
import DrawingCanvas from "../canvas/drawingcanvas"

import { Point } from "../classes/point"
import { BlueInThe } from "../canvas/canvastypes"
import { SensorType } from "../classes/groups/datatrail"

// eslint-disable-next-line @typescript-eslint/no-empty-function
function emptyFunc() {}

/**
 * Mock draw function for a drawing canvas
 * @param context the Context to draw in
 */
const drawMock = async (
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
        orientation={{ height: 500, width: 800, orient: BlueInThe.NORTH }}
        picType="azimuth"
        braaFirst
        dataStyle={SensorType.ARROW}
        showMeasurements
        isHardMode={false}
        newPic
        animate
        animateCallback={emptyFunc}
      />
    )
  })
})
