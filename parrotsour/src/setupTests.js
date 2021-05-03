import { JSDOM } from 'jsdom';

import Adapter from 'enzyme-adapter-react-16';

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

configure({adapter: new Adapter()})