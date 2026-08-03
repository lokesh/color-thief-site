// Hero demo: click a source image, get its palette and its semantic swatches.
//
// Two rows, both built the same way — a row of tiles that wipe open left to
// right, height only, never travelling sideways. The palette row's tiles are
// weighted by each color's share of the image; the swatch row's are equal.
//
// Tiles are absolutely positioned and driven by a spring per axis (x, y, width,
// height) on a single rAF loop rather than by CSS transitions, so a resize can
// retarget mid-flight and each tile settles on its own terms.

import { getPaletteSync, getSwatchesSync } from 'colorthief';

const imageModules = import.meta.glob('../images/*.jpg', { eager: true, query: '?url', import: 'default' });

// Hand-picked rather than globbed in order; the last tile in the row is the
// drop target.
const imageUrls = ['../images/image-1.jpg', '../images/image-5.jpg', '../images/image-7.jpg']
  .map((path) => imageModules[path])
  .filter(Boolean);

const COLORS = 5;

// What "#AABBCC  12%" and a bare "#AABBCC" need at 11px mono, plus the label's
// left padding. Narrower than the smaller of these and the segment goes
// unlabelled — the hover chip still has the hex.
const LABEL_MIN_PX = 108;
const HEX_ONLY_MIN_PX = 64;

// The "Dominant" tag rides alongside the hex and percentage, so it needs more
// room again than the label on its own.
const DOMINANT_MIN_PX = 210;

// Narrower than roughly twice its corner radius and a tile stops reading as a
// swatch and starts reading as a rendering artifact.
const MIN_TILE_PX = 18;

// Same order the swatches demo uses further down the page. getSwatchesSync
// doesn't always fill all six — an image with no dark saturated region returns
// no DarkVibrant — so the row tiles however many came back.
const SWATCH_ROLES = ['Vibrant', 'Muted', 'DarkVibrant', 'DarkMuted', 'LightVibrant', 'LightMuted'];

// Below this the row can't give "DarkVibrant" enough width to print, so the
// chips wrap into a two-column grid instead of shrinking further.
const CHIP_ONE_ROW_MIN_PX = 560;
const CHIP_COLUMNS_NARROW = 2;
const CHIP_GAP = 4;

// Gaps are carved out of each tile's own width, so a row still starts and ends
// flush with the content column.
const PALETTE_GAP = 4;

// Damping ratio ζ = DAMPING / 2√(STIFFNESS·MASS) ≈ 0.63. The longest survivor
// move overshoots by ~9px and settles in ~0.9s: a real bounce, but a single one
// at the end of a trip that never changes direction before it. DAMPING 27 is
// critically damped (no bounce at all); 15 overshoots ~17px, which starts to
// read as a second move.
const STIFFNESS = 180;
const DAMPING = 17;
const MASS = 1;

// Below a fifth of a pixel of both offset and speed, nothing is on screen any
// more — snap and let the loop stop.
const REST_EPSILON = 0.2;

// A long frame (backgrounded tab, GC pause) would otherwise integrate the
// spring into instability.
const MAX_STEP = 1 / 30;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ─── Springs ────────────────────────────────────────────────────────

function axis(value = 0) {
  return { value, target: value, velocity: 0, delay: 0 };
}

function retarget(a, target, delay = 0) {
  a.target = target;
  a.delay = delay;
}

function settle(a, value) {
  a.value = value;
  a.target = value;
  a.velocity = 0;
  a.delay = 0;
}

// Returns true while the axis still has somewhere to be.
function step(a, dt) {
  if (a.delay > 0) {
    a.delay -= dt;
    return true;
  }
  const offset = a.value - a.target;
  if (Math.abs(offset) < REST_EPSILON && Math.abs(a.velocity) < REST_EPSILON) {
    if (a.value === a.target && a.velocity === 0) return false;
    a.value = a.target;
    a.velocity = 0;
    return true; // one last frame to paint the settled value
  }
  a.velocity += ((-STIFFNESS * offset) - (DAMPING * a.velocity)) / MASS * dt;
  a.value += a.velocity * dt;
  return true;
}

// getPaletteSync's proportions describe the quantizer's boxes, not the five
// colors it handed back, so they don't sum to 1 on their own.
function shares(palette) {
  const total = palette.reduce((sum, c) => sum + (c.proportion || 0), 0);
  return palette.map(c => (total > 0 ? c.proportion / total : 1 / palette.length));
}

