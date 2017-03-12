var api = require("./../../req");

/**
 * Exposes the Location Folder Hierarchy that a customer uses to associate non-geographic location information with an Access Point/Device.
 * @param {Object} xapi - API credentials
 * @param {String} xapi.vpcUrl - ACS server to request
 * @param {String} xapi.ownerId - ACS ownerId
 * @param {String} xapi.accessToken - ACS accessToken
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectURL - Aerohive Developper Account redirectURL
 *  */
module.exports.GET = function (xapi, devAccount, callback) {
    var path = "/xapi/v1/configuration/apLocationFolders?ownerId=" + xapi.ownerId;
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