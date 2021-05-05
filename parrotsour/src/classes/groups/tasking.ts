import { Point } from "../point"

export type TaskingParams = {
  id?: string
  locationXY?: Point
  locationStr?: string
  description?: string
}

export default class Tasking {
  private taskData: TaskingParams
  constructor(info: TaskingParams) {
    this.taskData = info
  }

  public toString(): string {
    return (
      "// TASKING " +
      this.taskData.id +
      " // " +
      this.taskData.locationStr +
      " // " +
      this.taskData.description
    )
  }

  public getID(): string | undefined {
    return this.taskData.id
  }

  public getLocationXY(): Point | undefined {
    return this.taskData.locationXY
  }

  public getLocationStr(): string | undefined {
    return this.taskData.locationStr
  }

  public getDescription(): string | undefined {
    return this.taskData.description
  }
}