// Whole percentages that sum to exactly 100, by largest remainder. Rounding
// each share on its own gives rows that print 61+16+12+5+7 = 101, and the
// widths then disagree with the numbers sitting on top of them.
function wholePercents(fractions) {
  const scaled = fractions.map(f => f * 100);
  const out = scaled.map(Math.floor);
  let left = 100 - out.reduce((sum, n) => sum + n, 0);

  scaled
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => { if (left > 0) { out[i]++; left--; } });

  return out;
}

// The palette as it will actually be shown: whole percentages, and no color so
// small it rounds away to nothing. A 0% entry can only render as a hairline,
// which reads as a glitch rather than as data — drop it and hand its share back
// to the colors that survive.
function summarize(palette) {
  let colors = palette;
  let percents = wholePercents(shares(colors));

  while (colors.length > 1 && percents.some(p => p === 0)) {
    colors = colors.filter((_, i) => percents[i] > 0);
    percents = wholePercents(shares(colors));
  }

  return { colors, percents };
}

// ─── Rendering ──────────────────────────────────────────────────────

function waitForImage(img) {
  return new Promise((resolve, reject) => {
    if (img.complete && img.naturalWidth) resolve(img);
    else {
      img.addEventListener('load', () => resolve(img), { once: true });
      img.addEventListener('error', reject, { once: true });
    }
  });
}

