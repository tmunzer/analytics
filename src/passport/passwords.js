var mongoose = require('mongoose');
var bCrypt = require('bcryptjs');


function cryptPassword (password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

var PasswordSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.ObjectId, ref: "User"},
    password: {type: String, required: true, set: cryptPassword},
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

var Password = mongoose.model("Password", PasswordSchema);

// Pre save
PasswordSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});


module.exports = Password;
