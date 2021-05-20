import { AircraftGroup } from "../../../classes/groups/group"
import { AIProcessor } from "./nlprocessor"

/**
 * Look for a command to climb/descend to a particular flight level.
 *
 * @param processedText message text to search for elevator command
 * @param sendResponse callback; how to provide a response to the message
 * @param asset AircraftGroup targeted by the command
 * @param isVoice true iff command was provided via voice
 * @returns processedText without the elevator command
 */
export function processElevatorLayer(
  processedText: string,
  sendResponse: (s1: string, s2: string) => void,
  asset: AircraftGroup,
  isVoice: boolean
): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nl: any = AIProcessor.process(processedText)
  const elevCmd = nl.match("[<cs>#Noun] [<act>#Verb] #Unit [<fl>#Cardinal]")
  const isCommand = elevCmd.found

  const originalReplaceStr = elevCmd.text()
  if (isCommand) {
    const newflActual = elevCmd.groups().fl.text()
    let newfl = newflActual
    let cpy = "c, "
    if (isVoice) {
      cpy = "copy, "
      newfl = newflActual.replace("FL", " flight level ")
      newfl = newflActual?.split("").join(" ")
    }
    sendResponse(
      asset.getLabel(),
      cpy + elevCmd.groups().act.verbs().toGerund().text() + " " + newfl
    )
    asset.updateIntent({
      desiredAlt: parseInt(newflActual) / 10,
    })
  }

  return processedText.replaceAll(originalReplaceStr, "")
}
