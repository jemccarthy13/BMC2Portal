/**
 * This file holds commonly used functions for manipulation of 
 * angles/degrees/headings, altitudes, and bearings
 */

import { AltStack, BRAA, Bullseye, Group } from './interfaces'

/**
 * Format a portion of a timestamp to 2 digits 
 * @param time number to format to 2 digits if less than 10
 */
function formatT(time:number){
  let retVal:string = time.toString();
  if (time <= 9){
      retVal = "0" + time;
  }
  return retVal;
}

/**
 * Get a HH:mm:ss timestamp (for messages)
 */
export function getTimeStamp():string {
  const date = new Date();
  return formatT(date.getHours()) + ":" + formatT(date.getMinutes()) + ":" + formatT(date.getSeconds());
}

/**
 * Converts a math angle to Radians (180 is EW line)
 * @param angleDeg - the cartesian angle to convert to radians
 */
export function toRadians(angleDeg: number): number {
  return angleDeg * (Math.PI / 180);
}

/**
 * Converts radians to cartesian degrees
 * @param rads - radians to convert to degrees
 */
export function toDegrees(rads: number): number {
  return rads * (180 / Math.PI);
}

/**
 * Left pad a string with 0s
 * @param value - the string to pad
 * @param padding - how long the resulting string should be
 */
export function lpad(value: number, padding: number): string {
  return ([...Array(padding)].join("0") + value).slice(-padding);
}

/**
 * Get a bearing and range between {x,y} and a point {x2, y2} (bullseye)
 * @param x - the destination point x
 * @param y - the destination point y
 * @param bullseye - the start point {x,y}
 */
export function getBR(x: number, y:number, bullseye: Bullseye): BRAA {
  const deltaX = bullseye.x - x;
  const deltaY = bullseye.y - y;

  // distance formula for range
  const rng = Math.floor(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 4);

  // convert cartesian direction to heading
  let brg = Math.round(270 + toDegrees(Math.atan2(bullseye.y - y, bullseye.x - x)));
  if (brg > 360) {
    brg = brg - 360;
  }

  return {
    bearing: lpad(brg, 3),
    range: rng
  };
}

/**
 * Get 'aspect' (HOT/FLANK/BEAM, etc) between groups
 * 
 * Aspect is calculated by taking the angle difference between
 * other a/c heading, and the reciprocal bearing between ownship
 * and other a/c. 
 * 
 * In otherwords, if "ownship" turned around, how much would
 * other a/c have to turn to point at ownship?
 * 
 * @param group1 - 'ownship'  
 * @param group2 - other aircraft
 */
export function getAspect(group1:Group, group2:Group):string{
  const recipBrg:BRAA = getBR(group1.x, group1.y, {x: group2.x, y:group2.y});

  let dist = (group2.heading - parseInt(recipBrg.bearing) + 360) % 360;
  if (dist > 180) dist = 360 - dist;
  const cata = dist;

  let aspectH = "MANEUVER";

  if (cata < 30){
    aspectH = "HOT";
  } else if (cata < 60 ){
    aspectH = "FLANK";
  } else if (cata < 110){
    aspectH = "BEAM";
  } else if (cata <= 180){
    aspectH = "DRAG";
  }
  return aspectH;
}

/**
 * Converts a heading to a cardinal direction
 * @param heading - heading to translate to track direction
 */
export function getTrackDir(heading: number): string {
  const arr = [
    "NORTH", 
    "NORTHEAST",
    "NORTHEAST",
    "NORTHEAST",
    "EAST", 
    "SOUTHEAST",
    "SOUTHEAST",
    "SOUTHEAST",
    "SOUTH",
    "SOUTHWEST",
    "SOUTHWEST",
    "SOUTHWEST",
    "WEST",
    "NORTHWEST",
    "NORTHWEST",
    "NORTHWEST"];
  // the compass is divided every 20 degrees, so find the 'box' of degrees the
  // current heading is in
  const val = Math.floor((heading / (360/arr.length))+0.5);
  return arr[(val % arr.length)];
}

/**
 * Returns a random number between min and max (inclusive)
 * @param min minimum value
 * @param max maximum value
 */
export function randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}
  
/**
 * Return a random heading (0-360 for ALSA, HOT/FLANK blue for !ALSA) 
 * @param format 
 */
export function randomHeading(format: string, blueHeading = -1): number {
  const bound = (format==="ipe" ? 45: 360)
  const offset = randomNumber(-bound, bound)

  let blueOpp = blueHeading-180
  if (blueOpp < 0){
    blueOpp = 360 - blueOpp
  }

  let heading:number = blueOpp + offset
  if (heading < 0 ){
    heading = 360 + heading
  }
  return heading
}

/**
 * Convert altitudes to stack formatting and fill-ins. 
 * 
 * A single group will be no-op (return hard alt + fillin if HIGH)
 * A group without stacks will return single alt + fillin if HIGH)
 * Otherwise, will return highest altitude for each "bucket" and # contacts hi/med/low
 * 
 * @param altitudes - group's altitudes for each contact
 * @param format - comm format
 */
export function getAltStack(altitudes: number[], format: string): AltStack {
  // convert altitudes to 3-digit flight level and sort low->high
  const formattedAlts: string[] = altitudes.map((a: number) => ("0" + a).slice(-2) + "0").sort().reverse();
  
  const stackHeights: string[] = [];
  let stackIndexes: number[] = [];

  // break out into bins of 10k foot separation between contacts
  for (let x = formattedAlts.length; x>=0; x--){
    const diff:number = parseInt(formattedAlts[x-1]) - parseInt(formattedAlts[x])
    if (diff >= 100){
      stackHeights.push(formattedAlts[x])
      stackIndexes.push(x)
    }
  }

  stackIndexes = stackIndexes.reverse()

  // get the highest altitude within each bucket for formatting
  const stacks: string[][] = [];
  let lastZ = 0;
  for (let z = 0; z < stackIndexes.length; z++) {
    stacks.push(formattedAlts.slice(lastZ, stackIndexes[z]));
    lastZ = stackIndexes[z];
  }
  stacks.push(formattedAlts.slice(lastZ));

  // format to "##k"
  let answer = formattedAlts[0].replace(/0$/, "k") + " ";
  let answer2 = "";

  // do formatting

  // if no stack, look for >40k for "HIGH"
  if (stacks.length <= 1){
    altitudes.sort();
    if (altitudes[altitudes.length - 1] >= 40) {
      answer2 += " HIGH ";
    }
  // otherwise, print stacks
  } else {
    answer = "STACK "
    for (let y = 0; y < stacks.length; y++) {
      // check to add "AND" for alsa, when on last stack alt
      const AND = (y===stacks.length-1 && format!=="ipe") ? "AND " : ""
      answer += AND + stacks[y][0].replace(/0$/, "k") + " "
    }

    // format # hi/med/low when there are at least 3 contacts
    // if there are 3 contacts and 3 altitudes, 1 hi / 1 med / 1 low is not required 
    // (so skip this)
    if (altitudes.length > 2 && !(altitudes.length === stacks.length && stacks.length ===3)) {
      switch (stacks.length) {
        case 2:
          answer2 += stacks[0].length + " HIGH ";
          answer2 += stacks[1].length + " LOW ";
          break;
        case 3:
          answer2 += stacks[0].length + " HIGH ";
          answer2 += stacks[1].length + " MEDIUM ";
          answer2 += stacks[2].length + " LOW ";
          break;
      }
    }
  }

  // return stack and fillins
  return {
    stack: answer,
    fillIns: answer2
  };
}
  