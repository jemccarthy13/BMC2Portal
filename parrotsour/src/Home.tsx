/* eslint-disable react/jsx-no-bind */
import React, { Suspense, lazy, Fragment } from "react"

import { Route } from "react-router"
import { HashRouter } from "react-router-dom"

import "./css/snackbar.css"
import "./css/styles.css"
import "./css/body.css"
import "./css/fonts.css"

const ParrotSour = lazy(() => import("./pscomponents/parrotsour"))

import ChangeLog from "./changelog/changelog"

import snackActions from "./pscomponents/alert/psalert"
import { Button } from "@material-ui/core"

/**
 * This is the main entry point into the front-facing application.
 *
 * The application is loaded via 'chunks' (Googe: webpack code-splitting), but
 * once the application is loaded up front, there is no loading time latency.
 *
 * This main page contains a navigational component (SideBar), but the Routes
 * will not actually redirect - Router controls which Component is rendered in
 * the viewport.
 *
 * To add a 'page', one would:
 * - Determine the desired URL/path
 * - Add a "Route" in the Router below.
 *   -- "path" is the url from step 1.
 *   -- "component" is the react component to render
 * - (Optional) Edit the "SideBar" component to add a menu item to navigate to that page
 * - (Alternate) Determine what component will link to it
 *               the AirspacePage Route and Component follow this example;
 *               it isn't in the navigation pane but the AirspaceList component links to it
 * - Design/implement your Component
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
    snackActions.info("Check out the newest release of ParrotSour!", {
      autoHideDuration: 10000,
      preventDuplicate: true,
      action: (key) => {
        return (
          <>
            <Button
              onClick={() => {
                window.location.href = "#/changelog.html#4.0.0"
                snackActions.closeSnackbar(key)
              }}
            >
              v4.0.0
            </Button>
            <Button onClick={() => snackActions.closeSnackbar(key)}>
              Dismiss
            </Button>
          </>
        )
      },
    })
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
