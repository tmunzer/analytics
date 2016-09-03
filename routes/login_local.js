var express = require('express');
var router = express.Router();
var passport = require('passport');

var apiToken = require('./../config').aerohive;
/* GET home page. */
router.get('/login/', function (req, res, next) {
    if (req.session.hasOwnProperty("passport")) res.redirect('/dashboard/');
    else res.render('login', {title: 'Admin Login'});

});
/* Handle Login POST */
router.post('/login',
    passport.authenticate('login', {
        successRedirect: '/dashboard/',
        failureRedirect: '/login/',
        failureFlash: true
    }, function (req, res) {
        req.session.xapi = {
            owners: [],
            ownerIndex: 0,
            rejectUnauthorized: true,
        };
        req.session.xapi.owners.push({
            vhmId: "N/A",
            ownerId: apiToken.ownerId,
            vpcUrl: apiToken.vpcUrl,
            accessToken: apiToken.accessToken
        });
        res.json();
    })
);
/* Handle Logout */
router.get('/logout/', function (req, res) {
    if (req.session.hasOwnProperty('passport')) console.log("User " + req.session.passport.user.email+ " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/');
});
module.exports = router;