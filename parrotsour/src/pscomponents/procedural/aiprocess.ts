/* eslint-disable @typescript-eslint/no-explicit-any */

// Classes & Interfaces
import { PictureAnswer } from "../../canvas/canvastypes"
import { AircraftGroup } from "../../classes/groups/group"

// 'AI' Processors -- see the function aiProcess for more details
import { AIProcessor } from "./languageprocessors/nlprocessor"
import { processQuestionLayer } from "./languageprocessors/questionlayer"
import { processMoveLayer } from "./languageprocessors/movelayer"
import { processElevatorLayer } from "./languageprocessors/elevatorlayer"

// Functions
import { convertToXY, getAsset } from "./prochelpers"
import { processRadioCheckLayer } from "./languageprocessors/radiochecklayer"

/**
 * This function mutates the original string to replace cgrs with
 * canvas x,y coordinates, and returns a list of matching CGRS coordinates
 * in the order they were found.
 *
 * @param msgText Text to parse
 * @returns An object containing {
 *  cgrs: array of CGRS coordinates in the order they were found in the text,
 *  newText: the message with all CGRS coordinates replaced with x,y canvas coords
 * }
 */
function _findAndReplaceCGRS(msgText: string): {
  cgrs: string[]
  msgText: string
} {
  let textToParse = msgText.toUpperCase()
  const re = new RegExp("([0-9]+[A-Z]+[0-9]*)")
  const matches = textToParse.match(re)
  const cgrs: string[] = []
  if (matches) {
    matches.forEach((elem) => {
      const xy = convertToXY(elem)
      textToParse = textToParse.replace(elem, xy.x + " " + xy.y)
      cgrs.push(elem)
    })
  }
  textToParse = textToParse.toLowerCase()
  return { cgrs, msgText: textToParse }
}

/**
 * Search the groups for an asset whose callsign matches
 *
 * @param nl the compromise NLProcessor
 * @param groups answer.groups
 * @param sendResponse callback, how to send messages
 * @returns AircraftGroup if found
 */
function _checkForAsset(
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

/**
 * This function is loosely based on a Turing machine and/or neural networks.
 *
 * It is not as complicated, not predictive, and doesn't 'learn', but the general
 * idea is that given a message, I will pass the message through different layers
 * that rely on a previous layers output (similar to 'neurons' in a nerual network,
 * but more closely resembling Turing theory of symbol manipulation).
 *
 * Each layer will take the message, determine if it understands what is
 * being said, asked, or commanded. Then the layer will 'consume' what it
 * understood and give the rest of the message to the next layer to figure out.
 *
 * If there is text leftover, a portion of the message could not be interpreted.
 *
 * @param msg the whole message to try and understand / process
 * @param answer contains data on aircraft location
 * @param sendResponse callback; how to respond to messages
 */
// eslint-disable-next-line complexity
export function aiProcess(
  msg: { text: string; voice: boolean },
  answer: PictureAnswer,
  sendResponse: (sender: string, msg: string, voice?: boolean) => void
): void {
  // first layer is replacing all CGRS coordinates with canvas x,y
  const { msgText, cgrs } = _findAndReplaceCGRS(msg.text)

  // next we 'normalize' the message
  let processedText = msgText.replaceAll("/", " ")

  if (processedText.trim() === "") {
    return
  }

  const asset = _checkForAsset(processedText, answer.groups, sendResponse)

  // TODO -- fix this?
  if (!asset) {
    return
  }

  const callsign = asset.getLabel()

  const sendResponseWrapper = (sender: string, text: string) => {
    sendResponse(sender, text, msg.voice)
  }

  // first we look for any questions
  processedText = processQuestionLayer(
    processedText,
    sendResponseWrapper,
    asset
  )

  processedText = processMoveLayer(
    processedText,
    sendResponseWrapper,
    asset,
    cgrs,
    msg.voice
  )

  processedText = processElevatorLayer(
    processedText,
    sendResponseWrapper,
    asset,
    msg.voice
  )

  processedText = processRadioCheckLayer(
    processedText,
    sendResponseWrapper,
    asset,
    msg.voice
  )

  if (processedText.length > 0) {
    sendResponse(callsign, "I don't understand " + processedText)
  }
}
