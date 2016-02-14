function updateCards() {
    var data = {};
        if (locationAnalytics.length > 0) data = {locations: JSON.stringify(locationAnalytics)};
    $.ajax({
        method: "POST",
        url: "/dashboard/api/update/cards/",
        data: data
    })
        .done(function (data) {
            if (data.error) {
                $("#maps-folders").html("<i class='fa fa-close'></i>");
                $("#maps-buildings").html("<i class='fa fa-close'></i>");
                $("#maps-floors").html("<i class='fa fa-close'></i>");
                $("#devices-sensors").html("<i class='fa fa-close'></i>");
                $("#devices-connected").html("<i class='fa fa-close'></i>");
                $("#devices-all").html("<i class='fa fa-close'></i>");
            } else {
                console.log(data);
                $("#maps-folders").html(data.locationsCount.folder);
                $("#maps-buildings").html(data.locationsCount.building);
                $("#maps-floors").html(data.locationsCount.floor);
                $("#devices-sensors").html(data.devicesCount.sensor);
                $("#devices-connected").html(data.devicesCount.connected);
                $("#devices-all").html(data.devicesCount.count);
            }
        });
}

function updateDashboard() {
    updateCards();
    updateTimeline();
}