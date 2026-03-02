import initVersionToggle from './version-toggle.js';
import initV3Demos from './demo-v3.js';
import initScrollLinks from './links.js';
import { getStarCount } from './github.js';
import './prism.min.js';

function toggleStars(count) {
  if (count) {
    document.querySelector('.gh-count-number').innerText = count;
  } else {
    document.querySelector('.gh-count').style.display = 'none';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initVersionToggle();
  initV3Demos();
  initScrollLinks();

  getStarCount('lokesh', 'color-thief')
    .then(data => toggleStars(data))
    .catch(() => toggleStars(false));
});
