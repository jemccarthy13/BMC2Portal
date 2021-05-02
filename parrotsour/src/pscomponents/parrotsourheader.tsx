import React, { CSSProperties, ReactElement } from 'react'

import IssueReport from './issues/issuereport'
import {Dialog} from '@material-ui/core'
import { PictureAnswer } from 'canvas/canvastypes'

interface PSHeaderProps{
    comp?:ReactElement,
    answer: PictureAnswer
}

interface PSHeaderState{
    showQT: boolean,
}

/**
 * ParrotSour top header. Includes controls for:
 * 
 * - Quick Tips
 * - Issue Report
 * - 552 Logos
 */
export default class ParrotSourHeader extends React.PureComponent<PSHeaderProps, PSHeaderState> {

    constructor(props: PSHeaderProps){
        super(props)
        this.state={
            showQT: false,
        }
    }

    imgStyle:CSSProperties = {
        position:"absolute",
        height: "60px",
        top: "5px", 
    }

    /**
     * Toggle display of the QuickTips Dialog Element (component passed in props)
     */
    handleToggleQT = ():void =>{
        const { showQT } = this.state
        this.setState({showQT: !showQT})
    }
    
    /**
     * Called when the quick tips dialog is closed
     */
    handleQTClose = ():void => {
        this.setState({showQT: false})
    }
    
    render():ReactElement{
        const { showQT } = this.state
        const { comp, answer } = this.props
        return (
            <div>
                <img src="/icon/552trans.png" style={{...this.imgStyle, right:"5%"}} id="acwlogo" alt="552Logo" />
                <img src="/icon/panthertrans.png" style={{...this.imgStyle, right:"15%"}} id="pantherlogo" alt="968Logo" />

                <div style={{display:"flex"}}>
                    <button type="button" style={{width:"25%",top:"5px"}} onClick={this.handleToggleQT}>Quick Tips</button>
                    {showQT && 
                        <Dialog
                            open={showQT}
                            onClose={this.handleQTClose}>
                            {comp}
                        </Dialog>
                    }
                    <IssueReport answer={answer}/>
                </div>
            </div>
        )
    }
}