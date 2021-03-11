import React, { ReactElement } from 'react'

import FileUploader from '../fileupload/fileuploader'

type LPProps = {
    update:boolean,
    loaLoc: string[]
}

type LPState = {
    isEdit: string|undefined
}

export default class LoaPdf extends React.PureComponent<LPProps, LPState> {

    constructor(props:LPProps){
        super(props)
        this.state={
            isEdit: undefined
        }
    }

    // Get a button with appropriate styling ('Update' button)
    getButton(text:string, clickHandler:(event: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>void):JSX.Element 
    {
        return <button type="button" style={{padding:"5px",borderRadius:"5px"}} onClick={clickHandler}>{text}</button>
    }

    setEdit(loa:string):()=>void{
        return () => this.setState({isEdit: loa})
    }

    unsetEdit = ():void =>{
        this.setState({isEdit: undefined})
    }

    // Check if we are editing at the current index
    isEdit(loa:string):boolean{
        const { isEdit } = this.state
        return isEdit===loa;
    }

    render():ReactElement{
        const {loaLoc,update} = this.props
        return (<div>
            {loaLoc.map((loa) => {
            return (<div style={{marginBottom:"15px"}} key={loa}>
                <a href={"/loas/"+loa}>{loa}</a>
                {this.isEdit(loa) &&  // we're editing, so provide the file uploader
                <div style={{width:"-webkit-fill-available", display:"inline-flex", margin:"5%"}}>
                    <FileUploader maxFileCount={1} accept="application/pdf,.pdf,.txt"/>
                    {this.isEdit(loa) &&  // we're editing, so provide the button to close file uploader
                    <div style={{float:"right"}}> {this.getButton("X", this.unsetEdit)} </div>
                    }
                    
                </div>}
                {!this.isEdit(loa) && update && 
                    <div style={{float:"right"}}>
                        {this.getButton("Update", this.setEdit(loa))}
                    </div>}
            </div>)
            })}
        </div>)
    }
}