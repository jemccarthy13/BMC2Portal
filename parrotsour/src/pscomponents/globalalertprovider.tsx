import React from "react"

import { Button } from "@material-ui/core"
import { SnackbarKey, SnackbarProvider } from "notistack"

import _snackActions, { SnackbarUtilsConfigurator } from "./psalert"

export default class GlobalAlertProvider extends SnackbarProvider {
  dismissNotification = (key: SnackbarKey): (() => void) => {
    return () => {
      _snackActions.closeSnackbar(key)
    }
  }

  dismissAction = (key: SnackbarKey): React.ReactElement => {
    return (
      <Button
        onClick={this.dismissNotification(key)}
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
