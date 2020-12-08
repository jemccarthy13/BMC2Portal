import React, { ReactElement } from 'react'
import Dropzone, { FileRejection } from 'react-dropzone'

import FileReject from './filereject'
import FileAccept from './fileaccept'

import '../../css/fileuploader.css'

import backend from '../utils/backend'

type FUProps = {
    maxFileCount: number,
    accept: string
}

type FUState = {
    acceptedFiles: File[],
    rejectedFiles: FileRejection[],
    uploadedFiles: File[]
}

/**
 * FileUploader provides a Component to render a File Dropzone.
 * 
 * Props can include "maxFileCount" (int) and "accept", which is a
 * comma-separated string containing acceptable MIME types and/or 
 * file extensions.
 */
export default class FileUploader extends React.PureComponent<FUProps, FUState> {
    
    constructor(props:FUProps){
        super(props)
        this.state={
            acceptedFiles:[],
            rejectedFiles:[],
            uploadedFiles:[]
        }
    }
    // Callback for when a file is dropped into the Dropzone
    handleDrop =(acceptedFiles:File[], rejectedFiles:FileRejection[]):void=>{
        // if theres a limit to the number of files
        // then we adjust the list of accepted/rejected files
        const { maxFileCount } = this.props
        if (maxFileCount){
            if (acceptedFiles.length > maxFileCount){
                for (let i=1; i<acceptedFiles.length; i++){
                    rejectedFiles.push({
                        file: acceptedFiles[i],
                        errors: [{message:"Limited to upload " + maxFileCount + " at a time.", code:"too-many-files"}]
                    })
                }
                // slice after parsing files to be rejected
                acceptedFiles = acceptedFiles.slice(0,1)
            }
        }
        this.setState({
            acceptedFiles,
            rejectedFiles
        })

        this.uploadFiles();
    }

    // Actually perform the upload POST request
    async uploadFiles(): Promise<void>{
        const formData = new FormData()
        const { acceptedFiles } = this.state
        acceptedFiles.forEach((file:File)=>{
            formData.append('file', file)
        })
        const result = await backend.postFiles(formData)

        if (result.ok ){
            this.setState({uploadedFiles: acceptedFiles})
        }
    }

    style = {
        outline: "2px dashed #92b0b3",
        outlineOffset: "-10px",
        WebkitTransition: "outline-offset .15s ease-in-out, background-color .15s linear",
        transition: "outline-offset .15s ease-in-out, background-color .15s linear",
        padding: "60px 0px 20px 0px",
        textalign: "center !important",
        margin: "0",
        backgroundColor: "white !important",
    }

    browseStyle={
        marginLeft:"15px",
        display:"inline-flex", 
        borderRadius:"15px",
        width:"fit-content",
        size:"0px"
    }

    // main Component render
    render(): ReactElement {
        const { accept } = this.props
        const { rejectedFiles, uploadedFiles } = this.state
        return (
            <Dropzone 
                accept={accept}
                onDrop={this.handleDrop}>
                {({getRootProps, getInputProps, isDragActive}) => (
                <div style={{width:"-webkit-fill-available"}}>
                    <div {...getRootProps()}>
                    <div className="files">
                    <input {...getInputProps()} />
                        { isDragActive && 
                            <div style={{...this.style, height:"37px"}}>Drop files here</div>
                        }
                        { !isDragActive && 
                            <div style={this.style}>
                                <div>Drag files here, or click 
                                    <button type="button" style={this.browseStyle}>Browse</button>
                                </div>
                            </div>
                        }
                        
                    </div>
                    </div>
                    {this.state && rejectedFiles && rejectedFiles.length > 0 && rejectedFiles.map((rejectedFile:FileRejection) => (
                        <FileReject key={rejectedFile.file.name} rejectedFile={rejectedFile} />
                    ))}
                    {this.state && uploadedFiles && uploadedFiles.length > 0 && uploadedFiles.map((acceptedFile:File) => (
                        <FileAccept key={acceptedFile.name} acceptedFile={acceptedFile} />
                    ))}
                </div>  
            )}
          </Dropzone>
        )
    }
}