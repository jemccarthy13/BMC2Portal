export interface AltStack {
  stack: string
  fillIns: string
}

/**
 * Non-exported function to format alt stacks and fill-ins for group altitudes
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
  const formattedAlts: string[] = altitudes
    .map((a: number) => ("0" + a).slice(-2) + "0")
    .sort()
    .reverse()

  const stackHeights: string[] = []
  let stackIndexes: number[] = []

  // break out into bins of 10k foot separation between contacts
  for (let x = formattedAlts.length; x >= 0; x--) {
    const diff: number =
      parseInt(formattedAlts[x - 1]) - parseInt(formattedAlts[x])
    if (diff >= 100) {
      stackHeights.push(formattedAlts[x])
      stackIndexes.push(x)
    }
  }

  stackIndexes = stackIndexes.reverse()

  // get the highest altitude within each bucket for formatting
  const stacks: string[][] = []
  let lastZ = 0
  for (let z = 0; z < stackIndexes.length; z++) {
    stacks.push(formattedAlts.slice(lastZ, stackIndexes[z]))
    lastZ = stackIndexes[z]
  }
  stacks.push(formattedAlts.slice(lastZ))

  // format to "##k"
  let answer = formattedAlts[0].replace(/0$/, "k") + " "
  let answer2 = ""

  // do formatting

  // if no stack, look for >40k for "HIGH"
  if (stacks.length <= 1) {
    altitudes.sort()
    if (altitudes[altitudes.length - 1] >= 40) {
      answer2 += " HIGH "
    }
    // otherwise, print stacks
  } else {
    answer = "STACK "
    for (let y = 0; y < stacks.length; y++) {
      // check to add "AND" for alsa, when on last stack alt
      const AND = y === stacks.length - 1 && format !== "ipe" ? "AND " : ""
      answer += AND + stacks[y][0].replace(/0$/, "k") + " "
    }

    // format # hi/med/low when there are at least 3 contacts
    // if there are 3 contacts and 3 altitudes, 1 hi / 1 med / 1 low is not required
    // (so skip this)
    if (
      altitudes.length > 2 &&
      !(altitudes.length === stacks.length && stacks.length === 3)
    ) {
      switch (stacks.length) {
        case 2:
          answer2 += stacks[0].length + " HIGH "
          answer2 += stacks[1].length + " LOW "
          break
        case 3:
          answer2 += stacks[0].length + " HIGH "
          answer2 += stacks[1].length + " MEDIUM "
          answer2 += stacks[2].length + " LOW "
          break
      }
    }
  }

  return { stack: answer, fillIns: answer2 }
}
