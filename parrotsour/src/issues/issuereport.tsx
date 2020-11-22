import React, { ReactElement } from 'react'

import {Button, Dialog, DialogActions, DialogContent, TextField} from '@material-ui/core'
import IssueSelector from 'issues/issueselector'

import '../css/collapsible.css'
import snackbar from '../utils/alert'

type IRState = {
    showIssueForm: boolean,
    selection:string,
    email?: string,
    text?: string,
    submitEnabled:boolean
}

type IRProps = {
    getAnswer: () => string
}

export default class IssueReport extends React.PureComponent<IRProps, IRState> {

    constructor(props: IRProps){
        super(props)
        this.state={
            showIssueForm: false,
            selection:"picprob",
            submitEnabled: true
        }
    }

    /**
     * Toggle the issue form display
     */
    handleToggleIssueForm = ():void =>{
        this.setState(prevState=>({showIssueForm: !prevState.showIssueForm}))
    }

    /**
     * Called when the issue report form is closed
     */
    handleIssueClose = ():void =>{
        this.setState({showIssueForm:false})
    }

    handleIssueSelChanged = (val:string): ()=>void => {
        return ()=>{ this.setState({selection:val})}
    }

    handleEmailChange = (e:React.ChangeEvent<HTMLTextAreaElement>):void => {
        this.setState({email: e.currentTarget.value})
    }

    handleTextChanged = (e:React.ChangeEvent<HTMLTextAreaElement>):void => {
        this.setState({text: e.currentTarget.value})
    }

    // eslint-disable-next-line
    handleSubmit = async (e:any):Promise<void> => {
        const {email, text} = this.state
        const goodForm = e.currentTarget.form.reportValidity()
        e.preventDefault();

        this.setState({submitEnabled:false})
        if (goodForm) {        
            const canvas:HTMLCanvasElement= document.getElementById("pscanvas") as HTMLCanvasElement
            let id: ImageData|undefined
            id = undefined
            if (canvas !== null){
                const context = canvas.getContext("2d")
                if (context !== null){
                    id = context.getImageData(0,0, canvas.width, canvas.height)
                }
            }
            let realEmail = (email) ? email : "unknown"
            if (email && email.indexOf("@") === -1) realEmail += "@gmail.com"; 
 
            const realText = (text) ? text : "unknown"
            const answer = this.props.getAnswer()

            const formData = new FormData()
            formData.append("email", realEmail)
            formData.append("comments", realText + " \n\n" + answer)
            formData.append("image", canvas.toDataURL('image/png'))
            const response = await fetch(process.env.PUBLIC_URL+'/database/emailissue.php', {
                method: "POST",
                body: formData
            });
            
            if (response.ok){
                snackbar.alert("Submitted!", 5000, "green")
                this.setState({showIssueForm:false})
            } else {
                snackbar.alert("Issue report failed.\nTry again later.", 5000, "red")
            }
        }
        
        this.setState({submitEnabled:true})
    }

    handleClose = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
        event.preventDefault()
        this.setState({showIssueForm:false})
    }

    render(): ReactElement {
        const {showIssueForm} = this.state
        return (
        <div style={{width:"25%"}}>
            <button type="button" style={{marginLeft:"5%", top:"5px"}} onClick={this.handleToggleIssueForm}> Report Issue </button>     
            <Dialog
                fullScreen={false}
                open={showIssueForm}
                onClose={this.handleIssueClose} >
                <DialogContent>
                    See a list of <a href="/issues.html">known issues</a>.
                </DialogContent>
                
                <form onSubmit={this.handleSubmit}>
                <DialogContent>
                    <IssueSelector selectionChanged={this.handleIssueSelChanged}/>
                </DialogContent>
                <TextField 
                    className="textfull"
                    style={{margin:"5px", width:"95%"}}
                    required
                    id='email'
                    label='Email'
                    fullWidth
                    type="text" 
                    onChange={this.handleEmailChange}/>
                <TextField 
                    classes={{root:"textfull"}}
                    style={{margin:"5px", width:"95%", height:"25%", minHeight:"25%"}}
                    required
                    id="issue"
                    label="Issue Description"
                    fullWidth
                    type="text"
                    multiline
                    onChange={this.handleTextChanged}/>
                <button type="button" hidden onClick={this.handleSubmit} />
                <DialogActions>
                    <Button onClick={this.handleSubmit} disabled={!this.state.submitEnabled}>
                        Submit
                    </Button>
                    <Button onClick={this.handleClose}>
                        Cancel
                    </Button>
                </DialogActions>  
                </form>
            </Dialog>
        </div>)
    }
}