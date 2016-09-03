var api = require("./../req");

/**
 * Returns a list of distinct clients during the specified time period broken down by the specified time unit.
 * @param {Object} xapi - API credentials
 * @param {String} xapi.vpcUrl - ACS server to request
 * @param {String} xapi.ownerId - ACS ownerId
 * @param {String} xapi.accessToken - ACS accessToken
 * @param {String} location - The location that you'd like to check against.
 * @param {String} startTime - The start time of the query (ISO-8601 format).
 * @param {String} endTime - The end time of the query (ISO-8601 format)
 * @param {String} timeUnit - The time unit by which you want to roll up the returned items.
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectURL - Aerohive Developper Account redirectURL
 *  */
module.exports.GET = function (xapi, devAccount, location, startTime, endTime, timeUnit, callback) {
    var path = "/xapi/v1/clientlocation/clienttimeseries?" +
        "ownerId=" + xapi.ownerId +
        "&location=" + location +
        "&startTime=" + startTime +
        "&endTime=" + endTime +
        "&timeUnit=" + timeUnit;
    api.GET(xapi, path, devAccount, function (err, result) {
        if (err){
            callback(err, null);
        } else if (result){
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};
