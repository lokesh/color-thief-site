const path = require("path");
const host = require("./.host.json");
const SFTPUpload = require('sftp-upload');

const distDir = path.normalize(__dirname + "/dist/");

const config = {
    host: host.host,
    username: host.username,
    password: host.password,
    port: host.port,
    path: distDir,
    remoteDir: host.directory,

    // include: ['*', '**/*'],      // this would upload everything except dot files
    // include: ["**/*"],

    // e.g. exclude sourcemaps, and ALL files in node_modules (including dot files)
    // exclude: [".*", "package*", "*.md", "dist/**/*.map", "node_modules/**", "build/**"],

    // delete ALL existing files at destination before uploading, if true
    // deleteRemote: true,
};

sftp = new SFTPUpload(config);
    sftp.on('error', function(err) {
        throw err;
    })
    .on('uploading', function(progress) {
        console.log(`${progress.percent}% ${progress.file}`);
    })
    .on('completed', function() {
        console.log('Upload Completed');
    })
    .upload();
