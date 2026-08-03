import { getColor, getPalette, getColorSync, getPaletteSync, getSwatchesSync, observe } from 'colorthief';

const imageModules = import.meta.glob('../images/*.jpg', { eager: true, query: '?url', import: 'default' });
const imageUrls = Object.values(imageModules);

// ─── Helpers ────────────────────────────────────────────────────────

function waitForImage(img) {
  return new Promise((resolve, reject) => {
    if (img.complete && img.naturalWidth) resolve(img);
    else {
      img.addEventListener('load', () => resolve(img), { once: true });
      img.addEventListener('error', reject, { once: true });
    }
  });
}

function timed(fn) {
  const t0 = performance.now();
  const result = fn();
  return { result, ms: (performance.now() - t0).toFixed(1) };
}

async function timedAsync(fn) {
  const t0 = performance.now();
  const result = await fn();
  return { result, ms: (performance.now() - t0).toFixed(1) };
}

function swatchHTML(color, size = 'md', { showHex = false } = {}) {
  const hexAttr = showHex ? ` data-hex="${color.hex()}"` : '';
  return `<div class="swatch swatch-${size}" style="background:${color.hex()}"${hexAttr}></div>`;
}

function show(id) {
  document.getElementById(id)?.classList.add('visible');
}

function renderColorTable(color, tableId) {
  const { r, g, b } = color.rgb();
  const hsl = color.hsl();
  const oklch = color.oklch();
  const rows = [
    ['.rgb()', `{ r: ${r}, g: ${g}, b: ${b} }`],
    ['.hex()', color.hex()],
    ['.hsl()', `{ h: ${hsl.h}, s: ${hsl.s}, l: ${hsl.l} }`],
    ['.oklch()', `{ l: ${oklch.l.toFixed(3)}, c: ${oklch.c.toFixed(3)}, h: ${oklch.h.toFixed(1)} }`],
    [".css('rgb')", color.css('rgb')],
    [".css('hsl')", color.css('hsl')],
    [".css('oklch')", color.css('oklch')],
    ['.array()', `[${color.array().join(', ')}]`],
    ['.textColor', `<span class="prop-swatch" style="background:${color.textColor}"></span>${color.textColor}`],
    ['.isDark', String(color.isDark)],
    ['.isLight', String(color.isLight)],
    ['.contrast.white', color.contrast.white.toFixed(2)],
    ['.contrast.black', color.contrast.black.toFixed(2)],
    ['.contrast.foreground', `<span class="prop-swatch" style="background:${color.contrast.foreground.hex()}"></span>${color.contrast.foreground.hex()}`],
  ];

  document.getElementById(tableId).innerHTML =
    '<thead><tr><th>Property</th><th>Value</th></tr></thead><tbody>' +
    rows.map(([prop, val]) => `<tr><td>${prop}</td><td>${val}</td></tr>`).join('') +
    '</tbody>';
}

// ─── 01. getColorSync — Dominant Color ──────────────────────────────

function initDominant(images) {
  const grid = document.getElementById('dominant-grid');
  if (!grid) return;

  grid.innerHTML = images.map((img, i) => `
    <div class="dominant-card">
      <img class="demo-img" id="v3-img-${i + 1}" src="${imageUrls[i]}" alt="Example ${i + 1}">
      <div class="dominant-result" id="dom-result-${i + 1}"></div>
    </div>
  `).join('');

  images.forEach((img, i) => {
    const el = document.getElementById(`v3-img-${i + 1}`);
    waitForImage(el).then(() => {
      const { result: color, ms } = timed(() => getColorSync(el));
      if (!color) return;
      const { r, g, b } = color.rgb();
      document.getElementById(`dom-result-${i + 1}`).innerHTML =
        swatchHTML(color, 'lg') +
        `<div class="dominant-meta">
          <span class="hex">${color.hex()}</span><br>
          rgb(${r}, ${g}, ${b})<br>
          <span class="timing">${ms}ms</span>
        </div>`;
    });
  });

  show('out-dominant');
}

