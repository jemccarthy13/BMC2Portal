import { ACType } from "../../../classes/aircraft/aircraft"
import { SensorType } from "../../../classes/aircraft/datatrail/sensortype"
import { AircraftGroup } from "../../../classes/groups/group"
import { convertToCGRS } from "../prochelpers"
import { AIProcessor } from "./nlprocessor"

/**
 * Handle a question -- anything that ends with a '?'
 *
 * Very limited in knowledge of how to respond - currently
 * it knows some queries for location, tasking, and eta to target.
 *
 * @param nl NLProcessor
 * @param sendResponse callback, how to respond to inquiries
 * @param asset The asset being queried
 * @returns newText - text minus the question that was processed
 */
export function processQuestionLayer(
  processedText: string,
  sendResponse: (s1: string, s2: string) => void,
  asset: AircraftGroup
): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nl: any = AIProcessor.process(processedText)
  const callsign = asset.getLabel()

  const question = nl.match("[<cs>#Noun] * [<thing>#Noun] *")
  const question2 = nl.match("[<cs>#Noun] interrogative [<thing>#Noun] *")
  const isQuestion = nl.sentences().isQuestion().length > 0
  const interrogative = question2.found

  const questionLocNouns = ["status", "location", "posit", "positive", "cwas"]

  let retVal = processedText

  if (isQuestion || interrogative) {
    const q = interrogative ? question2 : question
    const thing = q.groups().thing.text()
    if (questionLocNouns.includes(thing)) {
      const assetSPos = asset.getCenterOfMass(SensorType.ARROW)
      if (asset.isCapping()) {
        sendResponse(
          callsign,
          "working " + convertToCGRS(assetSPos.x, assetSPos.y)
        )
      } else if (asset.getNextRoutingPoint() !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const rPoint = asset.getNextRoutingPoint()!
        const current = convertToCGRS(assetSPos.x, assetSPos.y).replace("+", "")
        const desired = convertToCGRS(rPoint.x, rPoint.y)
        sendResponse(callsign, "passing " + current + ", enroute to " + desired)
      } else {
        sendResponse(callsign, "standby")
      }
    } else if (thing === "tasking") {
      if (asset.isOnTask()) {
        console.warn("TODO -- read back tasking when assigned")
      } else {
        if (asset.getType() === ACType.RPA) {
          sendResponse(callsign, "performing ISR iwas")
        } else {
          sendResponse(callsign, "no tasking att, XCAS ufn")
        }
      }
    } else if (thing.toLowerCase() === "eta") {
      if (asset.isCapping()) {
        sendResponse(callsign, "I'm already on loc")
      } else {
        sendResponse(callsign, "ETA 5m")
      }
    } else {
      sendResponse(callsign, "I don't understand the question")
    }
    retVal = retVal
      .replaceAll(question.text(), "")
      .replaceAll(question2.text(), "")
  }
  return retVal
}
