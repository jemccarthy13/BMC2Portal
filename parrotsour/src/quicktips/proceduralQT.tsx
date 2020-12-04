import React, { ReactElement } from 'react'
import { DialogContent, DialogContentText } from '@material-ui/core'

export const ProceduralQT = (): ReactElement => {
    return (
        <DialogContent>
            <DialogContentText>
                This tool is designed to help address controlling deficiencies for procedural 
                deconfliction, both during midnight and when sensors are operational.
            </DialogContentText>
            <DialogContentText>
                There is also a rudimentary chat system that allows controllers to 
                practice external coordination and affect the outcome of the simulation 
                and practice scope mechanics to deconflict.
            </DialogContentText>
            <DialogContentText>
                <b> Features </b>
            </DialogContentText>
            <DialogContentText>
                <b> Chat </b> An &quot;airspace&quot; window, where assets will request transits and working airspaces.
                This room will interpret travel commands when formatted appropriately. <br/><br/>
                <b> Difficulty Selection </b> The difficulty can be ramped up from basic building 
                blocks to a flushed out tactical problem. Your solution is not graded for efficiency or
                 correctness, only for safe transits and airspace adherence.<br/><br/>
                <b> Fights On / Pause </b>
                The simulation will run unless paused, and when paused no commands will be executed nor will there be additional injects. <br/><br/><br/>
            </DialogContentText>
        </DialogContent>
    )
}