var mongoose = require('mongoose');
var bCrypt = require('bcryptjs');
var Password = require("./passwords");
var application = "analytics";

function cryptPassword (password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function capitalize (val){
    if (typeof val !== 'string') val = '';
    return val.charAt(0).toUpperCase() + val.substring(1);
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var UserSchema = new mongoose.Schema({
    name: {
        first: {type: String, set: capitalize, trim: true, default: ""},
        last: {type: String, set: capitalize, trim: true, default: ""}
    },
    email: {type: String, required: true, unique: true, validator: validateEmail},
    enabled: { type: Boolean, default: true },
    admin: { type: Boolean, default: false },
    authorizations: [{
        application: { type: String, required: true },
        authorized: {type: Boolean, required: true, default: false}
    }],
    lastLogin: Date,
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

var User = mongoose.model('User', UserSchema);

User.newLogin = function(email, password, callback){
    this.findOne({email: email})
        .exec(function(err, user){
        if (err) callback(err, null);
        else if (!user) callback(null, false);
        else if (!user.enabled) callback(null, false);  
        else {
            user.authorizations.forEach(function (authorization) {
                if (authorization.application == application) {
                    if (user.admin || authorization.application.authorized) {
                        Password.findOne({ user: user }, function (err, userPassword) {
                            if (err) callback(err, null);
                            else if (bCrypt.compareSync(password, userPassword.password)) {
                                user.lastLogin = new Date();
                                user.save();
                                callback(null, user);
                            }
                            else callback(null, false);
                        })
                    } else callback(null, false);
                }
            })
            
        }
    })
};

User.findByEmail = function(email, callback){
    this.findOne({email: email}, callback);
};
User.findById = function(id, callback){
    this.findOne({_id: id}, callback);
};

// Pre save
UserSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = User;