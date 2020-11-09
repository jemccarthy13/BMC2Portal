import React, { ReactElement } from 'react';

import ImagePane from './utils/imagepane'

/**
 * The Home Component is the default comonent to render on main entry Route
 */
export default class Home extends React.PureComponent {

  render(): ReactElement {
    return (
      <ImagePane imageSrc="./icon/552trans.png" />
    )}
}