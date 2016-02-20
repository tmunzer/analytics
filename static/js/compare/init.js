function init(){
    filterFolder = "BUILDING";
    var data = {};
    $.ajax({
        method: "POST",
        url: "/dashboard/api/init/",
        data: data
    })
        .done(function (data) {
            if (data.error){
                displayModal("API", data.error);
            } else {
                locations = data.locations;
                displayTree();
                $("#location-tree input:checkbox").prop("checked", true);
                updateLocationAnalytics();
                updateTimeline();
            }
        });
}

