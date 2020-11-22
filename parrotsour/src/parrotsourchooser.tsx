import React, { lazy, ReactElement } from 'react'

import { PsQT } from './quicktips/psQT'

const ParrotSourHeader = lazy(()=>import('./parrotsourheader'))

type PSCProps = {
    interceptLink?: string,
    proceduralLink?: string
}

export const ParrotSourChooser = (props:PSCProps):ReactElement => {

    const buttonStyle = {
        width:"25%",
        margin:"5px"
    }

    function navigate (link?:string): ()=>void {
        return ()=>{
            window.location.href = (link) ? link : "#"
        }
    }   

    function emptyFunc():string {
        return ""
    }

    return (
        <div>
            <ParrotSourHeader comp={<PsQT/>} getAnswer={emptyFunc}/>
            <br/>
            <hr/>
            <div style={{textAlign:"center"}}>
                <button style={buttonStyle} type="button" onClick={navigate(props.interceptLink)}> Intercept </button>
                <button style={buttonStyle} type="button" onClick={navigate(props.proceduralLink)}> Procedural </button>
            </div>
        </div>
    )
}
