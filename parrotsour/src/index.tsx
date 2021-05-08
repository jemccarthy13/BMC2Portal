/* eslint-disable react/jsx-no-bind */
import DrawingCanvas from "./canvas/drawingcanvas"
import PictureCanvas from "./canvas/picturecanvas"
import { ParrotSourChooser } from "./pscomponents/parrotsourchooser"
import ParrotSourHeader from "./pscomponents/parrotsourheader"
import ParrotSourControls from "./pscomponents/parrotsourcontrols"
import ParrotSour from "./pscomponents/parrotsour"
import ParrotSourIntercept from "./pscomponents/intercept/parrotsourintercept"
import PicOptionsBar from "./pscomponents/intercept/picoptionsbar"
import StandardSelector from "./pscomponents/intercept/standardselector"

import ParrotSourProcedural from "./pscomponents/procedural/parrotsourprocedural"

import { AlsaHelp } from "./pscomponents/quicktips/alsahelp"
import { InterceptQT } from "./pscomponents/quicktips/interceptQT"
import { PsQT } from "./pscomponents/quicktips/psQT"
import ReactDOM from "react-dom"
import React, { Suspense } from "react"
import Home from "./Home"

import GlobalSnackbarProvider from "./pscomponents/alert/globalalertprovider"

export {
  DrawingCanvas as Canvas,
  PictureCanvas,
  ParrotSourIntercept,
  PicOptionsBar as PicTypeSelector,
  StandardSelector,
  ParrotSourProcedural,
  AlsaHelp,
  InterceptQT,
  PsQT,
  ParrotSour,
  ParrotSourControls,
  ParrotSourHeader,
  ParrotSourChooser,
}

import snackActions from "./pscomponents/alert/psalert"
import { Button } from "@material-ui/core"

export default ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <GlobalSnackbarProvider
        maxSnack={3}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <Home />
      </GlobalSnackbarProvider>
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
)

/**
 * TODO -- COOKIE -- set cookie on user action of notification
 * to avoid displaying on refresh.
 *
 * versionNotifications.get({versionNum}) is defined, don't display
 *
 * Use universal-cookie package?
 * https://github.com/reactivestack/cookies/tree/master/packages/universal-cookie
 *
 */
// remove after confidence most people have seen new release notification
snackActions.info("Check out the newest release of ParrotSour!", {
  autoHideDuration: 10000,
  preventDuplicate: true,
  // eslint-disable-next-line react/display-name
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
        <Button onClick={() => snackActions.closeSnackbar(key)}>Dismiss</Button>
      </>
    )
  },
})
