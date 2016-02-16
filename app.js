'use strict';
//===============CREATE ROOT PATH=================
var path = require('path');
global.appRoot = path.resolve(__dirname);

//===============DEPENDENCIES=================
var http = require('http');
var https = require('https');
var LEX = require('letsencrypt-express').testing();
var LE = require('letsencrypt');
var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//===============ROUTES DEPENDENCIES=================
var routes = require('./routes/init');
var dashboard = require('./routes/dashboard');
var details = require('./routes/details');
var api = require('./routes/api');

//===============EVENT EMITTER=================
var events = require('events');
global.eventEmitter = new events.EventEmitter();

//===============CREATE APP=================
var app = express();

//=============CREATE LOGGER===============
var winston = require('winston');
winston.emitErrs = true;
var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: __dirname + '/logs/all-logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports.logger = logger;
module.exports.logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

logger.debug("Overriding 'Express' logger");
app.use(require('morgan')("default", { "stream": logger.stream }));

//===============SESSION=================
app.use(session({
    secret: 'Aerohive Analytics Ref APP',
    resave: false,
    saveUninitialized: true
}));

//===============CONF APP=================
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));

//===============ROUTES=================
app.use('/', routes);
app.use('/dashboard/', dashboard);
app.use('/details/', details);
app.use('/api/', api);
app.get('/fail', function (req, res, next) {
  setTimeout(function () {
    var nu = null;
    nu.access();

    res.send('Hello World');
  }, 1000);
});

//===============ERRORS=================
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

var lex = LEX.create({

     lifetime: 90 * 24 * 60 * 60 * 1000    // expect certificates to last 90 days
    , failedWait: 5 * 60 * 1000             // if registering fails wait 5 minutes before trying again
    , renewWithin: 3 * 24 * 60 * 60 * 1000  // renew at least 3 days before expiration
    , memorizeFor: 1 * 24 * 60 * 60 * 1000  // keep certificates in memory for 1 day

    , approveRegistration: function (hostname, cb) {
        cb(null, {
            domains: [hostname]
            , email: 'tmunzer@aerohive.com'
            , agreeTos: true
        });
    }

    , handleRenewFailure: function (err, hostname, certInfo) {
        console.error("ERROR: Failed to renew domain '", hostname, "':");
        if (err) {
            console.error(err.stack || err);
        }
        if (certInfo) {
            console.error(certInfo);
        }
    }

    , letsencrypt: LE.create(
        // options
        { configDir: './letsencrypt.config'
            , manual: true

            , server: LE.productionServerUrl
            , privkeyPath: LE.privkeyPath
            , fullchainPath: LE.fullchainPath
            , certPath: LE.certPath
            , chainPath: LE.chainPath
            , renewalPath: LE.renewalPath
            , accountsDir: LE.accountsDir

            , debug: true
        }

        // handlers
        , { setChallenge: LEX.setChallenge
            , removeChallenge: LEX.removeChallenge
        }
    )

    , debug: false
});

http.createServer(LEX.createAcmeResponder(lex, function (req, res) {
    res.setHeader('Location', 'https://' + req.headers.host + req.url);
    res.end('<!-- Hello Mr Developer! Please use HTTPS instead -->');
}));

https.createServer(lex.httpsOptions, LEX.createAcmeResponder(lex, function (req, res) {
    res.end('Hello!');
}));