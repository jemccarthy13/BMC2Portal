import React from "react"
import { ReactElement, KeyboardEvent } from "react"

import { getTimeStamp } from '../utils/mathutilities'

type CBProps = {

}
 
type CBState = {
    text: string,
    sender: string
}

export default class ChatBox extends React.PureComponent<CBProps, CBState>{
    
    constructor(props:CBProps){
        super(props)
        this.state={
            text:
                "*** CONNECTED TO PARROTSOUR CHAT SERVER ***\r\n" +
                "*** Use /nick to set your callsign. ***\r\n",
            sender:"UR_CALLSIGN"
        }
    }

    inputRef: React.MutableRefObject<HTMLTextAreaElement|null> = React.createRef<HTMLTextAreaElement>()
    chatroomRef: React.MutableRefObject<HTMLTextAreaElement|null> = React.createRef<HTMLTextAreaElement>()

    handleInputKeypress = (event: KeyboardEvent<HTMLTextAreaElement>):void => {
        const key = event.key;
        if (key === "Enter") {
            event.preventDefault();
            const text = event.currentTarget.value.toString()
            this.sendChatMessage(text);
            //document.getElementById("chatInput")
        }
    }

    handleSendBtnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
        const text = event.currentTarget.value.toString()
        this.sendChatMessage(text)
    }

    sendSystemMsg = (msg:string): void => {
        const { text } = this.state
        this.setState({text:text + getTimeStamp() + " *** " + msg + "\r\n"})
    }

    sendChatMessage = (msg:string):void => {
        let success= false
        if (msg.indexOf('/') === 0){
            if (msg.indexOf('/nick') === 0){
                const newCs = msg.replace('/nick','').trim()
                this.setState({sender: newCs})
                this.sendSystemMsg("changed nick to " + newCs )
            }
            success=true
        } else {
            const { text, sender } = this.state
            this.setState({text:text + getTimeStamp() + " <"+sender+"> " + msg + "\r\n"})
            success = true
        }
        const current: HTMLTextAreaElement|null = this.inputRef.current
            if (current !== null && success)
                current.value = ""
    }

    componentDidUpdate(){
        const msgBox: HTMLTextAreaElement|null = this.chatroomRef.current
        if (msgBox !== null)
            msgBox.scrollTop = msgBox.scrollHeight
    }

    render(): ReactElement {
        const { text } = this.state
        return(
            <div id="chat" style={{width:"33%", marginLeft:"auto", marginRight:"auto", minHeight:"100%"}}>
                <textarea ref={this.chatroomRef} id="chatroom" style={{width:"100%", height:"50%"}} readOnly value={text}/>
                <div style={{display:"inline-flex", width:"100%"}}>
                    <textarea ref={this.inputRef} id="chatInput" style={{width:"80%", height:"10%"}} onKeyPress={this.handleInputKeypress} />
                    <button type="button" style={{marginLeft:"5px", width:"20%"}} onClick={this.handleSendBtnClick}>Send</button>
                </div>
            </div>
        )
    }
}