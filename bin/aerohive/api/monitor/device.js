var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.deviceList = function (xapi, callback) {

    var path = '/xapi/v1/monitor/devices?ownerId=' + xapi.ownerId;

    // send the API request
    api.GET(xapi, path, function (err, result) {
        if (err){
            callback(err, result);
        }
        else if (result){
            callback(null, result);
        } else {
            callback(null, []);
        }

    })
};