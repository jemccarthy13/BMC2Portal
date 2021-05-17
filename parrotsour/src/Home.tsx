import React, { Suspense, lazy } from "react"

import { Route } from "react-router"
import { HashRouter } from "react-router-dom"

import "./css/snackbar.css"
import "./css/styles.css"
import "./css/body.css"
import "./css/fonts.css"

const ParrotSour = lazy(() => import("./pscomponents/parrotsour"))

import ChangeLog from "./changelog/changelog"

/**
 * This is the main entry point into the front-facing application.
 *
 * The application is loaded via 'chunks' (Googe: webpack code-splitting), but
 * once the application is loaded up front, there is no loading time latency.
 *
 * Once procedural is running, the home page allows selection between procedural
 * and intercept.
 *
 * (TODO -- PROC -- figure out how to default intercept? and provide "Home" btn?)
 */
export default class Home extends React.PureComponent {
  getPS = (): JSX.Element => {
    return (
      <ParrotSour
        type="chooser"
        interceptLink="/#/intercept.html"
        proceduralLink="/#/procedural.html"
      />
    )
  }

  getPSP = (): JSX.Element => {
    return <ParrotSour type="procedural" />
  }

  getPSI = (): JSX.Element => {
    return <ParrotSour type="intercept" />
  }

  render(): React.ReactElement {
    return (
      <div className="app">
        <div className="body-content" style={{ width: "100%" }}>
          <HashRouter>
            <Suspense fallback={<div>Loading...</div>}>
              <Route exact path="/" component={this.getPSI} />
              <Route path="/changelog.html" component={ChangeLog} />
              <Route path="/parrotsour.html" render={this.getPS} />
              <Route path="/intercept.html" render={this.getPSI} />
              <Route path="/procedural.html" render={this.getPSP} />
            </Suspense>
          </HashRouter>
        </div>
      </div>
    )
  }
}
