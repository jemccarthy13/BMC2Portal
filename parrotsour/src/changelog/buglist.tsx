/* eslint-disable react/forbid-component-props */
import React from "react"
import Accordion from "@material-ui/core/Accordion"
import { AccordionSummary, List, ListItem } from "@material-ui/core"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { useStyles } from "./changelogstyles"

/**
 * TODO -- convert this to use a fetch to retrieve the 'images' directory on
 * awardspace to show all currently reported bugs from other people
 *
 * @returns Material-ui accordion of known bugs
 */
export default function BugList(): JSX.Element {
  const classes = useStyles()

  const bugs = [
    {
      version: "4.0.4",
      description:
        "Sometimes in hard mode, picture 'width' will be <5 nm (sometimes '0')",
    },
  ]

  return (
    <Accordion defaultExpanded className={classes.accordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        Known Bugs
      </AccordionSummary>
      <List>
        {bugs.map((bug) => {
          return (
            <ListItem
              key={bug.version + Math.random() * 100}
              className={classes.changeLI}
            >
              - ({bug.version}) {bug.description}
            </ListItem>
          )
        })}
      </List>
    </Accordion>
  )
}
