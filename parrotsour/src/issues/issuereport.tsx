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

    onIssueSelChanged = (val:string): ()=>void => {
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
            const {getAnswer} = this.props   
            const {selection} = this.state  
            const canvas:HTMLCanvasElement= document.getElementById("pscanvas") as HTMLCanvasElement

            let realEmail = (email) ? email : "unknown"
            if (email && email.indexOf("@") === -1) realEmail += "@gmail.com"; 
 
            const realText = (text) ? text : "unknown"
            const answer = getAnswer()

            const formData = new FormData()
            formData.append("email", realEmail)
            formData.append("comments", realText + " \n\n" + answer)
            if (selection==="picprob")
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
        const {showIssueForm, submitEnabled} = this.state
        return (
        <div style={{width:"25%"}}>
            <button type="button" style={{marginLeft:"5%", top:"5px"}} onClick={this.handleToggleIssueForm}> Report Issue </button>     
            <Dialog
                fullScreen={false}
                open={showIssueForm}
                onClose={this.handleIssueClose} >
                <DialogContent>
                    {/* TODO - change this to /issues.html and use php to read from reported issues */}
                    See a list of <a href="/#/changelog.html">known issues</a>.
                </DialogContent>
                
                <form onSubmit={this.handleSubmit}>
                <DialogContent>
                    <IssueSelector selectionChanged={this.onIssueSelChanged}/>
                </DialogContent>
                <TextField
                    classes={{root:"textfull"}}
                    // eslint-disable-next-line
                    style={{margin:"5px", width:"95%"}}
                    required
                    id='email'
                    label='Email'
                    fullWidth
                    type="text" 
                    onChange={this.handleEmailChange}/>
                <TextField 
                    classes={{root:"textfull"}}
                    // eslint-disable-next-line
                    style={{margin:"5px", width:"95%"}}
                    required
                    id="issue"
                    label="Issue Description"
                    fullWidth
                    type="text"
                    multiline
                    onChange={this.handleTextChanged}/>
                <button type="button" hidden onClick={this.handleSubmit} />
                <DialogActions>
                    <Button onClick={this.handleSubmit} disabled={!submitEnabled}>
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