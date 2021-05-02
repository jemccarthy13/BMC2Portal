import React, { ReactElement } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Chips from './chips';

import snackbar from '../utils/alert'
import backend from '../utils/backend'

type FormProps = {
    onClose: {():void},
}

type FormState = {
    open:boolean,
    searchTags: string[],
    allTags: string[],
    title:string,
    author:string,
    content:string
}

export default class Form extends React.PureComponent<FormProps, FormState> {

    constructor(props:FormProps){
        super(props)
        this.state ={
            open: true,
            searchTags: [],
            allTags: [],
            title:"",
            author:"",
            content:""
        }
    }

    setSearchTags = (tags:string[]):void => {
        this.setState({searchTags: tags})
    }

    isOpen():boolean{
        const { open } = this.state
        return open
    }

    setOpen(val:boolean):void{
        this.setState({
            open:val
        })
    }

    handleClickOpen = ():void =>{
        this.setOpen(true)
    }

    handleClose = ():void => {
        this.setOpen(false)
        const {onClose } = this.props
        onClose()
    }

    // eslint-disable-next-line
    handleSubmit = async (e:any):Promise<void> => {
        const {title, author, content} = this.state
        const goodForm = e.currentTarget.form.reportValidity()
        e.preventDefault();
        if (goodForm) {
            const res = await backend.postLessonLearned(title, author, content)
            if (res === "OK"){
                snackbar.alert("Submitted!", 5000, "green")
                this.handleClose()
            } else{
                snackbar.alert("Error submitting...", 5000, "red")
            }
        }
    }

    handleTitleChange = (e:React.ChangeEvent<HTMLTextAreaElement>):void => {
        this.setState({title: e.currentTarget.value})
    }
    handleAuthorChange = (e:React.ChangeEvent<HTMLTextAreaElement>):void =>{
        this.setState({author: e.currentTarget.value})
    }
    handleContentChange = (e:React.ChangeEvent<HTMLTextAreaElement>):void => {
        this.setState({content: e.currentTarget.value})
    }

    render(): ReactElement {
        const date = new Date()
        const dateStr = date.getFullYear() +"-" + date.getMonth() + "-" + date.getDay();

        const {open, searchTags, allTags} = this.state
        return (<Dialog 
            /*style={{marginLeft:"25%"}}*/
            fullScreen={false}
            open={open}
            onClose={this.handleClose}>
                <form onSubmit={this.handleSubmit}>
                <DialogContent>
                    <DialogContentText>
                        Date: {dateStr}
                    </DialogContentText>
                    <TextField 
                        required
                        id='title'
                        label='Title'
                        fullWidth
                        type="text" 
                        onChange={this.handleTitleChange}/>
                    <TextField 
                        required
                        id='content'
                        label='Lesson Learned'
                        fullWidth
                        type="text"
                        multiline 
                        onChange={this.handleContentChange}/>
                    <TextField 
                        required
                        id='author'
                        label='Author'
                        fullWidth
                        type="text"
                        onChange={this.handleAuthorChange}/>
                    <button type="button" hidden onClick={this.handleSubmit} />
                    <br/><br/>
                    <Chips 
                        isEdit
                        hasRemove
                        title="Tags:"
                        setTags={this.setSearchTags}
                        tags={searchTags}
                        allTags={allTags}
                        defaultText="Enter tags..."
                    />
                </DialogContent> 
                <DialogActions>
                    <Button onClick={this.handleSubmit}>
                        Submit
                    </Button>
                    <Button onClick={this.handleClose}>
                        Cancel
                    </Button>
                </DialogActions>    
                </form>
            </Dialog>)
    }
}