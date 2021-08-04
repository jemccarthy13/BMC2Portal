import { AircraftGroup } from "../../classes/groups/group"
import { AIProcessor } from "./nlprocessor"

/**
 * Given some message text, extract a close control command
 * that fits the given format
 *
 * Update aircraft intent based on the given command, and
 * return new text without the move command(s).
 *
 * @param processedText text to process
 * @param sendResponse callback; how to respond to messages
 * @param asset asset targeted by command
 * @param isVoice true iff command was given via voice
 * @returns processedText without move commands
 */
export function processCloseLayer(
  processedText: string,
  sendResponse: (s1: string, s2: string) => void,
  asset: AircraftGroup
): string {
  processedText = processedText.replace(/\s\s+/g, " ")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nl: any = AIProcessor.process(processedText)

  const callsign = asset.getLabel()

  const closeCmdSearchStr = "[<cs>#Noun] [<dir>#CloseDir] [<hdg>#Cardinal]"
  const close3dCmdSearchStr = closeCmdSearchStr + " * #Unit [<fl>#Cardinal]"

  const move = nl.match(closeCmdSearchStr)
  const move3d = nl.match(close3dCmdSearchStr)

  let originalReplaceStr = ""

  if (move.found) {
    originalReplaceStr = move.text()
    const turnDir = move.groups().dir

    const newHeading = move.groups().hdg
    const turnDirText = turnDir ? turnDir.text() : undefined
    const newHdgText = newHeading ? newHeading.text() : undefined

    if (turnDir) {
      let fl
      asset.updateIntent({
        desiredHeading: parseInt(newHdgText),
        forcedTurn: turnDirText,
      })

      if (move3d.found) {
        fl = move3d.groups().fl.text()
        asset.updateIntent({
          desiredAlt: parseInt(fl) / 10,
        })
      }

      sendResponse(callsign, turnDirText + " " + newHdgText)
    } else {
      sendResponse(callsign, "I don't understand " + move.text())
    }
  }

  processedText = processedText
    .replaceAll(move3d.text(), "")
    .replaceAll(originalReplaceStr, "")

  return processedText
}
