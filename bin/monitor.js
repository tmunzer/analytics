#!/usr/bin/env node
var respawn = require('respawn');

var monitor = respawn(['node', 'www'], {
    env: {ENV_VAR:'test'}, // set env vars
    cwd: '.',              // set cwd
    maxRestarts:100,        // how many restarts are allowed within 60s
    sleep:1000            // time to sleep between restarts
});
monitor.on('spawn', function () {
    console.log('application monitor started...');
});

monitor.on('exit', function (code, signal) {
    console.log('process exited, code: ' + code + ' signal: ' + signal);
});

monitor.on('stdout', function (data) {
    console.log(data.toString());
});

monitor.on('stderr', function (data) {
    console.log('process error: '+ data.toString());
});

monitor.start(); // spawn and watch