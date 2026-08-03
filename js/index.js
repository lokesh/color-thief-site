import initVersionToggle from './version-toggle.js';
import initV3Demos from './demo-v3.js';
import initNavSpy from './links.js';
import initCopy from './copy.js';
import './prism.min.js';

document.addEventListener("DOMContentLoaded", () => {
  initVersionToggle();
  initV3Demos();
  initNavSpy();
  initCopy();
});
