import { BRAA } from "classes/braa"
import { Point } from "classes/point"

export class Braaseye {
  bull: BRAA
  braa: BRAA
  private drawLoc: Point

  constructor(toPoint: Point, fromPoint: Point, bullseye: Point) {
    this.bull = bullseye.getBR(toPoint)
    this.braa = fromPoint.getBR(toPoint)
    this.drawLoc = toPoint
  }

  /**
   * Draw BRAASEYE, bearing and range to point from two reference points
   * (typically aircraft to target and bullseye to target)
   *
   * @param showMeasurements true iff braaseye should be drawn on drawing context
   * @param braaFirst true iff BRAA is displayed first, false to draw bullseye first
   * @param offsetX X position to draw at
   * @param offsetY Y position to draw at
   */
  draw(
    showMeasurements: boolean,
    braaFirst: boolean,
    offsetX = 0,
    offsetY = 0
  ): void {
    if (braaFirst) {
      this.braa.draw(
        this.drawLoc.x + 25 + offsetX,
        this.drawLoc.y + offsetY,
        "blue",
        showMeasurements
      )
      this.bull.draw(
        this.drawLoc.x + 25 + offsetX,
        this.drawLoc.y + 11 + offsetY,
        "black",
        showMeasurements
      )
    } else {
      this.bull.draw(
        this.drawLoc.x + 25 + offsetX,
        this.drawLoc.y + offsetY,
        "black",
        showMeasurements
      )
      this.braa.draw(
        this.drawLoc.x + 25 + offsetX,
        this.drawLoc.y + 11 + offsetY,
        "blue",
        showMeasurements
      )
    }
  }
}
