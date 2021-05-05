import { JSDOM } from 'jsdom-canvas-2';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

import { configure } from 'enzyme'

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
global.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  })
}
copyProps(window, global)

configure({adapter: new Adapter()})