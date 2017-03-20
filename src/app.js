
var path = require('path');
var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.use('/bower_components', express.static('../bower_components'));

var mongoConfig = require('./config').mongoConfig;
app.use(session({
  secret: 'HVkYpby3JwREkI5xdHDtVSRIzEnN',
  resave: true,
  store: new MongoDBStore({
    uri: 'mongodb://' + mongoConfig.host + '/express-session',
    collection: 'analytics'
  }),
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('\x1b[32minfo\x1b[0m: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]', {
  skip: function (req, res) { return res.statusCode < 400 && req.url != "/" && req.originalUrl.indexOf("/api") < 0}
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var loginMethod = require('./config').login;
if (loginMethod) {
  if (loginMethod == "local") {
    //===============MONGODB=================
    var mongoose = require('mongoose');
    global.db = mongoose.connection;

    db.on('error', function (err) {
      if (err) throw err;
      else console.info("\x1b[32minfo\x1b[0m:","Connected to Database container!");
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

//load routes
var oauth = require('./routes/oauth');
var api = require('./routes/api');
var apiDashboard = require('./routes/api.dashboard');
var apiDetails = require('./routes/api.details');
var apiCompare = require('./routes/api.compare');
var webApp = require("./routes/web-app");

//assign routes to entry points
app.use('/', login);
app.use('/oauth/', oauth);
app.use('/api/', api);
app.use('/api/dashboard/', apiDashboard);
app.use('/api/details/', apiDetails);
app.use('/api/compare/', apiCompare);
app.use('/web-app', webApp);

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
  if (err.status == 404) err.message = "The requested url "+req.originalUrl+" was not found on this server.";
  res.status(err.status || 500);
  res.render('error', {
    status: err.status,
    message: err.message,
    error: {}
  });
});



module.exports = app;
