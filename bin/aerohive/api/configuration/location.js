var apiRequest = require(appRoot + "/bin/aerohive/api/req").apiRequest;
var Location = require(appRoot + "/bin/aerohive/models/location");


module.exports = function (vpcUrl, accessToken, ownerID, callback) {
    var path = "/xapi/v1/configuration/apLocationFolders?ownerId="+ownerID;
    apiRequest(vpcUrl, accessToken, path, function (err, result) {
        if (err){
            callback(err, null);
        } else if (result){
            console.log(result);
            var location = new Location(result.data);
            console.log(location);
            callback(null, location);
        } else {
            callback(null, null);
        }
    })
};