// ─── 02. getPaletteSync — Palette ───────────────────────────────────

function initPalette() {
  const sourceImg = document.getElementById('palette-source-img');
  if (!sourceImg) return;

  sourceImg.src = imageUrls[0];
  waitForImage(sourceImg).then(() => {
    const { result: palette, ms } = timed(() => getPaletteSync(sourceImg, { colorCount: 8 }));
    if (palette) {
      document.getElementById('palette-swatches').innerHTML =
        palette.map(c => swatchHTML(c, 'lg', { showHex: true })).join('');
      document.getElementById('palette-timing').textContent = `${ms}ms`;
    }
    show('out-palette');
  });
}

// ─── 03. Color Space (OKLCH vs RGB) ─────────────────────────────────

const COLOR_SPACES = [
  { space: 'oklch', label: "colorSpace: 'oklch'", tag: 'default' },
  { space: 'rgb', label: "colorSpace: 'rgb'", tag: 'v2 algorithm' },
];

function initColorSpace() {
  const sourceImg = document.getElementById('color-space-source-img');
  const compareEl = document.getElementById('colorspace-compare');
  if (!sourceImg || !compareEl) return;

  // A sunset photo — the space where the two algorithms diverge most visibly.
  sourceImg.src = imageUrls[5] || imageUrls[0];
  waitForImage(sourceImg).then(() => {
    compareEl.innerHTML = COLOR_SPACES.map(({ space, label, tag }) => {
      const palette = getPaletteSync(sourceImg, { colorCount: 6, colorSpace: space });
      return `<div class="colorspace-col">
        <div class="colorspace-label">
          <code>${label}</code>
          <span class="colorspace-tag">${tag}</span>
        </div>
        <div class="swatch-row">${palette ? palette.map(c => swatchHTML(c, 'md', { showHex: true })).join('') : ''}</div>
      </div>`;
    }).join('');
    show('out-color-space');
  });
}

// ─── 04. Color Object ───────────────────────────────────────────────

function initColorObject() {
  const sourceImg = document.getElementById('color-obj-source-img');
  if (!sourceImg) return;

  sourceImg.src = imageUrls[0];
  waitForImage(sourceImg).then(() => {
    const color = getColorSync(sourceImg);
    if (color) {
      document.getElementById('color-preview').innerHTML =
        `<div class="color-preview-swatch" style="background:${color.hex()};color:${color.textColor}">Aa</div>
         <div class="color-preview-hex">${color.hex()}</div>`;
      renderColorTable(color, 'prop-table');
    }
    show('out-color-obj');
  });
}

// ─── 05. getSwatchesSync — Semantic Swatches ────────────────────────

function initSwatches() {
  const sourceImg = document.getElementById('swatches-source-img');
  if (!sourceImg) return;

  sourceImg.src = imageUrls[1] || imageUrls[0];
  waitForImage(sourceImg).then(() => {
    const swatches = getSwatchesSync(sourceImg);
    const roles = ['Vibrant', 'Muted', 'DarkVibrant', 'DarkMuted', 'LightVibrant', 'LightMuted'];
    document.getElementById('swatch-cards').innerHTML = roles.map(role => {
      const s = swatches[role];
      if (!s) {
        return `<div class="swatch-card swatch-card-empty"><span class="role">${role}</span></div>`;
      }
      return `<div class="swatch-card" style="background:${s.color.hex()}">
        <span class="role" style="color:${s.titleTextColor.hex()}">${role}</span>
        <span class="hex-label" style="color:${s.bodyTextColor.hex()}">${s.color.hex()}</span>
      </div>`;
    }).join('');
    show('out-swatches');
  });
}

// ─── 06. Quality Settings ───────────────────────────────────────────

