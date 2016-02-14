var apiRequest = require(appRoot + "/bin/aerohive/req").apiRequest;


module.exports.dev = function (apiId, path, callback) {
    apiRequest(apiId, path, function (err, result) {
        if (err){
            callback(err, null);
        } else if (result){
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};