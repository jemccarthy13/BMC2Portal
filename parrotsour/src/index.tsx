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

import GlobalSnackbarProvider from "./pscomponents/alert/globalalertprovider"

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

ReactDOM.render(
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
