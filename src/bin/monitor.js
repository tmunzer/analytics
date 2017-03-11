#!/usr/bin/env node
var respawn = require('respawn');

var monitor = respawn(['node', 'www'], {
    env: {ENV_VAR:'test'}, // set env vars
    cwd: '.',              // set cwd
    maxRestarts:100,        // how many restarts are allowed within 60s
    sleep:1000            // time to sleep between restarts
});
monitor.on('spawn', function () {
    console.info("\x1b[32minfo\x1b[0m:",'application monitor started...');
});

monitor.on('exit', function (code, signal) {
    console.error("\x1b[31mEXIT\x1b[0m:", 'process exited, code: ' + code + ' signal: ' + signal);
});

monitor.on('stdout', function (data) {
    console.info("\x1b[32minfo\x1b[0m:",data.toString());
});

monitor.on('stderr', function (data) {
    console.error("\x1b[31mERROR\x1b[0m:", 'process error: '+ data.toString());
});

monitor.start(); // spawn and watch