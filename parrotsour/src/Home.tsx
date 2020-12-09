import React, { Suspense, lazy, ReactElement } from "react";

import { Router, Route } from "react-router";
import { createBrowserHistory } from "history";

import "./css/snackbar.css";
import "./css/styles.css";
import "./css/body.css";
import "./css/fonts.css";

const ParrotSour = lazy(()=>import("./pscomponents/parrotsour"))
const ChangeLog = lazy(()=>import('./changelog'))

const browserHistory = createBrowserHistory();

/**
 * This is the main application. 
 * 
 * The application is loaded via 'chunks' (Googe: webpack code-splitting), but 
 * once the application is loaded up front, there is no loading time latency.
 * 
 * This main page contains the <Sidebar> component (loads the left navigation pane),
 * and controls the components that are displayed on navigation.
 * 
 * Note: Links don't actually navigate (POST http), the <Router> controls which 
 * React component is rendered in the "Content" pane.
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
//export default class BMC2Portal extends React.PureComponent {
const Home = ():ReactElement => {

  
  function getPS() : JSX.Element {
    return <ParrotSour type="chooser" interceptLink="/msncrew/parrotsourintercept.html" proceduralLink="/msncrew/parrotsourprocedural.html"/>
  }

  function getPSP(): JSX.Element {
    return <ParrotSour type="procedural"/>
  }

  function getPSI(): JSX.Element {
    return <ParrotSour type="intercept"/>
  }

  return (
    <div className="app">
    <div className="body-content" style={{width:"100%"}}>
      <Router history={browserHistory}>
        <Suspense fallback={<div>Loading...</div>} >
        <Route exact path="/" component={getPSP} />
        <Route exact path="/changelog.html" component={ChangeLog} />
        <Route path="/msncrew/parrotsour.html" render={getPS} />
        <Route path="/msncrew/parrotsourintercept.html" render={getPSI} />
        <Route path="/msncrew/parrotsourprocedural.html" render={getPSP} />
        </Suspense>
      </Router>
    </div>
    <div id="snackbar" />
  </div>
  )
}

export default Home