import React from "react"
import { ReactElement, KeyboardEvent } from "react"
import { DrawAnswer } from "utils/interfaces"

import { getTimeStamp } from '../utils/mathutilities'
import { aiProcess } from "./prochelpers"

import nlp from 'compromise'
import sentences from 'compromise-sentences'
nlp.extend(sentences)
// eslint-disable-next-line
nlp.extend((Doc:any, world:any) => {
    world.addWords({
        transit: 'Verb',
        climb: 'Verb',
        elev: "Verb",
        elevator: 'Verb',
        posit:'Noun',
        proceed: 'Verb',
        FL: 'Unit',
        tasking:'Noun',
        state:'Noun'
    })
});

type CBProps = {
    answer: DrawAnswer
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
                "*** CONNECTED TO PARROTSOUR CHAT SERVER ***\r\n"+
                "*** /help to display help information\r\n",
            sender:"UR_CALLSIGN"
        }
    }
    
    componentDidUpdate():void{
        const msgBox: HTMLTextAreaElement|null = this.chatroomRef.current
        if (msgBox !== null)
            msgBox.scrollTop = msgBox.scrollHeight
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
    
    sendMessage = (sender:string, message:string):void => {
        const { text } = this.state
        this.setState({text:text + getTimeStamp() + " <"+sender+"> " + message + "\n"});
    }

    sendChatMessage = async (msg:string):Promise<void> => {
        let success= false
        if (msg.indexOf('/') === 0){
            if (msg.indexOf('/nick') === 0){
                const newCs = msg.replace('/nick','').trim()
                this.setState({sender: newCs})
                this.sendSystemMsg("changed nick to " + newCs )
            }
            if (msg.indexOf("/help") === 0) {
                this.sendSystemMsg(
                    "*** Use /nick to set your callsign. ***\r\n"+
                    "*** This chatroom simulates an airspace control room.\r\n" +
                    "*** Here you can give transit instructions to assets.\n" +
                    "*** Commands can be entered in plain english. \n" +
                    "*** Assets will respond if they understand the tasking.\n"+
                    "*** Assets will let you know if they don't understand.\n" +
                    "*** Please use 'report a bug' to request command support.\n" +
                    "*** Some common formats:\n" +
                    "*** RPA01 proceed 89AG FL 240\n" +
                    "*** RPA01 proceed dir 89AG at FL 240\n" +
                    "*** RPA01 app 89AG FL 240\n" +
                    "----------------------------------------\r\n")
            }
            success=true
        } else {
            const { sender } = this.state
            const { answer } = this.props
            await this.sendMessage(sender, msg)
            aiProcess(nlp, msg, answer, this.sendMessage)
            success = true
        }
        const current: HTMLTextAreaElement|null = this.inputRef.current
            if (current !== null && success)
                current.value = ""
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