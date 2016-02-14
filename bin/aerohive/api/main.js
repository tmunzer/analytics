

module.exports.configuration = {
    location: require(appRoot + "/bin/aerohive/api/configuration/location")
};

module.exports.monitor = {
    device: require(appRoot + "/bin/aerohive/api/monitor/device")
};

module.exports.clientlocation = {
    clienttimeseries: require(appRoot + "/bin/aerohive/api/clientlocation/clienttimeseries"),
    clientcount: require(appRoot + "/bin/aerohive/api/clientlocation/clientcount"),
    clientcountWithEE: require(appRoot + "/bin/aerohive/api/clientlocation/clientcount").withEE
};