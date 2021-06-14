import "../css/microphone.css"
import React, { ReactElement, useRef, useState } from "react"

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition"

interface SpeechTextProps {
  handler: (msgText: string) => void
}

export function SpeechTextControls(props: SpeechTextProps): ReactElement {
  const { transcript, resetTranscript } = useSpeechRecognition()
  const [isListening, setIsListening] = useState(false)
  const microphoneRef: React.LegacyRef<HTMLDivElement> = useRef(null)

  const handleListening = () => {
    resetTranscript()
    setIsListening(true)
    const curRef = microphoneRef.current
    if (curRef) curRef.classList.add("listening")
    SpeechRecognition.startListening({
      continuous: true,
    })
  }

  const preProcess = (transcript: string) => {
    let tmpAnswer = transcript
    tmpAnswer = tmpAnswer
      .replaceAll("golf", "gulf")
      .replaceAll("proseed", "proceed")
      .replaceAll("precede", "proceed")
    tmpAnswer = tmpAnswer.replaceAll("vapour", "viper")
    tmpAnswer = tmpAnswer.replaceAll("elevator", "elevate")
    tmpAnswer = tmpAnswer.replaceAll("positive", "posit")

    tmpAnswer = tmpAnswer.replaceAll("flight level", "FL")
    tmpAnswer = tmpAnswer.replaceAll("flight Level", "FL")
    const re = new RegExp(
      /^([A-Za-z])[A-Za-z]*([A-Za-z]) *([0-9])[0-9]*([0-9])/
    )
    const match = tmpAnswer.match(re)

    if (match) {
      const let1 = match[1]
      const let2 = match[2]
      const num1 = match[3]
      const num2 = match[4]
      const vcs = let1 + let2 + num1 + num2
      tmpAnswer = tmpAnswer.replace(match[0], vcs.toUpperCase())
    }

    return tmpAnswer
  }

  const stopListening = () => {
    if (!isListening) {
      return
    }
    setIsListening(false)
    function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    sleep(1200).then(() => {
      SpeechRecognition.stopListening()
      const curRef = microphoneRef.current
      if (curRef) curRef.classList.remove("listening")
      let tmpAnswer = transcript

      tmpAnswer = preProcess(transcript)
      console.log(tmpAnswer)
      props.handler(tmpAnswer)
    })
  }

  const listeningProps = {
    ref: microphoneRef,
    onMouseDown: handleListening,
    onMouseUp: stopListening,
    onMouseLeave: stopListening,
  }

  return (
    <div className="microphone-wrapper">
      <div className="mircophone-container">
        <div className="microphone-icon-container" {...listeningProps}>
          {false && <img src="." className="microphone-icon" />}
        </div>
        <div className="microphone-status">
          {isListening && <div className="active-listening">Active</div>}
          {!isListening && <div>Active </div>}
          <div> Push to talk</div>
        </div>
      </div>
      {transcript && (
        <div className="microphone-result-container">
          <div className="microphone-result-text">{transcript}</div>
        </div>
      )}
    </div>
  )
}

export default SpeechTextControls
