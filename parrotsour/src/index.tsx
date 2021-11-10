/* eslint-disable react/forbid-component-props */
/* eslint-disable react/jsx-no-bind */
import ReactDOM from "react-dom"
import React, { Suspense } from "react"
import Home from "./Home"

import GlobalSnackbarProvider from "./pscomponents/alert/globalalertprovider"

import CookieConsent, { Cookies } from "react-cookie-consent"

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
    <CookieConsent
      location="top"
      style={{ backgroundColor: "#a0a1a0", border: "2px solid grey" }}
    >
      This website uses cookies to enhance the user experience. To learn more,
      please see the release notes.
    </CookieConsent>
  </React.StrictMode>,
  document.getElementById("root")
)

/**
 *
 */
const version = "4.0.6"
const cookieIsNotSet =
  Cookies.get(version + "Notify") === undefined ||
  Cookies.get(version + "Notify") === "false"

// remove after confidence most people have seen new release notification
if (cookieIsNotSet) {
  snackActions.info("Check out the newest release of ParrotSour!", {
    style: { pointerEvents: "all" },
    autoHideDuration: 10000,
    preventDuplicate: true,
    // eslint-disable-next-line react/display-name
    action: (key) => {
      return (
        <>
          <Button
            onClick={() => {
              window.location.href = "#/changelog.html#4.0.6"
              Cookies.set(version + "Notify", true, { expires: 365 })
              snackActions.closeSnackbar(key)
            }}
          >
            {version}
          </Button>
          <Button
            onClick={() => {
              Cookies.set(version + "Notify", true, { expires: 365 })
              snackActions.closeSnackbar(key)
            }}
          >
            Dismiss
          </Button>
        </>
      )
    },
  })
}
