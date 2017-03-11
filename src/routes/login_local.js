var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/login/', function (req, res, next) {
    if (req.session.passport) res.redirect('/dashboard/');
    else res.render('login_local', {title: 'Admin Login'});

});
/* Handle Login POST */
router.post('/login',
    passport.authenticate('login', {
        successRedirect: '/dashboard/',
        failureRedirect: '/login/',
        failureFlash: true
    })
);
/* Handle Logout */
router.get('/logout/', function (req, res) {
    if (req.session.passport) console.info("info:","User " + req.session.passport.user.email+ " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/');
});
module.exports = router;