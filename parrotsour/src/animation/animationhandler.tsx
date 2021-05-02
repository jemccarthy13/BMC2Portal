// Data structure definitions
import { AircraftGroup } from "classes/groups/group";
import { PictureCanvasProps, PictureCanvasState } from "canvas/canvastypes";

import { sleep } from "utils/pstime";

/**
 * This class is the parent class for Animation. 
 * 
 * It contains root level getter/setters and defines abstract behavior for 
 * AnimationHandler's children to implement to animate groups.
 * 
 * To provide new animation logic / aircraft 'intent', create a new 
 * child class of AnimationHandler and implement applyLogic to adjust 
 * Group based on decision-making logic.
 */
export abstract class AnimationHandler {
  // variable to store the animation "cancel" function
  private sleepPromiseCancel = ()=> { console.warn("AnimationHandler has nothing to cancel.")  }

  // force stop animation from within the handler by changing this to false
  continueAnimate = true;

  // Set the animate cancel functionality (for non in-Handler/external interrupts)
  setSleepCancel(f:() => void ):void{
    this.sleepPromiseCancel = f
  }
      
  /**
   * Pause the fight by canceling the sleep timeout.
   * This kills the pseudo-recusion found in doAnimation, 
   * and the pauseCallback() call performs any post-pause 
   * processing (i.e. drawing BRAASEYE for intercept canvas)
   * @param pauseCallback Function to call after the animation has been cancelled
   */
  pauseFight( pauseCallback:undefined|(()=>void)): void {
    this.sleepPromiseCancel()
    if (pauseCallback) {
      pauseCallback()
      this.continueAnimate = false
    }
  }

  /**
   * Internal function to see if a group is near the canvas boundary.
   * 
   * Used to change group logic when approaching the edge of the canvas
   * @param ctx The current drawing context
   * @param group The group to check against boundaries
   */
  public _isNearBounds(ctx: CanvasRenderingContext2D, group:AircraftGroup): boolean {
    const buffer = 40
    const sX = group.getCenterOfMass().x
    const sY = group.getCenterOfMass().y
    return sX < buffer || sX > ctx.canvas.width-buffer || sY < buffer || sY > ctx.canvas.height-buffer
  }

  /**
   * Update group's intent as required.
   * 
   * A group can navigate based on desired locations (route of points) or 
   * in the absense of location, will default to fly on a desired heading.
   * 
   * Also serves purpose to 'apply' logic to each group as the animation
   * iterates through the groups.
   * 
   * @param grp Group to check intent for
   * @param state Current state of canvas
   */
   abstract applyLogic(
    grp: AircraftGroup,
    state:PictureCanvasState,
    resetCallback?:()=>void,
    ctx?:CanvasRenderingContext2D):void

  /**
   * For each group, check the intent of that group then move and turn as 
   * appropriate to get to the next destination.
   * 
   * A general animation algorithm, leaving it to the children AnimationHandlers
   * to implement decision making logic to modify and update the desired routing 
   * and heading of each group.
   * 
   * @param context Current drawing context
   * @param props PicCanvasProps for formatting
   * @param state Current state of canvas
   * @param groups the Groups to animate
   * @param animateCanvas a snapshot of canvas imagery
   * @param resetCallback optional function to perform at the end of animation
   */
   async animate (
    context: CanvasRenderingContext2D,
    props: PictureCanvasProps,
    state: PictureCanvasState,
    groups: AircraftGroup[],
    animateCanvas?: ImageData,
    resetCallback?: ()=>void): Promise<void>{

      if (!context || !state.bluePos || !animateCanvas) return
      context.putImageData(animateCanvas, 0, 0);

      // For each group:
      //   - draw current arrows
      //   - 'move' drawn arrows based on current heading
      //   - turn towards the target heading (desired pt or heading)
      //   - apply decision-making logic
      for (let x = 0; x < groups.length; x++){
        const grp = groups[x]

        /*****  TODO --- in group.move, manage radar and IFF history  ******* */
        grp.move() 
        
        /** TODO -- verify after .move() is ok  */
        grp.draw(context, props.dataStyle)
        
        this.applyLogic(grp, state, resetCallback, context)
      }

      state.bluePos.move()
      state.bluePos.draw(context, props.dataStyle)

      // get slider speed/default speed
      const slider:HTMLInputElement = document.getElementById("speedSlider") as HTMLInputElement
      let speed = props.sliderSpeed
      if (slider && slider.value) speed = parseInt(slider.value)

      // delay is proportion of 500ms based on current slider setting
      const delay = (5000 * ((100-speed)/100))

      // use the sleep utility to create a new Promise with an animation function call
      if (this.continueAnimate){
        const binding = this.animate.bind(this)
        const slpObj = sleep(delay, () =>{ binding(context, props, state, groups, animateCanvas, resetCallback) })
        this.setSleepCancel(slpObj.cancel)
      } 
  }
}