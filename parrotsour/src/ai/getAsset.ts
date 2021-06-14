import { AircraftGroup } from "../classes/groups/group"
import { AIProcessor } from "./languageprocessors/nlprocessor"

/**
 * Search the list of groups for a callsign
 *
 * @param groups
 * @param callsign
 * @returns
 */
export function getAsset(
  groups: AircraftGroup[],
  callsign: string
): AircraftGroup | undefined {
  return groups.find((a) => {
    return a.getLabel().toUpperCase() === callsign.toUpperCase()
  })
}

/**
 * Given a string, see if the message is for a particular callsign/asset.
 *
 * @param processedText string to search
 * @param groups answer.groups
 * @param sendResponse callback, how to send messages
 * @returns AircraftGroup if found or undefined
 */
export function findAssetInMsg(
  processedText: string,
  groups: AircraftGroup[],
  sendResponse: (s1: string, s2: string) => void
): AircraftGroup | undefined {
  const nl = AIProcessor.process(processedText)
  const assetMsg = nl.match("[<cs>#Noun] *").first()
  const cs = assetMsg.groups().cs
  const callsign = cs ? cs.text().toUpperCase() : "SYSTEM"
  const asset = getAsset(groups, callsign)

  if (!asset) {
    sendResponse("SYSTEM", "No such callsign.")
  }
  return asset
}
