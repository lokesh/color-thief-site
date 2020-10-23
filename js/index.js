import initDemos from './demo.js';
import initScrollLinks from './links.js';
import { getStarCount } from './github.js';
import { trackPageView } from './google-analytics.js';
import prism from './prism.min.js';

function toggleStars(count) {
  if (count) {
    document.querySelector('.gh-count-number').innerText = count;
  } else {
    document.querySelector('.gh-count').style.display = 'none';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initDemos();
  initScrollLinks();

  getStarCount('lokesh', 'color-thief')
    .then(data => {
      toggleStars(data);
    })
    .catch(err => {
      toggleStars(false);
    })

    trackPageView();
});

