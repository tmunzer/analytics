var apiRequest = require(appRoot + "/bin/aerohive/api/req").apiRequest;


module.exports = function (vpcUrl, accessToken, ownerID, location, startTime, endTime, timeUnit, callback) {
    var path = "/xapi/v1/clientlocation/clienttimeseries?" +
        "ownerId=" + ownerID +
        "&location=" + location +
        "&startTime=" + startTime +
        "&endTime=" + endTime +
        "&timeUnit=" + timeUnit;
    apiRequest(vpcUrl, accessToken, path, function (err, result) {
        if (err){
            callback(err, null);
        } else if (result){
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};