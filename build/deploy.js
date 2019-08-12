const path = require("path");
const host = require("../.host.json");
const FtpDeploy = require("ftp-deploy"); require
const ftpDeploy = new FtpDeploy();

var parentDir = path.normalize(__dirname + "/..");

var config = {
    user: host.username,
    password: host.password,
    host: host.host,
    port: host.port,
    localRoot: parentDir,
    remoteRoot: host.directory,

    // include: ['*', '**/*'],      // this would upload everything except dot files
    include: ["**/*"],

    // e.g. exclude sourcemaps, and ALL files in node_modules (including dot files)
    exclude: [".*", "package*", "*.md", "dist/**/*.map", "node_modules/**", "build/**"],

    // delete ALL existing files at destination before uploading, if true
    deleteRemote: true,

};

ftpDeploy
    .deploy(config)
    .then(res => console.log("finished:", res))
    .catch(err => console.log(err));
