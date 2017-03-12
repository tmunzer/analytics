

module.exports.configuration = {
    location: {
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
        getLocations: require("./configuration/location/location").GET
    },
    locationNode: {
        /**
 * Allows one to retrieve a Location Folder node anywhere within the hierarchy.
 * @param {Object} xapi - API credentials
 * @param {String} xapi.vpcUrl - ACS server to request
 * @param {String} xapi.ownerId - ACS ownerId
 * @param {String} xapi.accessToken - ACS accessToken
 * @param {String} folderId - The id of the desired Location folder
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectURL - Aerohive Developper Account redirectURL
 *  */
        getLocation: require("./configuration/location/locationNode").GET
    }
};

module.exports.monitor = {
    device: {
        getDevices: require("./monitor/device").GET
    },
    client: {
        getClients: require("./monitor/client").clientsList,
        clientDetails: require("./monitor/client").clientDetails
    }
};

module.exports.clientlocation = {
    clienttimeseries: {
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
        GET: require("./clientlocation/clienttimeseries").GET,
    },
    clientcount: {
        /**
 * Returns a count of the number of clients seen during the specified time period with a timeUnit of OneHour.
 * @param {Object} xapi - API credentials
 * @param {String} xapi.vpcUrl - ACS server to request
 * @param {String} xapi.ownerId - ACS ownerId
 * @param {String} xapi.accessToken - ACS accessToken
 * @param {String} location - The location that you'd like to check against.
 * @param {String} startTime - The start time of the query (ISO-8601 format).
 * @param {String} endTime - The end time of the query (ISO-8601 format) 
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectURL - Aerohive Developper Account redirectURL
 *  */
        GET: require("./clientlocation/clientcount").GET,
    }
};

module.exports.identity = {
    userGroups: {
        getUserGroups: require("./identity/userGroups").getUserGroups
    },
    credentials: {
        getCredentials: require("./identity/credentials").getCredentials,
        createCredential: require("./identity/credentials").createCredential,
        deleteCredential: require("./identity/credentials").deleteCredential,
        deliverCredential: require("./identity/credentials").deliverCredential,
        renewCredential: require("./identity/credentials").renewCredential,
        updateCredential: require("./identity/credentials").updateCredential
    }
};