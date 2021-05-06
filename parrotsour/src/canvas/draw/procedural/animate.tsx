// Interfaces
import { AircraftGroup } from "../../../classes/groups/group"
import {
  PictureCanvasProps,
  PictureCanvasState,
} from "../../../canvas/canvastypes"

import PSAlert from "../../../pscomponents/psalert"

// Functions
import { drawAltitudes, drawGroupCap, drawText } from "../drawutils"
import { randomNumber } from "../../../utils/psmath"

let continueAnimation = false

function sleep(milliseconds: number): void {
  const start = new Date().getTime()
  for (let i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break
    }
  }
}

export function getContinueAnimate(): boolean {
  return continueAnimation
}

function setContinueAnimate(val: boolean) {
  continueAnimation = val
}

export function pauseFight(): void {
  setContinueAnimate(false)
}

function checkForCoAltitude(
  groups1: AircraftGroup[],
  groups2: AircraftGroup[]
) {
  const result = groups1.filter((grp: AircraftGroup) =>
    groups2.some((grp2) => {
      grp.getAltitude() === grp2.getAltitude() &&
        grp.getCenterOfMass().getBR(grp2.getCenterOfMass()).range <= 20
    })
  )
  if (result.length !== 0) {
    PSAlert.error("CoAlt!")
  }
}

function doAnimation(
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  groups: AircraftGroup[],
  animateCanvas: ImageData,
  resetCallback?: (showMeasure: boolean) => void
): void {
  if (!ctx || !state.blueAir) return

  ctx.putImageData(animateCanvas, 0, 0)

  for (let x = 0; x < groups.length; x++) {
    checkForCoAltitude(groups, groups)

    groups[x].doNextRouting()

    // *** TODO - work the request system

    // if (groups[x].request !== undefined){
    //   groups[x].successAsReq = false;
    //   groups[x].successAltReq = false;
    //   if (groups[x].request && groups[x].request?.airspace){
    //     const desiredLoc = convertToXY(groups[x].request?.airspace)
    //     const rngToDes = getBR(groups[x].startX, groups[x].startY, desiredLoc).range
    //     if (atFinalDest && rngToDes < 10){
    //       groups[x].successAsReq = true;
    //     }
    //   } else {
    //     groups[x].successAsReq = true;
    //   }

    //   if(groups[x].request?.alt){
    //     if(groups[x].z[0] === groups[x].request?.alt || groups[x].z[0] === groups[x].request?.alt){
    //       groups[x].successAltReq = true;
    //     }
    //   } else {
    //     groups[x].successAltReq = true;
    //   }

    //   if (groups[x].successAsReq && groups[x].successAltReq) {
    //     snackbar.alert("Processed request for " + groups[x].callsign, 3000);
    //     groups[x].request= undefined;
    //   }
    // }

    groups[x].updateAltitude()

    if (!groups[x].isCapping() && !groups[x].hasRouting()) {
      groups[x].draw(ctx, props.dataStyle)

      groups[x].move()

      let newHeading = groups[x].getHeading()

      const nextPoint = groups[x].getNextRoutingPoint()
      if (nextPoint) {
        newHeading = groups[x].getCenterOfMass().getBR(nextPoint).bearingNum
      }
      groups[x].updateIntent({
        desiredHeading: newHeading,
      })
    } else {
      const sPos = groups[x].getCenterOfMass()
      drawGroupCap(
        ctx,
        props.orientation.orient,
        groups[x].getStrength(),
        sPos.x,
        sPos.y,
        "blue"
      )
    }
    const sPos = groups[x].getCenterOfMass()
    drawText(ctx, groups[x].getLabel(), sPos.x - 10, sPos.y + 20, 12)
  }

  if (continueAnimation) {
    const slider: HTMLInputElement = document.getElementById(
      "speedSlider"
    ) as HTMLInputElement
    if (slider && slider.value) {
      sleep(500 * ((100 - parseInt(slider.value)) / 100))
    } else {
      sleep(500 * ((100 - props.sliderSpeed) / 100))
    }

    const animate = function () {
      doAnimation(ctx, props, state, groups, animateCanvas, resetCallback)
    }
    window.requestAnimationFrame(animate)

    for (let y = 0; y < groups.length; y++) {
      drawAltitudes(ctx, groups[y].getCenterOfMass(), groups[y].getAltitudes())
    }
  }
}

export function animateGroups(
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  groups: AircraftGroup[],
  animateCanvas: ImageData,
  resetCallback?: (showMeasure: boolean) => void
): void {
  for (let x = 0; x < groups.length; x++) {
    if (randomNumber(0, 10) <= 2) {
      groups[x].setManeuvers(1)
    }
    const bPos = state.blueAir.getCenterOfMass()
    groups[x].updateIntent({
      desiredHeading: groups[x].getCenterOfMass().getBR(bPos).bearingNum,
    })
  }
  continueAnimation = true
  doAnimation(ctx, props, state, groups, animateCanvas, resetCallback)
}
