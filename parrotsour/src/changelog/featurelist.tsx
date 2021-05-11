/* eslint-disable react/forbid-component-props */
import React from "react"
import Accordion from "@material-ui/core/Accordion"
import { AccordionSummary, List, ListItem } from "@material-ui/core"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { useStyles } from "./changelogstyles"

/**
 * Returns a pretty list of scheduled features.
 *
 * To add a feature, add another string to the "features" array.
 *
 * @returns Material-ui accordion of anticipated features.
 */
export default function BugList(): JSX.Element {
  const classes = useStyles()

  const features = [
    "(v4.1.1) Cookies to remember user settings for PSControls",
    "(v4.1.2) Caps lock / shift draws circle",
    "(v4.1.3) Hard mode/show measure toggle during animate logic fix",
    "(v4.1.4) On cursor over aircraft, display information in TD/bball card",
    "(v4.1.5) Display altitudes in a boot (rel to circle draw)",
    "(v4.1.6) Map sizing and zoom review",
    "(v4.1.7) Draw measurements (fullInfo) smartly",
    "(v4.1.8) Finish opening/closing comm (particularly for range pics)",
    "(v4.2.0) CAP for more (all) picture types",
    "(v4.3.0) Basic Procedural simulation",
    "(v4.4.0) Procedural simulation with more than one aircraft",
    "(v4.5.0) Procedural simulation with taskings (requests)",
    "(v4.6.0) Procedural simulation with ACO",
    "(v4.7.0) Procedural simulation with multiple chatrooms",
    "(v4.8.0) Procedural simulation with generated conflicts",
    "(v5.0.0) Full up procedural release",
  ]

  return (
    <Accordion className={classes.accordionChild}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        Scheduled Features
      </AccordionSummary>
      <List>
        {features.map((feature) => {
          return (
            <ListItem
              key={feature.length + Math.random() * 100}
              className={classes.changeLI}
            >
              - {feature}
            </ListItem>
          )
        })}
      </List>
    </Accordion>
  )
}
