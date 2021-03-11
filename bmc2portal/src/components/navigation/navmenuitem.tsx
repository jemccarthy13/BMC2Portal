import {Accordion, AccordionDetails, AccordionSummary, Button, Link, SvgIcon, Typography} from '@material-ui/core';
import {ExpandMore} from '@material-ui/icons';
import React, {ReactElement} from 'react';

import '../../css/sidebar.css';

import Category from "./Category";

/**
 * This Component contains the logic for Navigation Pane menus and menu items.
 *
 * A NavMenuItem has props:
 * - "id": the text of the top-level menu item
 * - "icon": (optional) the icon of the menu item
 * - "link": (optional) which 'page' the top-level menu item takes you to
 * - "children": (optional) An array of subcategories
 */

export default class NavMenuItem extends React.PureComponent<Category> {

	// If this menu item has a link, navigate to that link when it is clicked
	handleNavigate = (): void => {
		const {link} = this.props

		if (link) {
			window.location.href = link;
		}
	}


	// main component render
	render(): ReactElement {

		const elements: ReactElement[] = [];
		const {name, icon, link, children} = this.props

		return (

			<div>


				{/* /!*If the element has children, it needs to expand an accordion rather than hyperlinking*!/*/}
				<Accordion>
					{/*Head Element for Accordion*/}
					<AccordionSummary expandIcon={<ExpandMore/>}>
						<Typography>{name}</Typography>
					</AccordionSummary>

				</Accordion>

				{/*	/!*What the Accordion Expands to*!/*/}
				{/*	<AccordionDetails>*/}
				{/*		{children?.map(child =>*/}
				{/*			(<Button key={child.name} variant="contained" startIcon={child.icon}>*/}
				{/*				<Link onClick={this.handleNavigate}>*/}
				{/*					{child.name}*/}
				{/*				</Link>*/}
				{/*			</Button>))*/}
				{/*		}*/}
				{/*	</AccordionDetails>*/}
				{/*</Accordion>*/}

			{/*	<button type="button" onClick={this.handleNavigate}>*/}
        {/*  {name}*/}
        {/*</button>*/}
        {/*{children &&*/}
        {/*    <div className="subnav-content">*/}
        {/*        {children.forEach((item : Category) => {*/}
        {/*            elements.push(<div key={item.id}><a href={item.link}>{item.id}</a></div>)*/}
        {/*        }*/}
        {/*        )}*/}
        {/*        {elements}*/}
        {/*    </div>*/}
        {/*} *!/*/}
			</div>
		)
	}
}