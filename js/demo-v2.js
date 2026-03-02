import ColorThief from 'colorthief-v2';

const imageModules = import.meta.glob('../images/*.jpg', { eager: true, query: '?url', import: 'default' });

function renderImageSection(images) {
  return images.map(img => `
    <div class="image-section ${img.class || ''}">
      <div class="image-wrap">
        <button class="run-functions-button">
          <span class="no-touch-label">Click</span>
          <span class="touch-label">Tap</span>
        </button>
        <img class="target-image" src="${img.file}" />
      </div>
      <div class="color-thief-output"></div>
    </div>
  `).join('');
}

function renderColorThiefOutput(data) {
  const paletteSwatches = data.palette.map(c =>
    `<div class="swatch" style="background-color: rgb(${c[0]}, ${c[1]}, ${c[2]})"></div>`
  ).join('');

  return `
    <div class="output-layout">
      <div class="function get-color">
        <h3 class="function-title">Dominant Color</h3>
        <div class="swatches">
          <div class="swatch" style="background-color: rgb(${data.color[0]}, ${data.color[1]}, ${data.color[2]})"></div>
        </div>
        <div class="function-code">
          <code>colorThief.getColor(image):${data.elapsedTimeForGetColor}ms</code>
        </div>
      </div>
      <div class="function get-palette">
        <h3 class="function-title">Palette</h3>
        <div class="function-output">
          <div class="swatches">
            ${paletteSwatches}
          </div>
        </div>
        <div class="function-code">
          <code>colorThief.getPalette(image):${data.elapsedTimeForGetPalette}ms</code>
        </div>
      </div>
    </div>
  `;
}

export default function initV2Demos() {
  const imgArray = Object.values(imageModules).map(url => ({ file: url }));
  const examplesHTML = renderImageSection(imgArray);
  document.getElementById('v2-example-images').innerHTML = examplesHTML;

  const colorThief = new ColorThief();

  // Click handlers for example images
  document.getElementById('v2-example-images').addEventListener('click', (event) => {
    const button = event.target.closest('.run-functions-button');
    if (!button) return;

    button.textContent = '...';
    const imageSection = button.closest('.image-section');
    const image = imageSection.querySelector('.target-image');
    showColorsForImage(image, imageSection);
  });

  function showColorsForImage(image, imageSection) {
    const start = Date.now();
    const color = colorThief.getColor(image);
    const elapsedTimeForGetColor = Date.now() - start;
    const palette = colorThief.getPalette(image);
    const elapsedTimeForGetPalette = Date.now() - start + elapsedTimeForGetColor;

    const outputHTML = renderColorThiefOutput({
      color,
      palette,
      elapsedTimeForGetColor,
      elapsedTimeForGetPalette,
    });

    imageSection.classList.add('with-color-thief-output');
    const btn = imageSection.querySelector('.run-functions-button');
    if (btn) btn.classList.add('hide');

    const outputEl = imageSection.querySelector('.color-thief-output');

    setTimeout(() => {
      outputEl.innerHTML = outputHTML;
      // CSS transition on max-height replaces jQuery slideDown
      outputEl.classList.add('visible');

      // If output is not in viewport, scroll to it
      const rect = outputEl.getBoundingClientRect();
      if (rect.top > window.innerHeight - 250) {
        window.scrollTo({
          top: window.scrollY + rect.top - window.innerHeight + 200,
          behavior: 'smooth',
        });
      }
    }, 300);
  }

  // Drag and drop
  if (window.FileReader && !isMobile()) {
    const dragDropSection = document.getElementById('v2-drag-drop');
    if (dragDropSection) dragDropSection.style.display = 'block';

    const dropZone = document.getElementById('v2-drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragenter', (e) => { e.preventDefault(); dropZone.classList.add('dragging'); });
      dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('dragging'); });
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragging');
        handleFiles(e.dataTransfer.files);
      });
    }
  }

  function handleFiles(files) {
    const draggedImages = document.getElementById('v2-dragged-images');
    const imageType = /image.*/;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.match(imageType)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const html = renderImageSection([{ class: 'dropped-image', file: event.target.result }]);
          draggedImages.insertAdjacentHTML('afterbegin', html);

          const imageSection = draggedImages.querySelector('.image-section');
          const image = imageSection.querySelector('.target-image');

          image.addEventListener('load', () => {
            showColorsForImage(image, imageSection);
          });
        };
        reader.readAsDataURL(file);
      } else {
        alert('File must be a supported image type.');
      }
    }
  }

  function isMobile() {
    return (/iphone|ipod|ipad|android|ie|blackberry|fennec/).test(navigator.userAgent.toLowerCase());
  }
}
