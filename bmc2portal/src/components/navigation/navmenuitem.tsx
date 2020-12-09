import React, { ReactElement } from 'react';

import '../../css/sidebar.css';
import { Hyperlink } from '../utils/interfaces';

import Category from "./Category";

/**
 * This Component contains the logic for Navigation Pane menus and menu items.
 * 
 * A NavMenuItem has props:
 * - "text": the text of the top-level menu item
 * - "link": (optional) which 'page' the top-level menu item takes you to
 * - "menuitems": (optional) An array of submenuitems { text, link }
 */
export default class NavMenuItem extends React.PureComponent<Category, Record<string, unknown>> {

  // If this menu item has a link, navigate to that link when it is clicked
  handleNavigate = () : void => {
    const {link} = this.props
    if (link){
      window.location.href = link;
    }
  }

  // main component render
  render(): ReactElement {
    const elements : ReactElement[] = [];
    const {children, id} = this.props
    return (
      <div className="subnav">
        <button type="button" className="subnavbtn" onClick={this.handleNavigate}>{id}</button>
        {children &&
            <div className="subnav-content">
                {children.forEach((item : Category) => {
                    elements.push(<div key={item.id}><a href={item.link}>{item.id}</a></div>)
                }
                )}
                {elements}
            </div>
        }
      </div>
    )}
}