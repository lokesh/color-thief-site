import { getColor, getPalette, getColorSync, getPaletteSync, getSwatchesSync, getPaletteProgressive, observe } from 'colorthief';

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

function swatchHTML(color, size = 'md') {
  return `<div class="swatch swatch-${size}" style="background:${color.hex()}" data-hex="${color.hex()}"></div>`;
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
        palette.map(c => swatchHTML(c, 'lg')).join('');
      document.getElementById('palette-timing').textContent = `${ms}ms`;
    }
    show('out-palette');
  });
}

// ─── 03. Color Object ───────────────────────────────────────────────

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

// ─── 04. getSwatchesSync — Semantic Swatches ────────────────────────

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

// ─── 05. OKLCH vs RGB ───────────────────────────────────────────────

function initOklch() {
  const sourceImg = document.getElementById('oklch-source-img');
  if (!sourceImg) return;

  sourceImg.src = imageUrls[2] || imageUrls[0];
  waitForImage(sourceImg).then(() => {
    const rgb = getPaletteSync(sourceImg, { colorCount: 8 });
    const oklch = getPaletteSync(sourceImg, { colorCount: 8, colorSpace: 'oklch' });
    if (rgb) {
      document.getElementById('oklch-rgb').innerHTML = rgb.map(c => swatchHTML(c, 'lg')).join('');
    }
    if (oklch) {
      document.getElementById('oklch-oklch').innerHTML = oklch.map(c => swatchHTML(c, 'lg')).join('');
    }
    show('out-oklch');
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
    rowsEl.innerHTML = quals.map(q => {
      const { result: pal, ms } = timed(() => getPaletteSync(sourceImg, { colorCount: 6, quality: q }));
      return `<div class="quality-row">
        <div class="quality-label">quality: ${q} <span class="timing">${ms}ms</span></div>
        <div class="quality-swatches">${pal ? pal.map(c => swatchHTML(c, 'md')).join('') : ''}</div>
      </div>`;
    }).join('');
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
            <strong style="color:${dominant.hex()}">${dominant.hex()}</strong>
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

// ─── 08. Async API & Web Workers ────────────────────────────────────

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

    // Async + Worker
    const worker = await timedAsync(() => getPalette(sourceImg, { colorCount: 6, worker: true }));
    rows.push({ label: 'Async + Worker', ms: worker.ms, palette: worker.result });

    rowsEl.innerHTML = rows.map(row => `<div class="async-row">
      <div class="async-label"><strong>${row.label}</strong> <span class="timing">${row.ms}ms</span></div>
      <div class="swatch-row">${row.palette ? row.palette.map(c => swatchHTML(c, 'lg')).join('') : ''}</div>
    </div>`).join('');

    show('out-async');
  });
}

// ─── 09. getPaletteProgressive ──────────────────────────────────────

function initProgressive() {
  const sourceImg = document.getElementById('progressive-source-img');
  const passesEl = document.getElementById('progressive-passes');
  const barEl = document.getElementById('progressive-bar');
  if (!sourceImg || !passesEl) return;

  sourceImg.src = imageUrls[2] || imageUrls[0];
  waitForImage(sourceImg).then(async () => {
    const passLabels = ['Rough (16x skip)', 'Medium (4x skip)', 'Final (full quality)'];
    const passResults = [];
    let i = 0;

    for await (const { palette, progress } of getPaletteProgressive(sourceImg, { colorCount: 6 })) {
      const pct = Math.round(progress * 100);
      if (barEl) barEl.style.width = `${pct}%`;
      passResults.push({ label: passLabels[i] || `Pass ${i + 1}`, pct, palette });
      i++;
    }

    passesEl.innerHTML = passResults.map(pass => `<div class="progressive-pass">
      <div class="progressive-pass-header">
        <span class="progressive-pass-label">${pass.label}</span>
        <span class="progressive-pass-pct">${pass.pct}%</span>
      </div>
      <div class="swatch-row">${pass.palette.map(c => swatchHTML(c, 'lg')).join('')}</div>
    </div>`).join('');

    show('out-progressive');
  });
}

// ─── 10. AbortController ────────────────────────────────────────────

function initAbort() {
  const sourceImg = document.getElementById('abort-source-img');
  const errorEl = document.getElementById('abort-error');
  if (!sourceImg || !errorEl) return;

  sourceImg.src = imageUrls[0];
  waitForImage(sourceImg).then(async () => {
    const controller = new AbortController();
    controller.abort();

    try {
      await getColor(sourceImg, { signal: controller.signal });
    } catch (e) {
      errorEl.innerHTML = `<strong>Caught error:</strong>\n${e.name}: ${e.message}`;
    }

    show('out-abort');
  });
}

// ─── 11. Drag and Drop ──────────────────────────────────────────────

function initDragAndDrop() {
  if (!window.FileReader || isMobile()) return;

  const section = document.getElementById('v3-drag-drop');
  if (section) section.style.display = 'block';

  const dropZone = document.getElementById('v3-drop-zone');
  if (!dropZone) return;

  dropZone.addEventListener('dragenter', (e) => { e.preventDefault(); dropZone.classList.add('dragging'); });
  dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('dragging'); });
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
    handleFiles(e.dataTransfer.files);
  });

  function handleFiles(files) {
    const container = document.getElementById('v3-dragged-images');
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.match(/image.*/)) {
        alert('File must be a supported image type.');
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const html = `
          <div class="dropped-result">
            <img class="demo-img dropped-img" src="${event.target.result}" />
            <div class="dominant-result"></div>
            <div class="swatch-row"></div>
          </div>
        `;
        container.insertAdjacentHTML('afterbegin', html);

        const result = container.querySelector('.dropped-result');
        const image = result.querySelector('.dropped-img');

        image.addEventListener('load', () => {
          const color = getColorSync(image);
          const palette = getPaletteSync(image, { colorCount: 8 });

          if (color) {
            const { r, g, b } = color.rgb();
            result.querySelector('.dominant-result').innerHTML =
              swatchHTML(color, 'lg') +
              `<div class="dominant-meta">
                <span class="hex">${color.hex()}</span><br>
                rgb(${r}, ${g}, ${b})
              </div>`;
          }

          if (palette) {
            result.querySelector('.swatch-row').innerHTML =
              palette.map(c => swatchHTML(c, 'lg')).join('');
          }
        }, { once: true });
      };
      reader.readAsDataURL(file);
    }
  }
}

function isMobile() {
  return (/iphone|ipod|ipad|android|ie|blackberry|fennec/).test(navigator.userAgent.toLowerCase());
}

// ─── Init ───────────────────────────────────────────────────────────

export default function initV3Demos() {
  initDominant(imageUrls);
  initPalette();
  initColorObject();
  initSwatches();
  initOklch();
  initQuality();
  initVideoDemo();
  initAsync();
  initProgressive();
  initAbort();
  initDragAndDrop();
}
