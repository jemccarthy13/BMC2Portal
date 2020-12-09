import React, { ReactElement } from "react";
import NavMenuItem from "./navmenuitem";

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

import CssBaseline from '@material-ui/core/CssBaseline';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

import "../../css/sidebar.css";
import { Hyperlink } from "../utils/interfaces";

const drawerWidth = 200;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },

    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(3),
    },
  }),
);


const fdMenuItems: Hyperlink[] = [
  { text: "First Link", link: "/" },
  { text: "Second Link", link: "/" },
  { text: "AR Tracks", link: "/common/artracks.html" },
  { text: "E-3 Orbits", link: "/common/orbits.html" },
  { text: "Debrief", link: "/common/debrief.html" },
];

const mcMenuItems: Hyperlink[] = [
  { text: "ParrotSour", link: "/msncrew/parrotsour.html" },
  { text: "Airspaces", link: "/msncrew/airspacelist.html" },
  { text: "Fighter Units", link: "/msncrew/unitlist.html" },
  { text: "LOAs", link: "/msncrew/loalist.html" },
  { text: "AR Tracks", link: "/common/artracks.html" },
  { text: "E-3 Orbits", link: "/common/orbits.html" },
  { text: "Debrief", link: "/common/debrief.html" },
];

const categories = [
  {
    id: 'Flight Deck',
    children: [
      { id: 'First Link', icon: <InboxIcon />, active: true },
      { id: 'First Link', icon: <InboxIcon /> },
      { id: 'AR Tracks', icon: <InboxIcon /> },
      { id: 'E-3 Orbits', icon: <InboxIcon /> },
      { id: 'Debrief', icon: <InboxIcon /> },
      { id: 'ML Kit', icon: <InboxIcon /> },
    ],
  },
  {
    id: 'Quality',
    children: [
      { id: 'Analytics', icon: <InboxIcon /> },
      { id: 'Performance', icon: <InboxIcon /> },
      { id: 'Test Lab', icon: <InboxIcon /> },
    ],
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
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {/* Basic Style */}
      {/*<CssBaseline />*/}

      {/* <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Training Portal
          </Typography>
        </Toolbar>
      </AppBar> */}

      <Drawer 
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <div className={classes.toolbar} />

        <List>
          {categories.map((item, index) => (
            <ListItem button key={item.id}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={item.id} />
            </ListItem>
          ))}
        </List>

        <List>
          {['Test5', 'Test6', 'Test7'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </div>



    //<div className="navbar">
    //  <NavMenuItem text="Flight Deck" menuItems={fdMenuItems} />
    //  <NavMenuItem text="Mission Crew" menuItems={mcMenuItems} />
    //  <NavMenuItem text="Lessons Learned" link = "/common/lessons.html" />
    //  <NavMenuItem text="FAA Map" link="/common/faamap.html"/>
    //  <NavMenuItem text="Links & Resources" link = "/resources.html" />
    //  <NavMenuItem text="Contact" link = "/contact.html" />
    //</div>
  );
}

export default SideBar