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
 * TODO -- CHANGELOG -- css and styling revamp.
 *
 * @returns Material-ui accordion of anticipated features.
 */
export default function BugList(): JSX.Element {
  const classes = useStyles()

  // TODO -- CHANGELOG -- split this into a child accordion:
  // features = [ { version: "4.1.0", features: [""] } ]
  const features = [
    "(v4.0.1) Better radar/iff trail logic",
    "(v4.1.0) Verify anchoring pri's in WALL, CHAMP TRAIL gps, CAP",
    "(v4.1.0) Finish opening/closing comm (particularly for range pics)",
    "(v4.1.0) CAP for more picture types",
    "(v4.2.0) Basic Procedural simulation",
    "(v4.3.0) Procedural simulation with more than one aircraft",
    "(v4.4.0) Procedural simulation with taskings (requests)",
    "(v4.5.0) Procedural simulation with ACO",
    "(v4.6.0) Procedural simulation with multiple chatrooms",
    "(v4.6.0) Procedural simulation with generated conflicts",
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
