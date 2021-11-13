/* istanbul ignore file */
import { BRAA } from "../../../classes/braa"
import { Point } from "../../../classes/point"

export class Package {
  private label = ""
  private anchor = true
  private bullseye: BRAA = new BRAA(-1, -1)
  private bullPt: Point = new Point(-1, -1)

  public getLabel(): string {
    return this.label
  }
  public setLabel(s: string): void {
    this.label = s
  }

  isAnchor(): boolean {
    return this.anchor
  }

  setAnchor(b: boolean): void {
    this.anchor = b
  }

  getBullseye(): BRAA {
    return this.bullseye
  }

  setBullseye(bull: BRAA): void {
    this.bullseye = bull
  }

  getBullseyePt(): Point {
    return this.bullPt
  }

  setBullseyePt(p: Point): void {
    this.bullPt = p
  }

  format(): string {
    return (
      this.getLabel() + " PACKAGE BULLSEYE " + this.getBullseye().toString()
    )
  }
}
