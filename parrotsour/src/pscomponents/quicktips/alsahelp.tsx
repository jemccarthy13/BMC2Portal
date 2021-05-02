import React, { ReactElement } from 'react'

import {DialogContent, DialogContentText } from '@material-ui/core'

/**
 * This Component contains the dialog for ALSA help text
 */
export const AlsaHelp = ():ReactElement => {
    return (
        <DialogContent>
            <DialogContentText>
                Download the pub <a target='_window' href='https://www.alsa.mil/MTTPs/ACC/'> here! </a>
            </DialogContentText>
            <DialogContentText>
                <b>ALSA ACC</b><br /> ACC is a new comm format from the ALSA joint publications. The intent behind the standard is to
                provide a common standard between Navy and Air Force previous standards. This guide is intended to help 3-1/3-3 
                controllers rapidly transition to ACC with difference training, specifically in how pictures are formatted.
            </DialogContentText>
            <DialogContentText>
                <b>Labeling Criteria</b> now allows for cold pictures to be voiced in their present relationship dependent on the pre-briefed fight axis.
                For an East-West fight with blue in the East, this means red air track west can still be labeled with traditional pictures.
            </DialogContentText>
            <DialogContentText>
                <b>Track Direction</b> is included after picture dimensions if all groups are tracking in the same direction. When red air is tracking different directions,
                track direction is included after each group.
                Ex: <i>GOLIATH, 2 GROUPS AZIMUTH 12, TRACK WEST...</i><br/><br/>
                <i> GOLIATH, 2 GROUPS AZIMUTH 12, EAST GROUP BULLSEYE 069/42 TRACK NORTH, HOSTILE </i>
            </DialogContentText>
            <DialogContentText>
                <b>Stacks</b> are now voiced with an &quot; AND &quot; between altitudes. Ex:<br/>
                <i>DARKSTAR, 2 GROUPS RANGE 13, LEAD GROUP BULLSEYE 001/30, STACK 42k <b> AND </b> 30k, HOSTILE 2 CONTACTS, TRAIL GROUP...</i><br/>
                In addition, a 2-contact stack is not given X HIGH/X LOW fill-ins.<br/>
                In the case of 3 separated altitudes: <br/>
                <i>CHALICE, SINGLE GROUP BULLSEYE 069/42, STACK 43k, 33k, <b>AND</b> 18k, HOSTILE HEAVY 4 CONTACTS, 2 HIGH 1 MED 1 LOW</i><br/><br/>
            </DialogContentText>
            <DialogContentText>
                <b>Use Bullseye</b> for each group on the leading edge of a picture if the azimuth of the leading edge is {`>`} 10 miles. Some examples:<br/>
                <i>BANDSAW, 2 GROUPS AZIMUTH 11, SOUTH GROUP BULLSEYE 069/42, 21k, HOSTILE, NORTH GROUP BULLSEYE 030/48, 22k, HOSTILE</i><br/><br/>
                <i>BARNYARD, 3 GROUP CHAMPAGNE 22 WIDE, 12 DEEP, NORTH LEAD GROUP BULLSEYE 069/55, 28k, HOSTILE, SOUTH LEAD GROUP BULLSEYE 075/55, 32k, HOSTILE, TRAIL GROUP 34k HOSTILE</i><br/><br />
                This rule applies for azimuth only (i.e. wall, champagne, azimuth) and does not apply for range presentations such as a vic or ladder.<br/><br/>
            </DialogContentText>
            <DialogContentText>
                <b>Aspect </b> is used in threat calls. Ex:<br/>
                <i>VIPER01, THREAT GROUP BRAA 270/16, 22k, HOT HOSILE</i><br/><br/>
            </DialogContentText>
        </DialogContent>
    )
}