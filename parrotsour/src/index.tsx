import Canvas from './canvas/canvas'
import PictureCanvas from './canvas/draw/intercept/picturecanvas'
import {ParrotSourChooser} from './pscomponents/parrotsourchooser'
import ParrotSourHeader from './pscomponents/parrotsourheader'
import ParrotSourControls from './pscomponents/parrotsourcontrols'
import ParrotSour from './pscomponents/parrotsour'
import ParrotSourIntercept from './intercept/parrotsourintercept'
import PicTypeSelector from './intercept/pictypeselector'
import StandardSelector from './intercept/standardselector'

import ParrotSourProcedural from './procedural/parrotsourprocedural'

import { AlsaHelp } from './quicktips/alsahelp'
import { InterceptQT } from './quicktips/interceptQT'
import { PsQT } from './quicktips/psQT'
import ReactDOM from 'react-dom'
import React, { Suspense } from 'react'
import Home from 'Home'

export {
    Canvas,
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
        <Home />
      </Suspense>
    </React.StrictMode>,
    document.getElementById("root")
);