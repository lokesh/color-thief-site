let v2Initialized = false;

export default function initVersionToggle() {
  const v3Btn = document.getElementById('toggle-v3');
  const v2Btn = document.getElementById('toggle-v2');
  const v3Content = document.getElementById('content-v3');
  const v2Content = document.getElementById('content-v2');

  if (!v3Btn || !v2Btn) return;

  function switchTo(version) {
    if (version === 'v2') {
      v3Btn.classList.remove('active');
      v2Btn.classList.add('active');
      v3Content.hidden = true;
      v2Content.hidden = false;

      if (!v2Initialized) {
        v2Initialized = true;
        import('./demo-v2.js').then(m => m.default());
      }
    } else {
      v3Btn.classList.add('active');
      v2Btn.classList.remove('active');
      v3Content.hidden = false;
      v2Content.hidden = true;
    }

    window.dispatchEvent(new CustomEvent('version-switch', { detail: { version } }));
  }

  v3Btn.addEventListener('click', () => {
    history.replaceState(null, '', window.location.pathname);
    switchTo('v3');
  });

  v2Btn.addEventListener('click', () => {
    history.replaceState(null, '', '#v2');
    switchTo('v2');
  });

  // Check URL hash on load
  if (window.location.hash === '#v2') {
    switchTo('v2');
  }
}
