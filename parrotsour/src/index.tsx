import DrawingCanvas from "./canvas/drawingcanvas"
import PictureCanvas from "./canvas/picturecanvas"
import { ParrotSourChooser } from "./pscomponents/parrotsourchooser"
import ParrotSourHeader from "./pscomponents/parrotsourheader"
import ParrotSourControls from "./pscomponents/parrotsourcontrols"
import ParrotSour from "./pscomponents/parrotsour"
import ParrotSourIntercept from "./intercept/parrotsourintercept"
import PicTypeSelector from "./intercept/pictypeselector"
import StandardSelector from "./intercept/standardselector"

import ParrotSourProcedural from "./procedural/parrotsourprocedural"

import { AlsaHelp } from "./pscomponents/quicktips/alsahelp"
import { InterceptQT } from "./pscomponents/quicktips/interceptQT"
import { PsQT } from "./pscomponents/quicktips/psQT"
import ReactDOM from "react-dom"
import React, { Suspense } from "react"
import Home from "./Home"
import { SnackbarKey, SnackbarProvider } from "notistack"
import { SnackbarUtilsConfigurator } from "./pscomponents/psalert"

import snackActions from "./pscomponents/psalert"
import { Button } from "@material-ui/core"

export {
  DrawingCanvas as Canvas,
  PictureCanvas,
  ParrotSourIntercept,
  PicTypeSelector,
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

const dismissNotification = (key: SnackbarKey): (() => void) => {
  return () => {
    snackActions.closeSnackbar(key)
  }
}

const dismissAction = (key: SnackbarKey) => {
  return (
    <Button
      onClick={dismissNotification(key)}
      // eslint-disable-next-line react/forbid-component-props
      style={{
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%",
      }}
    />
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        action={dismissAction}
      >
        <SnackbarUtilsConfigurator />
        <Home />
      </SnackbarProvider>
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
)
