
var path = require('path');

var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.use('/bower_components', express.static('../bower_components'));

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

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));


var loginMethod = require('./config').login;
if (loginMethod) {
  if (loginMethod == "local") {
    //===============MONGODB=================
    var mongoose = require('mongoose');
    global.db = mongoose.connection;

    db.on('error', function (err) {
      if (err) throw err;
      else console.log("Connected to Database container!");
    });
    mongoose.connect('mongodb://tac-mongo/tac');
    //===============PASSPORR=================
    var passport = require('passport');
    app.use(passport.initialize());
    app.use(passport.session());

    // Using the flash middleware provided by connect-flash to store messages in session
    // and displaying in templates
    var flash = require('connect-flash');
    app.use(flash());

    // Initialize Passport
    var initPassport = require('./passport/init');
    initPassport(passport);
    var login = require('./routes/login_local')
  }
} else {
  var login = require('./routes/login_api');
}
var oauth = require('./routes/oauth');
var api = require('./routes/api');
var apiDashboard = require('./routes/api.dashboard');
var apiDetails = require('./routes/api.details');
var compare = require('./routes/compare');
var webApp = require("./routes/web-app");

app.use('/', login);
app.use('/oauth/', oauth);
app.use('/api/', api);
app.use('/api/dashboard/', apiDashboard);
app.use('/api/details/', apiDetails);
app.use('/compare/', compare);
app.use('/web-app', webApp);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.redirect("/web-app/");
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
