var api = require("./../req");

/**
 * Allows one to query the collection of user groups given query parameters as input
 * @param {Object} xapi - API credentials
 * @param {String} xapi.vpcUrl - ACS server to request
 * @param {String} xapi.ownerId - ACS ownerId
 * @param {String} xapi.accessToken - ACS accessToken
 * @param {String} memberOf - employee group of which credential is a member
 * @param {String} adUser - active directory user
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectURL - Aerohive Developper Account redirectURL
 *  */
module.exports.getUserGroups = function (xapi, devAccount, memberOf, adUser, callback) {
    var path = "/xapi/v1/identity/userGroups?ownerId=" + xapi.ownerId;
    if (memberOf) path += '&memberOf=' + memberOf;
    if (adUser) path += '&adUser=' + adUser;
    api.GET(xapi, path, devAccount, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};