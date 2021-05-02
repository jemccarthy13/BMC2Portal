import React, { ReactElement } from 'react'
import {DialogContent, DialogContentText} from '@material-ui/core'

export const PsQT = ():ReactElement => {
    return (
        <DialogContent>
        <DialogContentText>
            <b>Intercept:</b> Draws intercepts to practice picture building and comm formatting<br/>
            <b>Procedural: </b> Practice CLAP/DECON commands to move assets in a &quot;radar-assisted&quot; environment 
        </DialogContentText>
    </DialogContent>)
}