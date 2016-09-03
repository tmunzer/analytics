var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.GET = function (xapi, ssidProfileId, callback) {
    var path = "/beta/configuration/ssids/" + ssidProfileId + "/psk?ownerId=" + xapi.ownerId;
    api.GET(xapi, path, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

module.exports.PUT = function (xapi, ssidProfileId, changes, callback) {
    var path = "/beta/configuration/ssids/" + ssidProfileId + "/psk?ownerId=" + xapi.ownerId;
    api.PUT(xapi, path, changes, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};