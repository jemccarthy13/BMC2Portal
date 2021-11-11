export default class RangeBack {
  public label = ""
  public range = -1
  toString = (): string => {
    return this.label + " " + this.range
  }
  constructor(lbl: string, rng: number) {
    this.label = lbl
    this.range = rng
  }
}
