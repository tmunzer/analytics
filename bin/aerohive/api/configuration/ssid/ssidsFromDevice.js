var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.GET = function (xapi, deviceId, callback) {
    var path = "/beta/configuration/devices/" + deviceId + "/ssids?ownerId=" + xapi.ownerId;
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

module.exports.PUT = function (xapi, deviceId, changes, callback) {
    var path = "/beta/configuration/devices/" + deviceId + "/ssids?ownerId=" + xapi.ownerID;
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