import React, { ReactElement } from 'react'

/**
 * Component to display versioning information at the bottom of PS sites
 */
export default class VersionInfo extends React.PureComponent {

    vStyle = {
        color:"lightblue"
    }

    render(): ReactElement {
        return(
            <div style={this.vStyle}>
                 <br /><br /><br /><br /><br /><br /><br />
                Developed by John McCarthy <br />
                Version: 3.1.0 --
                <a style={this.vStyle} href="/#/changelog.html"> Change Log </a> <br />
                14 Dec 2020 <br />
            </div>
        )
    }
}