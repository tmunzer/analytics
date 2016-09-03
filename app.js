
var path = require('path');
global.appRoot = path.resolve(__dirname);

var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var login = require('./routes/login');
var oauth = require('./routes/oauth');
var dashboard = require('./routes/dashboard');
var details = require('./routes/details');
var api = require('./routes/api');
var compare = require('./routes/compare');

var events = require('events');
global.eventEmitter = new events.EventEmitter();



var app = express();
app.use('/bower_components', express.static(appRoot + '/bower_components'));

app.use(session({
    secret: 'Aerohive Analytics Ref APP Secret',
    resave: false,
    saveUninitialized: true,
    //defines how long the session will live in milliseconds. After that, the cookie is invalidated and will need to be set again.
    //duration: 1 * 60 * 1000,
    // allows users to lengthen their session by interacting with the site
    //activeDuration: 1 * 60 * 1000,
    //prevents browser JavaScript from accessing cookies.
    httpOnly: true,
    //ensures cookies are only used over HTTPS
    secure: true,
    //deletes the cookie when the browser is closed. Ephemeral cookies are particularly important if you your app lends itself to use on public computers.
    ephemeral: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));

app.use('/', login);
app.use('/oauth/', oauth);
app.use('/dashboard/', dashboard);
app.use('/details/', details);
app.use('/api/', api);
app.use('/compare/', compare);

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
