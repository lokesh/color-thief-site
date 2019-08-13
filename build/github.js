const fs = require('fs');
const fetch = require("node-fetch");

fetch('https://api.github.com/repos/lokesh/color-thief')
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      const data = JSON.stringify(result);
      fs.writeFileSync('../js/github.json', data);
    });

