'use strict';

var https = require('https');
var server = https.createServer(require('./index.js'));
var port = process.argv[2] || 8443;

server.on('request', function (req, res) {
  res.end('[' + req.method + ']' + ' ' + req.url);
});
server.listen(port, function () {
  console.log('Listening', server.address());
  console.log('<https://localhost.daplie.com:' + server.address().port + '/>');
});
