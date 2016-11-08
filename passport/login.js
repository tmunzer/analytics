var LocalStrategy = require('passport-local').Strategy;
var User = require("./users");

var appServer = require('./../config').appServer;
module.exports = function (passport) {

    passport.use('login', new LocalStrategy({
        passReqToCallback: true
    },
        function (req, username, password, done) {
            // check in mongo if a user with username exists or not
            User.newLogin(username, password, function (err, user) {
                if (err || !user) {
                    console.log("User " + username + ': Wrong login or password');
                    return done(null, false, req.flash("message", "Wrong login or password"));
                } else {
                    console.log("User " + user.email + " is now logged in");
                    req.session.xapi = {
                        owners: [],
                        ownerIndex: 0,
                        rejectUnauthorized: true,
                    };
                    req.session.xapi.owners.push({
                        vhmId: "N/A",
                        ownerId: appServer.ownerId,
                        vpcUrl: appServer.vpcUrl,
                        accessToken: appServer.accessToken
                    });
                    return done(null, user);
                }
            });
            // User and password both match, return user from done method
            // which will be treated like success

        }
    ));

};