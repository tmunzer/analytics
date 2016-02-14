function displayTree(folder, parent) {
    var subtree = '';
    var extendString = '';
    var htmlString = '';
    var id, name, root, folderType;
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
            case "folders":
                switch (folderType) {
                    case "FLOOR":
                        extendString = '';
                        break;
                    default:
                        extendString = '<span class="ui-filter-extextend-location-blue J-pa-hook" id="span-'+id+'" onclick="displaySubTree(\''+id+'\')"></span>';
                        for (var newKey in folder[key]) subtree += displayTree(folder[key][newKey], id);
                        break;
                }
                break;
        }
    }
    htmlString +=
        '<li style="position:relative;"  class="location" data-parent-id="'+parent+'">' +
        extendString +
        '<label class="checkbox ml10" style="margin: 0 0 0 10px;">' +
        '<input class="filter-loca-checked '+parent+'" type="checkbox" onclick="selectLocation(\''+id+'\')" ' +
        'id="checkbox-' + id + '" data-parent-id="'+parent+'" data-id="' + id + '" data-folder-type="'+folderType+'"' +
        'style="margin: 0;"/>' +
        '<span class="lbl fn-ellipsis" style="width: 80%;">' + name + '</span>' +
        '</label>' +
        '<ul style="margin-bottom: 0;">' +
        subtree +
        '</ul>' +
        '</li>';
    if (root) {
        $("#location-tree").html(htmlString);
    } else return htmlString;
}

function selectLocation(locationId){
    var checked = $("#checkbox-"+locationId).prop('checked');
    changeChilds(locationId, checked);
    if (!checked) uncheckParents(locationId);
    updateLocationAnalytics();
    updateDashboard();
}

function changeChilds(locationId, checked){
    var id;
    $(":checkbox."+locationId).each(function(){
        $(this).prop('checked', checked);
        id = $(this).data("id");
        changeChilds(id, checked);
    });
}

function uncheckParents(locationId){
    var parentId = $("#checkbox-"+locationId).data("parent-id");
    if (parentId) {
        $('#checkbox-'+parentId).prop('checked', false);
        uncheckParents(parentId)
    }
}

function displaySubTree(locationId){
    var clicked = $('#span-'+locationId);
    if (clicked.hasClass("ui-filter-extextend-location-blue-cur")){
        clicked.removeClass("ui-filter-extextend-location-blue-cur");
        $("li [data-parent='"+locationId+"']").show();
    } else {
        clicked.addClass("ui-filter-extextend-location-blue-cur");
        $("li [data-parent='"+locationId+"']").hide();
    }
}


function updateLocationAnalytics(folder){
    var folderId;
    if (folder == null) {
        folder = locations;
        locationAnalytics = [];
    }
    folderId = folder['id'];
    if ($("#checkbox-"+folderId).prop("checked")) locationAnalytics.push(folderId);
    else {
        for (var subFolderNum in folder['folders']){
            var subFolder = folder['folders'][subFolderNum];
            updateLocationAnalytics(subFolder);
        }
    }
}