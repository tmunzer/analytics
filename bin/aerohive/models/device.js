function Device (apiData) {
    if ( this instanceof Device ) {
        this.deviceId = apiData.deviceId;
        this.ownerId = apiData.ownerId;
        this.macAddress = apiData.macAddress;
        this.connected = apiData.connected;
        this.hostName = apiData.hostName;
        this.serialId = apiData.serialId;
        this.model = apiData.model;
        this.ip = apiData.ip;
        this.mode = apiData.mode;
        this.osVersion = apiData.osVersion;
        this.mgmtStatus = apiData.mgmtStatus;
        this.simType = apiData.simType;
        this.locations = apiData.locations;
        this.presenceOn = apiData.presenceOn;
    } else return new Device(apiData);
}


function countDevices (deviceList, floorFilter){
    var device;
    var result = {
        sensor: 0,
        connected: 0,
        count: 0
    };
    for (var deviceNum in deviceList){
        device = deviceList[deviceNum];
        if (floorFilter == null || floorFilter.length == 0 || floorFilter.indexOf(device.locations) >= 0){
            result.count ++;
            if (device.connected) result.connected ++;
            if (device.presenceOn) result.sensor ++;
        }
    }
    return result;
}

module.exports = Device;
module.exports.countDevices = countDevices;