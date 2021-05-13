import React, { ReactElement } from "react";

import { makeStyles, Theme, createStyles } from "@material-ui/styles";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from "@material-ui/core";

import {
  BusinessCenter,
  ExpandLess,
  ExpandMore,
  FlightTakeoff,
  Help,
  Inbox,
} from "@material-ui/icons";

import Category from "./Category";
import NavMenuItem from "./navmenuitem";

const categories: Category[] = [
  {
    name: "Flight Deck",
    children: [
      { name: "First Link", icon: <Help /> },
      { name: "Second Link", icon: <Help /> },
      { name: "AR Tracks", icon: <Inbox />, link: "/common/artracks.html" },
      { name: "E-3 Orbits", icon: <Inbox />, link: "/common/orbits.html" },
      {
        name: "Debrief",
        icon: <BusinessCenter />,
        link: "/common/debrief.html",
      },
    ],
  },
  {
    name: "Mission Crew",
    icon: <FlightTakeoff />,
    children: [
      { name: "ParrotSour", icon: <Inbox />, link: "/msncrew/parrotsour.html" },
      {
        name: "Air Spaces",
        icon: <Inbox />,
        link: "/msncrew/airspacelist.html",
      },
      {
        name: "Fighter Units",
        icon: <Inbox />,
        link: "/msncrew/unitlist.html",
      },
      { name: "LOAs", icon: <Inbox />, link: "/msncrew/loalist.html" },
      {
        name: "AR Tracks",
        icon: <BusinessCenter />,
        link: "/common/artracks.html",
      },
      { name: "E-3 Orbits", icon: <Inbox />, link: "/common/orbits.html" },
      {
        name: "Debrief",
        icon: <BusinessCenter />,
        link: "/common/debrief.html",
      },
    ],
  },
  {
    name: "Lessons Learned",
    icon: <FlightTakeoff />,
    link: "/common/lessons.html",
    children: undefined,
  },
  {
    name: "FAA Map",
    icon: <FlightTakeoff />,
    link: "/common/faamap.html",
    children: undefined,
  },
  {
    name: "Links & Resources",
    icon: <FlightTakeoff />,
    link: "/resources.html",
    children: undefined,
  },
  {
    name: "Contact",
    icon: <FlightTakeoff />,
    link: "/contact.html",
    children: undefined,
  },
];

/**
 * This React Component provides the left hand navigation menu for the website.
 *
 * To add a navigation item, add a <NavMenuItem> in the appropriate spot in this list.
 *
 * See <NavMenuItem> for options.
 */

//Basic style guide

const SideBar = (): ReactElement => {
  // These are categories with links
  const parentCategories = categories.filter(
    (category: Category) => category.children !== undefined
  );

  // These are categories with no links
  const orphanCategories = categories.filter(
    (category: Category) => category.children === undefined
  );

  const handleNavigate = (): void => {
    const { link } = this.props;

    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div>
      <List
        component="nav"
        subheader={<ListSubheader>Training Portal</ListSubheader>}
      >
        {parentCategories.map((aCategory: Category) => (
          <ListItem button key={aCategory.name}>
            <ListItemIcon>{aCategory.icon}</ListItemIcon>
            <ListItemText primary={aCategory.name} />
            {true ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
        ))}

        {orphanCategories.map((aCategory: Category) => (
          <ListItem button key={aCategory.name} onClick={handleNavigate}>
            <ListItemIcon>{aCategory.icon}</ListItemIcon>
            <ListItemText primary={aCategory.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default SideBar;
