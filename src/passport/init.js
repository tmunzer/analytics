var login = require('./login');
var User = require('./users');

module.exports = function(passport){

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        //console.log('serializing user: ');
        //console.log(user);
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        User.findById(user._id, function(err, user) {
            //console.log('deserializing user:',user);
            done(err, user);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);

};