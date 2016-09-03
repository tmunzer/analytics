var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.GET = function (xapi, location, startTime, endTime, callback) {
    var path = "/xapi/v1/clientlocation/clientcount?" +
        "ownerId=" + xapi.ownerId +
        "&location=" + location +
        "&startTime=" + startTime +
        "&endTime=" + endTime;
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


module.exports.GETwithEE = function (xapi, location, startTime, endTime, eventListener, reqId) {
    var path = "/xapi/v1/clientlocation/clientcount?" +
        "ownerId=" + xapi.ownerId +
        "&location=" + location +
        "&startTime=" + startTime +
        "&endTime=" + endTime;
    api.GET(xapi, path, function (err, result) {
        eventEmitter.emit(eventListener, reqId, location, err, result);
    })
};