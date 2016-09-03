var api = require("./../req");


module.exports.getCredentials = function (xapi, devAccount, credentialType, userGroup, memberOf, adUser, creator, loginName, firstName, lastName, phone, email, page, pageSize, callback) {
    var path = "/xapi/v1/identity/credentials?ownerId=" + xapi.ownerId;
    if (credentialType && credentialType!="") path += '&credentialType=' + credentialType;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;
    if (creator && creator!="") path += '&creator=' + creator;
    if (loginName && loginName!="") path += '&loginName=' + loginName;
    if (firstName && firstName!="") path += '&firstName=' + firstName;
    if (lastName && lastName!="") path += '&lastName=' + lastName;
    if (phone && phone!="") path += '&phone=' + phone;
    if (email && email!="") path += '&email=' + email;
    if (userGroup && userGroup!="") path += '&userGroup=' + userGroup;
    if (page && page!="") path += '&page=' + page;
    if (pageSize && pageSize!="") path += '&pageSize=' + pageSize;
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

module.exports.createCredential = function (xapi, devAccount, memberOf, adUser, hmCredentialsRequestVo, callback) {
    var path = "/xapi/v1/identity/credentials?ownerId=" + xapi.ownerId;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;

    for (var key in hmCredentialsRequestVo) {
        if (hmCredentialsRequestVo[key] === '') delete hmCredentialsRequestVo[key];
    }
    api.POST(xapi, path, hmCredentialsRequestVo, devAccount, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

module.exports.deleteCredential = function (xapi, devAccount, memberOf, adUser, ids, callback) {
    var path = "/xapi/v1/identity/credentials?ownerId=" + xapi.ownerId;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;
    if (ids && ids != "") path += '&ids=' + ids;
    api.DELETE(xapi, path, devAccount, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

module.exports.deliverCredential = function (xapi, devAccount, memberOf, adUser, hmCredentialDeliveryInfoVo, callback) {
    var path = "/xapi/v1/identity/credentials/deliver?ownerId=" + xapi.ownerId;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;

    for (var key in hmCredentialDeliveryInfoVo) {
        if (hmCredentialDeliveryInfoVo[key] === '') delete hmCredentialDeliveryInfoVo[key];
    }
    api.POST(xapi, path, hmCredentialDeliveryInfoVo, devAccount, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

module.exports.renewCredential = function (xapi, devAccount, credentialId, memberOf, adUser, callback) {
    var path ="/xapi/v1/identity/credentials/" + credentialId + "/renew?ownerId=" + xapi.ownerId;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;
    api.PUT(xapi, path, devAccount, function(err, result){
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

module.exports.updateCredential = function (xapi, devAccount, credentialId, memberOf, adUser, hmCredentialUpdateVo, callback) {
    var path ="/xapi/v1/identity/credentials/" + credentialId + "?ownerId=" + xapi.ownerId;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;

    for (var key in hmCredentialUpdateVo) {
        if (hmCredentialUpdateVo[key] === '') delete hmCredentialUpdateVo[key];
    }
    api.PUT(xapi, path, hmCredentialUpdateVo, devAccount, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};