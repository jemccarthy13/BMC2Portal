import { PaintBrush } from "../../canvas/draw/paintbrush"
import { AircraftGroup } from "./group"

/**
 * Draw a capping group
 *
 * TODO -- since it takes only group now, maybe move to group file?
 *
 * @param {AircraftGroup} group Group to draw capping
 */
export function drawGroupCap(group: AircraftGroup): void {
  const c = PaintBrush.getContext()

  const id = group.getIDMatrix()

  c.lineWidth = 1
  c.fillStyle = id
  c.strokeStyle = id

  c.beginPath()

  let radius = 10

  const startPos = group.getStartPos()
  const startX = startPos.x
  const startY = startPos.y

  const strength = group.getStrength()

  if (strength === 1) {
    c.arc(startX, startY, 10, 1.0 * Math.PI, 0.8 * Math.PI)
    c.stroke()
    PaintBrush.drawLine(startX - 8, startY + 6, startX - 6, startY + 12, id)
  } else {
    const ratio = 2 / strength - 0.1
    let startPI = 0
    let endPI = ratio
    radius = 12
    for (let x = 1; x <= strength; x++) {
      c.arc(startX, startY, radius, startPI * Math.PI, endPI * Math.PI)
      c.stroke()

      const opp: number = radius * Math.sin(endPI * Math.PI)
      const adj: number = radius * Math.cos(endPI * Math.PI)

      const endy = startY + opp
      const endx = startX + adj

      c.beginPath()
      c.moveTo(startX + adj * 0.6, startY + opp * 0.9)
      c.lineTo(endx, endy)
      c.stroke()
      c.beginPath()

      startPI = endPI + 0.1
      endPI = startPI + ratio
    }
  }
}
