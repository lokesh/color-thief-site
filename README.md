# Color Thief Site

See the Color Thief site live at [lokeshdhakar.com/projects/color-thief/](http://lokeshdhakar.com/projects/color-thief/).

The Color Thief script repository is located at [https://github.com/lokesh/color-thief](https://github.com/lokesh/color-thief).

by [Lokesh Dhakar](http://www.lokeshdhakar.com)


## Development

- Uses Parcel for the build. 
- Hosted on Netlify. It is proxied to _lokeshdhakar.com/projects/color-thief_ with a Netlify `_redirects` file.
- Uses Prism for syntax highlighting. `prism.min.js` is a custom build which includes the core library and a set of hand-picked plugins.

**Why use Parcel?** Did I need a built tool for this site? The reason I added it was that I wanted to import the colorthief package via npm to test the import. I originally loaded the package directly from `node_modules`, but Netlify removes that folder after build. So at minimum, I needed to move the colorthief package's relevant files out of node_modules. I decided if I was going to add a build step, this would be a good time to try Parcel.

**Would I use it again?** Yes. It mostly works out of the box and is great for smaller projects.

### Parcel configuration
- `index.html` loads `index.js` which pulls in the rest of the JS files.
- Parcel minifies svgs, including stripping out their viewbox attributes. This caused issues with the Github logo and star rendering. I've disabled this the `.htmlnanorc` file.
- Using async/await was throwing errors in the console related to a runtime generator. A quick fix for this was to update the browser list in `package.json` to just support the latest browser.
