var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.getLocations = function (xapi, callback) {
    var path = "/xapi/v1/configuration/apLocationFolders?ownerId=" + xapi.ownerId;
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


module.exports.getLocationsFromNode = function (xapi, folderId, callback) {
    var path = "/xapi/v1/configuration/apLocationFolders?ownerId=" + xapi.ownerId;
    if (folderId) path += "folderId=" + folderId;
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