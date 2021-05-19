import { ToggleButtonGroup, ToggleButton } from "@material-ui/core"
import React, { ReactElement } from "react"

type DSState = {
  difficulty: string
}

export default class DifficultySelector extends React.PureComponent<
  Record<string, unknown>,
  DSState
> {
  constructor(props: Record<string, unknown>) {
    super(props)
    this.state = {
      difficulty: "easy",
    }
  }

  handlePicTypeChange = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    value: string
  ): void => {
    if (value !== null) this.setState({ difficulty: value })
  }

  render(): ReactElement {
    const { difficulty } = this.state
    return (
      <ToggleButtonGroup
        value={difficulty}
        exclusive
        onChange={this.handlePicTypeChange}
        classes={{
          root: "buttongroup",
        }}
      >
        <ToggleButton
          value="easy"
          classes={{
            root: "muitoggle",
          }}
        >
          Easy
        </ToggleButton>
        <ToggleButton
          value="med"
          classes={{
            root: "muitoggle",
          }}
        >
          Med
        </ToggleButton>
        <ToggleButton
          value="hard"
          classes={{
            root: "muitoggle",
          }}
        >
          Hard
        </ToggleButton>
        <ToggleButton
          value="insane"
          classes={{
            root: "muitoggle",
          }}
        >
          XHard
        </ToggleButton>
      </ToggleButtonGroup>
    )
  }
}
