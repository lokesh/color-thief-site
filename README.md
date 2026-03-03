# Color Thief Site

See the Color Thief site live at [lokeshdhakar.com/projects/color-thief/](http://lokeshdhakar.com/projects/color-thief/).

The Color Thief script repository is located at [https://github.com/lokesh/color-thief](https://github.com/lokesh/color-thief).

by [Lokesh Dhakar](http://www.lokeshdhakar.com)


## Development

- Uses Vite for the build.
- Deployed via SFTP to Dreamhost, served from the `lokeshdhakar.com/projects/color-thief` folder.
- Uses Prism for syntax highlighting. `prism.min.js` is a custom build which includes the core library and a set of hand-picked plugins.

### Commands

```
npm run dev      # Start local dev server
npm run build    # Production build to dist/
npm run deploy   # Build + SFTP deploy to Dreamhost
```

### Deploy configuration

Copy `.env.example` to `.env` and fill in your Dreamhost SFTP credentials before running `npm run deploy`.

### Vite configuration

- `index.html` is the entry point. Vite bundles `js/index.js` and the CSS files.
- `base` is set to `/projects/color-thief/` in `vite.config.js` to match the live URL path.
- Output goes to `dist/`.

### JS modules (`js/`)

- `index.js` — Entry point, imports and initializes all other modules
- `demo-v3.js` — Core demo functionality for Color Thief v3: renders example images with color extraction output, handles drag-and-drop uploads
- `demo-v2.js` — Demo functionality for Color Thief v2
- `version-toggle.js` — Handles switching between v2/v3 demo views
- `links.js` — Smooth scroll navigation
- `prism.min.js` — Vendored custom Prism.js build for syntax highlighting
