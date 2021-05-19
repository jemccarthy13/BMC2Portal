import React, { ReactElement, KeyboardEvent } from "react"

import SpeechTextControls from "./speechtext"

import { getTimeStamp } from "../../utils/pstime"

import { PictureAnswer } from "../../canvas/canvastypes"
import { aiProcess } from "./aiprocess"
import { AircraftGroup } from "../../classes/groups/group"
import { convertToCGRS } from "./prochelpers"
import { SensorType } from "../../classes/aircraft/datatrail/sensortype"
import { formatAlt } from "../../canvas/draw/formatutils"

type CBState = {
  text: string
  sender: string
}

type CBProps = {
  answer: PictureAnswer
}

export default class ChatBox extends React.PureComponent<CBProps, CBState> {
  constructor(props: CBProps) {
    super(props)
    this.state = {
      text:
        "*** CONNECTED TO PARROTSOUR CHAT SERVER ***\r\n" +
        "*** /help to display help information\r\n" +
        "*** /handover to simulate a handover message\r\n",
      sender: "UR_CALLSIGN",
    }
  }

  componentDidUpdate(): void {
    const msgBox: HTMLTextAreaElement | null = this.chatroomRef.current
    if (msgBox !== null) msgBox.scrollTop = msgBox.scrollHeight
  }

  inputRef: React.MutableRefObject<HTMLTextAreaElement | null> =
    React.createRef<HTMLTextAreaElement>()
  chatroomRef: React.MutableRefObject<HTMLTextAreaElement | null> =
    React.createRef<HTMLTextAreaElement>()

  handleInputKeypress = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    const key = event.key
    if (key === "Enter") {
      event.preventDefault()
      const text = event.currentTarget.value.toString()
      this.sendChatMessage(text)
      //document.getElementById("chatInput")
    }
  }

  handleSendBtnClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    const text = event.currentTarget.value.toString()
    this.sendChatMessage(text)
  }

  sendSystemMsg = async (msg: string): Promise<void> => {
    const { text } = this.state
    await this.setState({
      text: text + getTimeStamp() + " *** " + msg + "\r\n",
    })
  }

  sendMessage = (sender: string, message: string, voice?: boolean): void => {
    const { text } = this.state
    if (!voice) {
      this.setState({
        text: text + getTimeStamp() + " <" + sender + "> " + message + "\n",
      })
    } else {
      const msg = new SpeechSynthesisUtterance()
      msg.text = message
      window.speechSynthesis.speak(msg)
    }
  }

  _clearTextBox = (): void => {
    const current: HTMLTextAreaElement | null = this.inputRef.current
    if (current !== null) current.value = ""
  }

  sendChatMessage = async (msg: string): Promise<void> => {
    if (msg.indexOf("/") === 0) {
      if (msg.indexOf("/nick") === 0) {
        const newCs = msg.replace("/nick", "").trim()
        this.setState({ sender: newCs })
        this.sendSystemMsg("changed nick to " + newCs)
      } else if (msg.indexOf("/handover") === 0) {
        const { answer } = this.props
        await this.sendSystemMsg("BMA Rundown")
        answer.groups.forEach((grp: AircraftGroup) => {
          const pos = grp.getCenterOfMass(SensorType.ARROW)
          this.sendSystemMsg(
            grp.getLabel() +
              " / " +
              convertToCGRS(pos.x, pos.y) +
              " / FL " +
              formatAlt(grp.getAltitude())
          )
        })
        await this.sendSystemMsg("End rundown")
      } else if (msg.indexOf("/help") === 0) {
        this.sendSystemMsg(
          "*** Use /nick to set your callsign. ***\r\n" +
            "*** This chatroom simulates an airspace control room.\r\n" +
            "*** Here you can give transit instructions to assets.\n" +
            "*** Commands can be entered in plain english. \n" +
            "*** Assets will respond if they understand the tasking.\n" +
            "*** Assets will let you know if they don't understand.\n" +
            "*** Please use 'report a bug' to request command support.\n" +
            "*** Some common formats:\n" +
            "*** RPA01 proceed 89AG FL 240\n" +
            "*** RPA01 proceed dir 89AG at FL 240\n" +
            "*** RPA01 app 89AG FL 240\n" +
            "----------------------------------------\r\n"
        )
      }
    } else {
      const { sender } = this.state
      const { answer } = this.props
      await this.sendMessage(sender, msg)
      aiProcess({ text: msg, voice: false }, answer, this.sendMessage)
    }

    this._clearTextBox()
  }

  handleMessage = (text: string): void => {
    const { answer } = this.props
    aiProcess({ text, voice: true }, answer, this.sendMessage)
  }

  render(): ReactElement {
    const handler = this.handleMessage
    const { text } = this.state
    return (
      <div
        id="chat"
        style={{
          width: "33%",
          marginLeft: "auto",
          marginRight: "auto",
          minHeight: "100%",
        }}
      >
        <textarea
          ref={this.chatroomRef}
          id="chatroom"
          style={{ width: "100%", height: "50%" }}
          readOnly
          value={text}
        />
        <div style={{ display: "inline-flex", width: "100%" }}>
          <textarea
            ref={this.inputRef}
            id="chatInput"
            style={{ width: "80%", height: "10%" }}
            onKeyPress={this.handleInputKeypress}
          />
          <button
            type="button"
            style={{ marginLeft: "5px", width: "20%" }}
            onClick={this.handleSendBtnClick}
          >
            Send
          </button>
        </div>
        <SpeechTextControls handler={handler} />
      </div>
    )
  }
}