function initQuality() {
  const sourceImg = document.getElementById('quality-source-img');
  const rowsEl = document.getElementById('quality-rows');
  if (!sourceImg || !rowsEl) return;

  sourceImg.src = imageUrls[0];
  waitForImage(sourceImg).then(() => {
    const quals = [1, 10, 50];
    rowsEl.innerHTML =
      '<table class="prop-table quality-table"><thead><tr><th>Quality</th><th>Time</th><th>Palette</th></tr></thead><tbody>' +
      quals.map(q => {
        const { result: pal, ms } = timed(() => getPaletteSync(sourceImg, { colorCount: 6, quality: q }));
        return `<tr>
          <td>${q}</td>
          <td>${ms}ms</td>
          <td class="quality-swatches">${pal ? pal.map(c => swatchHTML(c, 'md')).join('') : ''}</td>
        </tr>`;
      }).join('') +
      '</tbody></table>';
    show('out-quality');
  });
}

// ─── 07. observe — Live Video ───────────────────────────────────────

function initVideoDemo() {
  const video = document.getElementById('v3-video');
  const playBtn = document.getElementById('v3-video-play');
  const glowWrap = document.getElementById('v3-video-glow');
  const dominantEl = document.getElementById('observe-dominant');
  const paletteEl = document.getElementById('v3-video-palette');

  if (!video) return;

  let controller = null;

  function startObserving() {
    if (controller) return;
    controller = observe(video, {
      throttle: 200,
      colorCount: 5,
      onChange: (palette) => {
        if (!palette || palette.length === 0) return;
        const dominant = palette[0];

        // Update glow
        glowWrap.style.setProperty('--glow-color', dominant.css());

        // Dominant color display
        dominantEl.innerHTML =
          `<div class="observe-dominant-swatch" style="background:${dominant.hex()}"></div>` +
          `<div class="observe-dominant-meta">
            <strong>${dominant.hex()}</strong>
            <span class="observe-dark-light">${dominant.isDark ? 'Dark' : 'Light'}</span>
          </div>`;

        // Palette strip
        paletteEl.innerHTML = palette.map(c => swatchHTML(c, 'md')).join('');
      },
    });
  }

  function stopObserving() {
    if (controller) {
      controller.stop();
      controller = null;
    }
  }

  function togglePlay() {
    if (video.paused) {
      video.play();
      playBtn.classList.add('hidden');
    } else {
      video.pause();
      playBtn.classList.remove('hidden');
    }
  }

  playBtn.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);
  video.addEventListener('play', startObserving);
  video.addEventListener('pause', stopObserving);
  video.addEventListener('ended', () => {
    stopObserving();
    playBtn.classList.remove('hidden');
  });

  show('out-observe');
}

// ─── 08. Region Extraction ──────────────────────────────────────────

const REGIONS = [
  { label: 'Whole image', region: null },
  { label: 'Center crop', region: { x: 0.25, y: 0.25, width: 0.5, height: 0.5 } },
  { label: 'Bottom third', region: { x: 0, y: 0.66, width: 1, height: 0.34 } },
];

function formatRegion(region) {
  if (!region) return 'no region';
  const { x, y, width, height } = region;
  return `{ x: ${x}, y: ${y}, width: ${width}, height: ${height} }`;
}

function initRegion() {
  const sourceImg = document.getElementById('region-source-img');
  const rowsEl = document.getElementById('region-rows');
  if (!sourceImg || !rowsEl) return;

  sourceImg.src = imageUrls[0];
  waitForImage(sourceImg).then(() => {
    rowsEl.innerHTML = REGIONS.map(({ label, region }) => {
      const palette = getPaletteSync(sourceImg, region ? { colorCount: 6, region } : { colorCount: 6 });
      // The box is positioned in percentages, which is exactly what the
      // normalized 0–1 coords mean — no pixel math needed.
      const box = region
        ? `<div class="region-box" style="left:${region.x * 100}%;top:${region.y * 100}%;width:${region.width * 100}%;height:${region.height * 100}%"></div>`
        : '';
      return `<div class="region-row">
        <div class="region-preview"><img src="${sourceImg.src}" alt="">${box}</div>
        <div class="region-detail">
          <div class="region-label"><strong>${label}</strong> <span class="timing">${formatRegion(region)}</span></div>
          <div class="swatch-row">${palette ? palette.map(c => swatchHTML(c, 'md')).join('') : ''}</div>
        </div>
      </div>`;
    }).join('');
    show('out-region');
  });
}