export default function initHero() {
  const root = document.getElementById('hero-demo');
  if (!root || imageUrls.length === 0) return;

  const chart = document.getElementById('hero-palette');
  const swatchRow = document.getElementById('hero-swatches');
  const thumbRow = document.getElementById('hero-thumbs');

  // Both rows animate through the same spring machinery, so their states share
  // a shape and `bar` is just "the element this state drives".
  function sprung(el, className, labelClass) {
    el.className = className;
    const label = document.createElement('span');
    label.className = labelClass;
    el.appendChild(label);
    // y only ever moves for the wrapped swatch grid; the palette row leaves it
    // at 0 and pays nothing for it.
    return { bar: el, label, x: axis(), y: axis(), w: axis(), h: axis() };
  }

  const bars = Array.from({ length: COLORS }, () => {
    const state = sprung(document.createElement('div'), 'hero-swatch', 'hero-swatch-label');
    chart.appendChild(state.bar);
    return state;
  });

  const chips = SWATCH_ROLES.map(() => {
    const state = sprung(document.createElement('div'), 'hero-chip', 'hero-chip-label');
    swatchRow.appendChild(state.bar);
    return state;
  });

  const urls = imageUrls;
  let timers = [];
  let run = 0;

  // What each row is currently aiming at. Kept around so a resize can recompute
  // the same arrangement against the new width.
  let scene = null;
  let chipScene = null;
  let frame = null;
  let lastFrameTime = 0;

  // ─── The loop ─────────────────────────────────────────────────────

  function draw({ bar, x, y, w, h }) {
    bar.style.transform = `translate(${x.value.toFixed(2)}px, ${y.value.toFixed(2)}px)`;
    bar.style.width = `${Math.max(0, w.value).toFixed(2)}px`;
    bar.style.height = `${Math.max(0, h.value).toFixed(2)}px`;
  }

  function tick(now) {
    const dt = Math.min(MAX_STEP, (now - lastFrameTime) / 1000) || 1 / 60;
    lastFrameTime = now;

    let moving = false;
    for (const state of [...bars, ...chips]) {
      // Bitwise-or would short-circuit the later axes; step() must run on all.
      const active = [step(state.x, dt), step(state.y, dt), step(state.w, dt), step(state.h, dt)];
      if (active.some(Boolean)) {
        moving = true;
        draw(state);
      }
    }

    frame = moving ? requestAnimationFrame(tick) : null;
  }

  function start() {
    if (frame !== null) return;
    lastFrameTime = performance.now();
    frame = requestAnimationFrame(tick);
  }

  // ─── Arrangements ─────────────────────────────────────────────────

  function place(states, spec, container, snap) {
    if (!spec) return;
    const width = Math.max(1, container.clientWidth);
    // Lets a scene size its own container before it lays anything out — the
    // swatch grid's row count, and so its height, depends on the width.
    spec.fit?.(width);
    const height = Math.max(1, container.clientHeight);

    states.forEach((state, i) => {
      const target = spec.at(i, width, height);
      const apply = snap ? settle : retarget;
      apply(state.x, target.x, snap ? undefined : target.delay);
      apply(state.y, target.y ?? 0, snap ? undefined : target.delay);
      apply(state.w, target.w, snap ? undefined : target.delay);
      apply(state.h, target.h, snap ? undefined : target.delay);
      if (snap) draw(state);
    });
  }

  function arrange(snap = false) {
    place(bars, scene, chart, snap);
    place(chips, chipScene, swatchRow, snap);
    if (!snap && (scene || chipScene)) start();
  }

  // Tile widths straight from the whole percentages, so the bar is the
  // proportions rather than merely reporting them. The one adjustment: a tile
  // is never allowed below MIN_TILE_PX, because narrower than its own corner
  // radius it stops reading as a swatch. Those few pixels come off the widest
  // tile, where a 2% error is invisible.
  function paletteWidths(percents, width) {
    const usable = Math.max(1, width - (percents.length - 1) * PALETTE_GAP);
    const raw = percents.map(p => (p / 100) * usable);
    const widest = raw.indexOf(Math.max(...raw));

    let borrowed = 0;
    const out = raw.map((w, i) => {
      if (i === widest || w >= MIN_TILE_PX) return w;
      borrowed += MIN_TILE_PX - w;
      return MIN_TILE_PX;
    });
    out[widest] = Math.max(MIN_TILE_PX, out[widest] - borrowed);
    return out;
  }

  // Both the seed position and the target, so a tile never travels.
  function paletteSlot(i, width, percents) {
    const widths = paletteWidths(percents, width);
    let x = 0;
    for (let n = 0; n < i; n++) x += widths[n] + PALETTE_GAP;
    return { x, w: widths[i] };
  }

  function showPalette({ colors: palette, percents }, snap) {
    const width = Math.max(1, chart.clientWidth);

    // getColorSync() returns exactly the highest-share entry of getPalette(),
    // so the dominant color is already the widest swatch — it just needs
    // saying. No second extraction pass.
    const dominant = percents.indexOf(Math.max(...percents));

    bars.forEach((state, i) => {
      const { bar, label } = state;
      const color = palette[i];

      // An image with only a couple of distinct colors comes back with a
      // palette shorter than COLORS — the spare tiles just stay shut.
      if (!color) {
        bar.style.opacity = '0';
        bar.classList.remove('has-label');
        bar.removeAttribute('data-hex');
        bar.removeAttribute('data-copy-hint');
        label.textContent = '';
        settle(state.h, 0);
        draw(state);
        return;
      }

      const hex = color.hex();
      const percent = percents[i];

      // Seeded flat in its final slot; only height animates.
      const slot = paletteSlot(i, width, percents);
      settle(state.x, slot.x);
      settle(state.y, 0);
      settle(state.w, slot.w);
      settle(state.h, 0);
      draw(state);

      bar.style.background = hex;
      bar.style.opacity = '1';
      bar.dataset.hex = hex;
      bar.dataset.copyHint = i === dominant
        ? `${percent}% · dominant`
        : `${percent}%`;

      bar.classList.remove('has-label');
      label.textContent = '';
      label.style.color = color.textColor;

      // Measured off the tile it has to fit inside, not off the share — the
      // two differ once a small tile has been widened to the minimum.
      const segment = slot.w;
      if (segment >= HEX_ONLY_MIN_PX) {
        bar.classList.add('has-label');
        label.append(segment >= LABEL_MIN_PX
          ? `${hex.toUpperCase()}  ${percent}%`
          : hex.toUpperCase());

        if (i === dominant && segment >= DOMINANT_MIN_PX) {
          const tag = document.createElement('b');
          tag.className = 'hero-swatch-tag';
          tag.textContent = 'Dominant';
          label.append(tag);
        }
      }
    });

    scene = {
      // Quick left-to-right wipe, same gesture as the swatch row below.
      at: (i, w, h) => (i >= percents.length
        ? { x: bars[i].x.value, y: 0, w: bars[i].w.value, h: 0, delay: 0 }
        : { ...paletteSlot(i, w, percents), y: 0, h, delay: i * 0.045 }),
    };
    arrange(snap);
  }

  function hidePalette(snap) {
    bars.forEach(({ bar }) => { bar.style.opacity = '0'; });
    scene = { at: i => ({ x: bars[i].x.value, y: 0, w: bars[i].w.value, h: 0, delay: 0 }) };
    arrange(snap);
  }

  // One chip's height, and how the grid divides at a given width. Read off the
  // rendered row rather than hardcoded, so the CSS stays the source of truth.
  function chipMetrics(width, count) {
    const height = parseFloat(getComputedStyle(swatchRow).getPropertyValue('--hero-chip-height')) || 46;
    const columns = width >= CHIP_ONE_ROW_MIN_PX ? count : Math.min(CHIP_COLUMNS_NARROW, count);
    return { height, columns, rows: Math.ceil(count / columns) };
  }

  // Where chip i belongs in the grid. Chips never travel — they open in place,
  // so this is both the seed position and the target.
  function chipSlot(i, width, count) {
    const { height, columns } = chipMetrics(width, count);
    const column = i % columns;
    const slot = width / columns;
    return {
      x: column * slot,
      y: Math.floor(i / columns) * (height + CHIP_GAP),
      // Only the rightmost column reaches the far edge, so it's the one that
      // doesn't give up a gap.
      w: Math.max(0, slot - (column === columns - 1 ? 0 : CHIP_GAP)),
      h: height,
    };
  }

  function showSwatches(map, snap) {
    const present = SWATCH_ROLES.map(role => ({ role, swatch: map[role] })).filter(x => x.swatch);
    const width = Math.max(1, swatchRow.clientWidth);

    chips.forEach((state, i) => {
      const item = present[i];
      if (!item) {
        state.bar.style.opacity = '0';
        settle(state.h, 0);
        draw(state);
        return;
      }

      const { role, swatch } = item;
      const hex = swatch.color.hex();

      // Seeded flat in its final slot: the only thing that animates is height,
      // staggered left to right. Chips used to fly in from the palette swatch
      // they were nearest, which nobody can read as lineage — six things
      // crossing paths at different distances just looks chaotic.
      const slot = chipSlot(i, width, present.length);
      settle(state.x, slot.x);
      settle(state.y, slot.y);
      settle(state.w, slot.w);
      settle(state.h, 0);
      draw(state);

      state.bar.style.background = hex;
      state.bar.style.opacity = '1';
      state.bar.dataset.hex = hex;
      state.bar.dataset.copyHint = role;
      state.label.style.color = swatch.titleTextColor.hex();
      state.label.textContent = role;
    });

    chipScene = {
      // The row count follows from the width, so the container has to be
      // resized before anything is positioned inside it.
      fit: (w) => {
        const { height, rows } = chipMetrics(w, present.length);
        swatchRow.style.height = `${rows * height + (rows - 1) * CHIP_GAP}px`;
      },
      at: (i, w) => {
        const state = chips[i];
        if (i >= present.length) {
          return { x: state.x.value, y: state.y.value, w: state.w.value, h: 0, delay: 0 };
        }
        // Quick left-to-right wipe — the whole row is open in about a third of
        // a second.
        return { ...chipSlot(i, w, present.length), delay: i * 0.035 };
      },
    };
    arrange(snap);
  }

  // Pulls the row back in without sliding it sideways first.
  function hideSwatches(snap) {
    chips.forEach(({ bar }) => { bar.style.opacity = '0'; });
    chipScene = {
      at: i => ({ x: chips[i].x.value, y: chips[i].y.value, w: chips[i].w.value, h: 0, delay: 0 }),
    };
    arrange(snap);
  }

  window.addEventListener('resize', () => arrange(true));

  async function sweep(index) {
    timers.forEach(clearTimeout);
    timers = [];
    const token = ++run;

    // Opens up the two output rows. Has to happen before anything measures
    // them — they're display:none until now, so their clientWidth would
    // read 0.
    root.classList.remove('is-idle');

    Array.from(thumbRow.children).forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
      thumb.setAttribute('aria-pressed', String(i === index));
    });

    // Each pill is spent by its own thumbnail: the ones on tiles not yet
    // tried stay up as an invitation.
    thumbRow.children[index]?.querySelector('.hero-thumb-cta')?.remove();

    const src = sourceAt(index);
    if (!src) return;

    const img = new Image();
    // A blob: URL is already same-origin; asking for CORS on one makes some
    // browsers refuse the load outright.
    if (!src.startsWith('blob:')) img.crossOrigin = 'anonymous';
    img.src = src;

    let palette, swatchMap;
    try {
      await waitForImage(img);
      if (token !== run) return;
      palette = getPaletteSync(img, { colorCount: COLORS });
      swatchMap = getSwatchesSync(img);
    } catch {
      // A hero that can't read its own image just stays quiet.
      root.hidden = true;
      return;
    }
    if (!palette || token !== run) return;

    const summary = summarize(palette);

    if (reduceMotion.matches) {
      showPalette(summary, true);
      showSwatches(swatchMap || {}, true);
      return;
    }

    // Switching images pulls both rows shut first, so the new palette opens
    // from nothing instead of cross-fading over the old one.
    const replay = scene !== null;
    if (replay) {
      hidePalette();
      hideSwatches();
    }

    timers = [
      setTimeout(() => showPalette(summary), replay ? 260 : 0),
      // Held until the palette has finished opening, so the two rows read as
      // one gesture rather than overlapping.
      setTimeout(() => showSwatches(swatchMap || {}), replay ? 700 : 440),
    ];
  }

  // ─── Sources ──────────────────────────────────────────────────────

  thumbRow.innerHTML = urls.map((url, i) => `
    <button type="button" class="hero-thumb" aria-pressed="false" aria-label="Extract colors from example image ${i + 1}">
      <img src="${url}" alt="">
      <span class="hero-thumb-cta"><span class="hero-cta-pointer">Click me</span><span class="hero-cta-touch">Tap me</span></span>
    </button>
  `).join('') + `
    <button type="button" class="hero-thumb hero-drop" aria-pressed="false" aria-label="Extract colors from your own image">
      <img alt="">
      <span class="hero-drop-prompt">
        <span class="hero-drop-wide">Drop an image<span class="hero-drop-sub">or click to browse</span></span>
        <span class="hero-drop-narrow">Pick a photo<span class="hero-drop-sub">from your library</span></span>
      </span>
      <span class="hero-drop-error">Images only</span>
    </button>`;

  const dropTile = thumbRow.querySelector('.hero-drop');
  const dropIndex = urls.length;

  // Lives outside the tile so the picker's synthetic click can't re-open it.
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.hidden = true;
  root.appendChild(fileInput);

  let uploadedUrl = null;
  let errorTimer = null;

  function sourceAt(index) {
    return index < urls.length ? urls[index] : uploadedUrl;
  }

  function rejectFile() {
    dropTile.classList.add('is-invalid');
    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => dropTile.classList.remove('is-invalid'), 2200);
  }

  function useFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return rejectFile();

    // The previous upload's blob is about to become unreachable.
    if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
    uploadedUrl = URL.createObjectURL(file);

    dropTile.classList.remove('is-invalid');
    dropTile.classList.add('has-image');
    dropTile.querySelector('img').src = uploadedUrl;
    sweep(dropIndex);
  }

  thumbRow.addEventListener('click', (e) => {
    const thumb = e.target.closest('.hero-thumb');
    if (!thumb) return;
    // The drop tile is always the file picker — its result is already on
    // screen, so there's nothing to re-run.
    if (thumb === dropTile) fileInput.click();
    else sweep(Array.from(thumbRow.children).indexOf(thumb));
  });

  fileInput.addEventListener('change', () => {
    useFile(fileInput.files[0]);
    fileInput.value = ''; // so the same file can be picked twice
  });

  // The whole demo is the drop target, not just the tile — the tile is the
  // affordance, but a 174px miss shouldn't cost you the drop.
  root.addEventListener('dragenter', (e) => {
    e.preventDefault();
    root.classList.add('is-dragging');
  });
  root.addEventListener('dragover', e => e.preventDefault());
  root.addEventListener('dragleave', (e) => {
    if (!root.contains(e.relatedTarget)) root.classList.remove('is-dragging');
  });
  root.addEventListener('drop', (e) => {
    e.preventDefault();
    root.classList.remove('is-dragging');
    useFile(e.dataTransfer?.files[0]);
  });

  // Without this, a drop that misses the hero makes the browser navigate away
  // to the image file — which now costs the reader the whole page.
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => e.preventDefault());

  // Nothing runs until the reader asks for it: the hero opens as plain images
  // with "Click me" pills on them, and the extraction is the payoff.
  root.classList.add('is-idle');
}
