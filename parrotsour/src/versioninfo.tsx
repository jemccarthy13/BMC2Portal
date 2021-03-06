import React, { ReactElement } from "react"

/**
 * Component to display versioning information at the bottom of PS sites
 */
export default class VersionInfo extends React.PureComponent {
  vStyle = {
    color: "lightblue",
    paddingTop: "200px",
    paddingBottom: "20px",
    fontSize: 18,
  }

  render(): ReactElement {
    return (
      <div id="vInfo" style={this.vStyle}>
        Developed by John McCarthy <br />
        Version:&nbsp;
        <a style={{ color: "#7978FD" }} href="/#/changelog.html">
          4.0.4
        </a>
        <br />
        20 May 2021 <br />
      </div>
    )
  }
}
