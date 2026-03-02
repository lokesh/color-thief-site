import initVersionToggle from './version-toggle.js';
import initV3Demos from './demo-v3.js';
import initScrollLinks from './links.js';
import './prism.min.js';

document.addEventListener("DOMContentLoaded", () => {
  initVersionToggle();
  initV3Demos();
  initScrollLinks();
});
