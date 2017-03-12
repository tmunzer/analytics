var api = require("./../../req");

/**
 * Allows one to retrieve a Location Folder node anywhere within the hierarchy.
 * @param {Object} xapi - API credentials
 * @param {String} xapi.vpcUrl - ACS server to request
 * @param {String} xapi.ownerId - ACS ownerId
 * @param {String} xapi.accessToken - ACS accessToken
 * @param {String} ssidProfileId - The ID of the desired SSID
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectURL - Aerohive Developper Account redirectURL
 *  */
module.exports.GET = function (xapi, devAccount, ssidProfileId, callback) {
    var path = "/beta/configuration/ssids/" + ssidProfileId + "/psk?ownerId=" + xapi.ownerId;
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

/**
 * Updates information about the configured Pre-shared Key or Private Pre-shared Key for the specified SSID.
 * @param {Object} xapi - API credentials
 * @param {String} xapi.vpcUrl - ACS server to request
 * @param {String} xapi.ownerId - ACS ownerId
 * @param {String} xapi.accessToken - ACS accessToken
 * @param {String} ssidProfileId - The ID of the desired SSID
 * @param {Object} changes - The PSK or PPSK configuration changes to be applied to this SSID and network policy.
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectURL - Aerohive Developper Account redirectURL
 *  */
module.exports.PUT = function (xapi, devAccount, ssidProfileId, changes, callback) {
    var path = "/beta/configuration/ssids/" + ssidProfileId + "/psk?ownerId=" + xapi.ownerId;
    api.PUT(xapi, path, changes, devAccount, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};