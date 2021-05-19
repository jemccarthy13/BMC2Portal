import { AircraftGroup } from "../../../classes/groups/group"

export function processRadioCheckLayer(
  processedText: string,
  sendResponse: (s1: string, s2: string) => void,
  asset: AircraftGroup,
  isVoice: boolean
): string {
  const callsign = asset.getLabel()

  // search - text starts with callsign, optionally includes radio check, and nothing else
  // should match "VR01" or "VR01 radio check" but nothing else
  const regex = new RegExp("^([A-Za-z]+[0-9][0-9] *(radio check)?)$")
  const matches = regex.exec(processedText)
  if (matches && matches[1]) {
    let fullCs = callsign
    if (isVoice)
      fullCs = callsign.replace("VR", "viper ").replace("0", " zero ")
    sendResponse(callsign, "go for " + fullCs)

    processedText = processedText.replace(matches[1], "")
  }

  return processedText
}
