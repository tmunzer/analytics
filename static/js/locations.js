function displayRoot(id, name) {
    return '<li style="padding-left: 12px;" onclick="changeLocation(\'' + id + '\', \'' + name + '\')">' +
        '<div class="text">' + name + "</div>" +
        "</li>";
}

function displayFolder(id, name) {
    return '<li style="padding-left: 22px;" onclick="changeLocation(\'' + id + '\', \'' + name + '\')">' +
        '<div class="text">' +
        '<i class="plan-leftnav fa fa-map-marker fa-lg"></i>' +
        '<span>' + name + '</span>' +
        '</div>' +
        '</li>';
}

function displayBuilding(id, name) {
    return '<li style="padding-left: 32px;" onclick="changeLocation(\'' + id + '\', \'' + name + '\')">' +
        '<div class="text">' +
        '<i class="plan-leftnav fa fa-building fa-lg"></i>' +
        '<span>' + name + '</span>' +
        '</div>' +
        '</li>';
}

function displayFloor(id, name){
    return '<li style="padding-left: 42px;" onclick="changeLocation(\'' + id + '\', \'' + name + '\')">' +
        '<div class="text">' +
        '<i class="plan-leftnav fa fa-map fa-lg"></i>' +
        '<span>' + name + '</span>' +
        '</div>' +
        '</li>';
}
function displayTree(folder){
    var htmlString ='';
    var id, name, folderType, address, uniqueName, root;
    if (folder == null) {
        folder = locations;
        root = true
    }
    for (var key in folder) {
        switch (key) {
            case "id":
                id = folder[key];
                break;
            case "name":
                name = folder[key];
                break;
            case "folderType":
                folderType = folder[key];
                break;
            case "address":
                address = folder[key];
                break;
            case "uniqueName":
                uniqueName = folder[key];
                break;
            case "folders":
                if (root == true) htmlString += displayRoot(id, name);
                else {
                    switch (folderType) {
                        case "GENERIC":
                            htmlString += displayFolder(id, name);
                            break;
                        case "BUILDING":
                            htmlString += displayBuilding(id, name);
                            break;
                        case "FLOOR":
                            htmlString += displayFloor(id, name);
                            break;
                    }
                }
                if (folder[key] != []) {
                    for (var newKey in folder[key]) htmlString += displayTree(folder[key][newKey], id);
                }
        }
    }
    if (root){
        $('#span-location').html(name);
        $("#aria-location").html(htmlString);
        locationAnalytics = id;
    } else return htmlString;
}

function getLocations() {
    $.ajax({
        method: "POST",
        url: "/api/configuration/apLocationFolders/",
        data: {}
    })
        .done(function (data){
            locations = data;
            displayTree();
        });
}



function changeLocation(locationID, locationName){
    $('#span-location').html(locationName);
    locationAnalytics = locationID;
}
