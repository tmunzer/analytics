var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.GET = function (xapi, callback) {
    var path = "/beta/configuration/ssids?ownerId="+xapi.ownerId;
    api.GET(xapi, path, function (err, result) {
        if (err){
            callback(err, null);
        } else if (result){
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};