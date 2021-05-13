import React, { CSSProperties } from "react"

import { SnackbarKey, SnackbarProvider } from "notistack"

import snackActions, { SnackbarUtilsConfigurator } from "./psalert"

const transparentBtnStyle: CSSProperties = {
  height: "100%",
  left: 0,
  position: "absolute",
  top: 0,
  width: "100%",
  backgroundColor: "Transparent",
  backgroundRepeat: "no-repeat",
  outline: "none",
}

export default class GlobalAlertProvider extends SnackbarProvider {
  dismissNotification = (key: SnackbarKey): (() => void) => {
    return () => {
      snackActions.closeSnackbar(key)
    }
  }

  dismissAction = (key: SnackbarKey): React.ReactElement => {
    return (
      <button
        type="button"
        onClick={this.dismissNotification(key)}
        style={transparentBtnStyle}
      />
    )
  }

  render(): React.ReactElement {
    const { children, ...other } = this.props
    return (
      <SnackbarProvider {...other} action={this.dismissAction}>
        <SnackbarUtilsConfigurator />
        {children}
      </SnackbarProvider>
    )
  }
}
