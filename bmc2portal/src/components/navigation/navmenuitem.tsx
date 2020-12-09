import React, { ReactElement } from 'react';

import '../../css/sidebar.css';
import { Hyperlink } from '../utils/interfaces';

interface NMIProps{
  link?: string,
  text: string,
  menuItems?: Hyperlink[]
}

/**
 * This Component contains the logic for Navigation Pane menus and menu items.
 * 
 * A NavMenuItem has props:
 * - "text": the text of the top-level menu item
 * - "link": (optional) which 'page' the top-level menu item takes you to
 * - "menuitems": (optional) An array of submenuitems { text, link }
 */
export default class NavMenuItem extends React.PureComponent<NMIProps, Record<string, unknown>> {

  
  // If this menu item has a link, navigate to that link when it is clicked
  handleNavigate = () : void => {
    const {link} = this.props
    if (link){
      window.location.href = link;
    }
  }

  // main component render
  render(): ReactElement {
    const elems:ReactElement[]= [];
    const {menuItems, text} = this.props
    return (
      <div className="subnav">
        <button type="button" className="subnavbtn" onClick={this.handleNavigate}>{text}</button>
        {menuItems && 
            <div className="subnav-content">
                {menuItems.forEach((itm:Hyperlink) => {
                    elems.push(<div key={itm.text}><a href={itm.link}>{itm.text}</a></div>)
                })}
                {elems}
            </div>
        }
      </div>
    )}
}