var bestLocations = {};

function updateBestLocation() {

    var chart = $('#timeline').highcharts();
    var endTime = chart.xAxis[1].categories[max];
    var startTime = chart.xAxis[1].categories[min];
    // @TODO: Current API limitation
    if (endTime - startTime <= 2678400000) {

        $("#bestLocationEmpty").hide();
        $("#bestLocationLoading").show();

        $.ajax({
            method: 'POST',
            url: '/dashboard/api/update/widget-best/',
            data: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                locations: JSON.stringify(locationAnalytics)
            }
        }).done(function (data) {
            if (data.error) console.log(data.error);
            else {
                bestLocations = data.data['bestLocations'];
                displayBestLocation("storeFrontClients");
                $("#bestLocationLoading").hide();
                $("#bestLocationData").show();
                           }
        });
    } else {
        $("#bestLocationEmpty").show();
        $("#bestLocationData").hide();


    }

}

function displayBestLocation(param, title){
    $("#button-bestLocation").html(title);
    var xAxisData = [];
    var data = [];
    var sortable = [];

    for (var locNum in bestLocations) {
        sortable.push([bestLocations[locNum]['name'], bestLocations[locNum][param]]);
    }
    sortable.sort(function(a, b) {return b[1] - a[1]});
    console.log(sortable);
    var chartSize;
    if (sortable.length < 5) chartSize = sortable.length;
    else chartSize = 5;

    console.log(sortable);
    for (var i = 0; i < chartSize; i++){
        xAxisData.push(sortable[i][0]);
        data.push(parseInt(sortable[i][1]));
    }
    console.log(xAxisData);
    console.log(data);
    displayWidgetChart("bestLocationChart", "Best location By", xAxisData, data);

}