// ─── 09. Async API ──────────────────────────────────────────────────

function initAsync() {
  const sourceImg = document.getElementById('async-source-img');
  const rowsEl = document.getElementById('async-rows');
  if (!sourceImg || !rowsEl) return;

  sourceImg.src = imageUrls[0];
  waitForImage(sourceImg).then(async () => {
    const rows = [];

    // Sync
    const sync = timed(() => getPaletteSync(sourceImg, { colorCount: 6 }));
    rows.push({ label: 'Sync', ms: sync.ms, palette: sync.result });

    // Async
    const async_ = await timedAsync(() => getPalette(sourceImg, { colorCount: 6 }));
    rows.push({ label: 'Async', ms: async_.ms, palette: async_.result });

    rowsEl.innerHTML = rows.map(row => `<div class="async-row">
      <div class="async-label"><strong>${row.label}</strong> <span class="timing">${row.ms}ms</span></div>
      <div class="swatch-row">${row.palette ? row.palette.map(c => swatchHTML(c, 'lg')).join('') : ''}</div>
    </div>`).join('');

    show('out-async');
  });
}

// ─── 10. Color Proportions ──────────────────────────────────────────

function extractProportionData(imgEl) {
  const palette = getPaletteSync(imgEl, { colorCount: 8 });
  if (!palette) return null;

  const totalProp = palette.reduce((sum, c) => sum + (c.proportion || 0), 0);
  return {
    imgSrc: imgEl.src,
    colors: palette.map(c => ({
      hex: c.hex(),
      textColor: c.textColor,
      proportion: totalProp > 0 ? (c.proportion / totalProp) : (1 / palette.length),
    })),
  };
}

function initProportions() {
  const grid = document.getElementById('proportions-grid');
  if (!grid) return;

  // Load 3 source images
  const urls = imageUrls.slice(0, 3);
  const imgEls = urls.map(url => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    return img;
  });

  Promise.all(imgEls.map(waitForImage)).then(() => {
    const datasets = imgEls.map(extractProportionData).filter(Boolean);
    if (datasets.length === 0) return;

    grid.innerHTML = datasets.map(d =>
      `<div class="proportion-viz-item">${renderProportionBar(d)}</div>`
    ).join('');

    show('out-proportions');
  });
}

function renderProportionBar({ colors, imgSrc }) {
  const segments = colors.map(c => {
    const pct = Math.round(c.proportion * 100);
    const label = c.proportion >= 0.08 ? `<span class="proportion-bar-label" style="color:${c.textColor}">${pct}%</span>` : '';
    // data-copy-hint rather than title: the copy chip already shows the hex on
    // hover, and a native tooltip on top of it would just be noise.
    return `<div class="proportion-bar-segment" style="flex:${c.proportion};background:${c.hex}" data-copy-hint="${pct}%">${label}</div>`;
  }).join('');
  return `<img class="proportion-bar-thumb" src="${imgSrc}" alt="">
    <div class="proportion-bar">${segments}</div>`;
}





// ─── Init ───────────────────────────────────────────────────────────

export default function initV3Demos() {
  initDominant(imageUrls.slice(0, 3));
  initPalette();
  initColorSpace();
  initColorObject();
  initSwatches();
  initQuality();
  initVideoDemo();
  initRegion();
  initAsync();
  initProportions();
}
