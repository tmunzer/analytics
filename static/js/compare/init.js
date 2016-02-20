function init(){
    filterFolder = "None";
    var data = {};
    $.ajax({
        method: "POST",
        url: "/dashboard/api/init/",
        data: data
    })
        .done(function (data) {
            if (data.error){
                displayModal("API", data.error);
                $("#maps-folders").html("<i class='fa fa-close'></i>");
                $("#maps-buildings").html("<i class='fa fa-close'></i>");
                $("#maps-floors").html("<i class='fa fa-close'></i>");
                $("#devices-sensors").html("<i class='fa fa-close'></i>");
                $("#devices-connected").html("<i class='fa fa-close'></i>");
                $("#devices-all").html("<i class='fa fa-close'></i>");
            } else {
                $("#maps-folders").html(data.locationsCount.folder);
                $("#maps-buildings").html(data.locationsCount.building);
                $("#maps-floors").html(data.locationsCount.floor);
                $("#devices-sensors").html(data.devicesCount.sensor);
                $("#devices-connected").html(data.devicesCount.connected);
                $("#devices-all").html(data.devicesCount.count);
                locations = data.locations;

                displayTree();
                updateTimeline();
            }
        });
}

