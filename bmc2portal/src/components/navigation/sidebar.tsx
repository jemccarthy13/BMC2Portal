import React, {ReactElement} from "react";

import {Accordion, AccordionDetails, AccordionSummary, Button, Drawer, Link, Typography} from '@material-ui/core';

import {BusinessCenter, ExpandMore, FlightTakeoff, Help, Inbox} from '@material-ui/icons';

import Category from "./Category";

const categories: Category[] = [
	{
		id: "Flight Deck",
		icon: <FlightTakeoff/>,
		children: [
			{id: "First Link", icon: <Help/>},
			{id: "Second Link", icon: <Help/>},
			{id: "AR Tracks", icon: <Inbox/>, link: "/common/artracks.html"},
			{id: "E-3 Orbits", icon: <Inbox/>, link: "/common/orbits.html"},
			{id: "Debrief", icon: <BusinessCenter/>, link: "/common/debrief.html"}
		],
	},
	{
		id: 'Mission Crew',
		icon: <FlightTakeoff/>,
		children: [
			{id: "ParrotSour", icon: <Inbox/>, link: "/msncrew/parrotsour.html"},
			{id: "Air Spaces", icon: <Inbox/>, link: "/msncrew/airspacelist.html"},
			{id: "Fighter Units", icon: <Inbox/>, link: "/msncrew/unitlist.html"},
			{id: "LOAs", icon: <Inbox/>, link: "/msncrew/loalist.html"},
			{id: "AR Tracks", icon: <BusinessCenter/>, link: "/common/artracks.html"},
			{id: "E-3 Orbits", icon: <Inbox/>, link: "/common/orbits.html"},
			{id: "Debrief", icon: <BusinessCenter/>, link: "/common/debrief.html"}
		],
	},
	{
		id: 'Lessons Learned',
		icon: <FlightTakeoff/>,
		link: "/common/lessons.html"
	},
	{
		id: 'FAA Map',
		icon: <FlightTakeoff/>,
		link: "/common/faamap.html"
	},
	{
		id: 'Links $ Resources',
		icon: <FlightTakeoff/>,
		link: "/resources.html"
	},
	{
		id: 'Contact',
		icon: <FlightTakeoff/>,
		link: "/contact.html"
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
	return (
		<div>
			<Drawer variant="permanent" anchor="left">
				{categories.filter(aCategory => aCategory.children != undefined)
					.map((aCategory: Category) => (
						<Accordion key={aCategory.id}>
							<AccordionSummary expandIcon={<ExpandMore/>}>
								<Typography>{aCategory.id}</Typography>
							</AccordionSummary>
							<AccordionDetails>
								{aCategory.children?.map(aChild =>
									(<Button key={aChild.id} variant="contained" startIcon={aChild.icon}>
										<Link onClick={() => {
											window.location.href = aChild.link as string;
										}}>
											{aChild.id}
										</Link>
									</Button>))
								}
							</AccordionDetails>
						</Accordion>))
				};
				{categories.filter(aCategory => aCategory.children === undefined)
					.map((aCategory: Category) => (
						<Link
							key={aCategory.id}
							onClick={() => {
								window.location.href = aCategory.link as string;
							}}>
							<Button variant="contained" startIcon={aCategory.icon}/>
						</Link>))
				};
			</Drawer>
		</div>

	);
}

export default SideBar