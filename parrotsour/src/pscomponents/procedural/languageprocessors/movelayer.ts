import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { AIProcessor } from "./nlprocessor"
import { convertToNATOPhonetic } from "./toNATOphonetic"

/**
 * Given some message text, extract a move command that fits
 * the move formats in move command search strings.
 *
 * Update aircraft intent based on the given command, and
 * return new text without the move command(s).
 *
 * @param processedText text to process
 * @param sendResponse callback; how to respond to messages
 * @param asset asset targeted by command
 * @param cgrs any cgrs location(s) found previously
 * @param isVoice true iff command was given via voice
 * @returns processedText without move commands
 */
export function processMoveLayer(
  processedText: string,
  sendResponse: (s1: string, s2: string) => void,
  asset: AircraftGroup,
  cgrs: string[],
  isVoice: boolean
): string {
  processedText = processedText.replace(/\s\s+/g, " ")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nl: any = AIProcessor.process(processedText)

  const callsign = asset.getLabel()

  const moveCommndSearchStr =
    "[<cs>#Noun] [<cmd>#Verb?] * [<x>#Cardinal] [<y>#Cardinal]"

  const move3dCommandSearchStr =
    moveCommndSearchStr +
    " * app? [#Verb?] [#Preposition?] #Unit [<fl>#Cardinal] * #Unit? [<flupper>#Cardinal?]"

  const move = nl.match(moveCommndSearchStr)
  const move3d = nl.match(move3dCommandSearchStr)

  let originalReplaceStr = ""

  if (move.found) {
    originalReplaceStr = move.text()
    const command = move.groups().cmd
    const cmdText = command ? command.text() : undefined

    const moveCommands = ["transit", "proceed", "move"]

    if (!cmdText || moveCommands.includes(cmdText)) {
      const locX = parseInt(move.groups().x.text())
      const locY = parseInt(move.groups().y.text())
      let fl
      if (move3d.found) {
        fl = move3d.groups().fl.text()
        asset.updateIntent({
          desiredAlt: parseInt(fl) / 10,
        })
      }

      let cpy = "c"
      let FL = "FL"

      let cgrsReply = cgrs.length === 0 ? "" : cgrs[0]

      if (isVoice) {
        cpy = "copy"
        FL = "flight level"
        fl = fl?.split("").join(" ")
        cgrsReply = convertToNATOPhonetic(cgrsReply)
      }
      sendResponse(
        callsign,
        cpy +
          ", " +
          (command ? command.verbs().toGerund().text() : "moving") +
          " to " +
          (cgrsReply !== "" ? cgrsReply : locX + "," + locY) +
          (move3d.found ? " at " + FL + " " + fl : "")
      )

      asset.clearRouting()
      asset.addRoutingPoint(new Point(locX, locY))
      asset.setCapping(false)
    } else {
      sendResponse(callsign, "I don't understand " + command.text())
    }
  }

  processedText = processedText
    .replaceAll(move3d.text(), "")
    .replaceAll(originalReplaceStr, "")

  return processedText
}
