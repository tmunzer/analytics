function Location(apiData) {
    if (this instanceof Location) {
        this.id = apiData.id;
        this.name = apiData.name;
        this.folderType = apiData.folderType;
        this.address = apiData.address;
        this.uniqueName = apiData.uniqueName;
        this.folders = [];
        for (var folderNum in apiData.folders) {
            this.folders.push(new Location(apiData.folders[folderNum]));
        }
    } else return new Location(apiData);
}


function getFilteredFloorsId (folder, floorFilter, typeFilter) {
    var folderNum;
    var floorsSelected = [];
    var folderId = (folder.id).toString();
    if (floorFilter == [] || floorFilter.indexOf(folderId) >= 0) {
        if (typeFilter == null || folder.folderType == typeFilter) {
            if (floorsSelected.indexOf(folderId) < 0) floorsSelected.push(folderId);
        }
        for (folderNum in folder.folders) {
            floorFilter.push(folder.folders[folderNum]['id']);
            floorsSelected = floorsSelected.concat(getFilteredFloorsId(folder.folders[folderNum], floorFilter, typeFilter));
        }
    } else {
        for (folderNum in folder.folders) {
            floorsSelected = floorsSelected.concat(getFilteredFloorsId(folder.folders[folderNum], floorFilter, typeFilter));
        }
    }
    return floorsSelected;
}

function countBuildings (folder, floorFilter) {
    var resultChild;
    var result = {
        folder: 0,
        building: 0,
        floor: 0
    };
    if (floorFilter == null || floorFilter.length == 0 || (floorFilter.indexOf(folder.id) >= 0)) {
        if (folder.folderType == "GENERIC") result.folder = 1;
        else if (folder.folderType == "BUILDING") result.building = 1;
        else if (folder.folderType == "FLOOR") result.floor = 1;
    }
    for (var folderNum in folder.folders) {
        resultChild = countBuildings(folder.folders[folderNum], floorFilter);
        result.folder += resultChild.folder;
        result.building += resultChild.building;
        result.floor += resultChild.floor;
    }
    return result;
}

function getLocationName (folder, locationId){
    var name = "";
    var tmpName = "";
    if (folder.id == locationId) {
        name = folder.name;
    }
    else {
        for (var folderNum in folder.folders) {
            tmpName = getLocationName(folder.folders[folderNum], locationId);
            if (tmpName != "") name = tmpName;
        }
    }
    return name;
}

module.exports = Location;
module.exports.getFilteredFloorsId = getFilteredFloorsId;
module.exports.countBuildings = countBuildings;
module.exports.getLocationName = getLocationName;
