// Site-wide click-to-copy: every color swatch, every code block.
//
// Swatches are handled by delegation rather than per-renderer wiring — the demo
// sections rebuild their swatches constantly (the observe demo re-renders every
// 200ms), so listeners attached at render time would need re-attaching forever.

const SWATCH_SELECTOR = [
  '.swatch',
  '.swatch-card',
  '.color-preview-swatch',
  '.observe-dominant-swatch',
  '.proportion-bar-segment',
  '.prop-swatch',
  '.cli-swatch',
  '.hero-swatch',
  '.hero-chip',
].join(',');

// Most swatches already print their hex beside or beneath them, so a hover chip
// would just repeat what's on screen. These are the ones that show nothing —
// bare swatch rows, and proportion segments too narrow for an inline label.
const HOVER_HINT_SELECTOR =
  '.swatch:not([data-hex]):not(.dominant-result *), .proportion-bar-segment, .hero-swatch[data-hex]:not(.has-label), .hero-chip[data-hex]';

// `.cli-output` is illustrative terminal transcript, not something anyone wants
// on their clipboard, so it's excluded.
const CODE_BLOCK_SELECTOR = '.code-block:not(.cli-output), pre';

// ─── Clipboard ──────────────────────────────────────────────────────

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // The async clipboard API needs a secure context; fall back for plain-http.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

// ─── Floating chip (hover preview + copy confirmation) ──────────────

let chipEl = null;
let anchorEl = null;
let chipTimer = null;
let trackId = null;

function chip() {
  if (!chipEl) {
    chipEl = document.createElement('div');
    chipEl.className = 'copy-chip';
    chipEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(chipEl);
  }
  return chipEl;
}

function positionChip() {
  const el = chip();
  const a = anchorEl.getBoundingClientRect();
  const c = el.getBoundingClientRect();
  const left = Math.min(Math.max(8, a.left + a.width / 2 - c.width / 2), window.innerWidth - c.width - 8);
  // Prefer above the swatch; drop below when there's no room at the top.
  const top = a.top - c.height - 6 < 8 ? a.bottom + 6 : a.top - c.height - 6;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

// Keeps the chip glued to its swatch while scrolling, and drops it if the demo
// re-renders the element out from under the cursor.
function track() {
  if (!anchorEl) return;
  if (!anchorEl.isConnected) {
    if (chipEl.classList.contains('copied')) stopTracking();
    else hideChip();
    return;
  }
  positionChip();
  trackId = requestAnimationFrame(track);
}

function stopTracking() {
  cancelAnimationFrame(trackId);
  trackId = null;
}

function showChip(target, text, copied = false) {
  const el = chip();
  // A pending auto-hide from a previous copy would otherwise cut this one short.
  clearTimeout(chipTimer);
  anchorEl = target;
  el.textContent = text;
  el.classList.toggle('copied', copied);
  el.classList.add('visible');
  positionChip();
  stopTracking();
  track();
}

function hideChip() {
  stopTracking();
  clearTimeout(chipTimer);
  anchorEl = null;
  if (chipEl) chipEl.classList.remove('visible', 'copied');
}

// ─── Swatches ───────────────────────────────────────────────────────

function swatchHex(el) {
  if (el.dataset.hex) return el.dataset.hex;
  const match = getComputedStyle(el).backgroundColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return '#' + match.slice(1, 4).map(n => Number(n).toString(16).padStart(2, '0')).join('');
}

function swatchLabel(el) {
  const hex = swatchHex(el);
  if (!hex) return null;
  return el.dataset.copyHint ? `${hex} · ${el.dataset.copyHint}` : hex;
}

function initSwatchCopy() {
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest(HOVER_HINT_SELECTOR);
    if (!el || el === anchorEl) return;
    const label = swatchLabel(el);
    if (label) showChip(el, label);
  });

  document.addEventListener('pointerout', (e) => {
    if (!anchorEl || chipEl?.classList.contains('copied')) return;
    if (e.target.closest(HOVER_HINT_SELECTOR) === anchorEl) hideChip();
  });

  document.addEventListener('click', async (e) => {
    const el = e.target.closest(SWATCH_SELECTOR);
    if (!el) return;
    const hex = swatchHex(el);
    if (!hex) return;

    const ok = await copyText(hex);
    showChip(el, ok ? `Copied ${hex}` : 'Copy failed', ok);
    chipTimer = setTimeout(hideChip, 1200);
  });
}

// ─── Code blocks ────────────────────────────────────────────────────

function codeBlockText(block) {
  const codes = block.querySelectorAll('code');
  const raw = codes.length
    ? Array.from(codes, c => c.textContent).join('\n')
    : block.textContent;
  // Shell samples are written with a leading prompt nobody wants to paste.
  return raw.replace(/^\s*\$ /gm, '').trim();
}

const COPY_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.9572 5.47322C14.7283 3.9968 13.6651 3 12.0629 3H6.86577C5.0565 3 3.91992 4.28509 3.91992 6.10048V12.7954C3.91992 14.4491 4.86518 15.6678 6.41498 15.86"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M17.1354 8.11328H11.94C10.1298 8.11328 8.99414 9.39488 8.99414 11.2094V17.9043C8.99414 19.7188 10.1237 21.0004 11.94 21.0004H17.1345C18.9517 21.0004 20.0812 19.7188 20.0812 17.9043V11.2094C20.0812 9.39488 18.9517 8.11328 17.1354 8.11328Z"></path></svg>`;
const CHECK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>`;
const FAIL_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"></path></svg>`;

function initCodeBlockCopy() {
  document.querySelectorAll(CODE_BLOCK_SELECTOR).forEach((block) => {
    // Code blocks scroll horizontally, so the button can't live inside one —
    // it would slide out of view along with the code. Wrap instead.
    const wrap = document.createElement('div');
    wrap.className = 'code-copy-wrap';
    block.parentNode.insertBefore(wrap, block);
    wrap.appendChild(block);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy-btn';
    btn.innerHTML = COPY_ICON;
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    wrap.appendChild(btn);

    let resetTimer = null;
    btn.addEventListener('click', async () => {
      const ok = await copyText(codeBlockText(block));
      btn.innerHTML = ok ? CHECK_ICON : FAIL_ICON;
      btn.classList.toggle('copied', ok);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        btn.innerHTML = COPY_ICON;
        btn.classList.remove('copied');
      }, 1400);
    });
  });
}

// ─── Init ───────────────────────────────────────────────────────────

export default function initCopy() {
  initSwatchCopy();
  initCodeBlockCopy();
}
