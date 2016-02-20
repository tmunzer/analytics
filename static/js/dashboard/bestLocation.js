var bestLocations = {};

function updateBestLocation() {

    var chart = $('#timeline').highcharts();
    var endTime = chart.xAxis[1].categories[max];
    var startTime = chart.xAxis[1].categories[min];
    // @TODO: Current API limitation
    if (endTime - startTime <= 2678400000) {


        showLoading('bestLocation');
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
                console.log(data);
                bestLocations = data.data['bestLocations'];
                displayBestLocation("storeFrontClients", 'Storefront Conversion', true);
                showData('bestLocation');
            }
        });
    } else {
        showEmpty('bestLocation');


    }

}

function displayBestLocation(param, title, percentage){
    $("#button-bestLocation").html(title);
    switch (param){
        case 'associatedClients':
            $("#help-bestLocation").html("Number of clients that were associated with the network over the given time interval.");
            break;
        case 'engagedClients':
            $("#help-bestLocation").html("Number of clients that were engaged over the time interval.");
            break;
        case 'passersbyClients':
            $("#help-bestLocation").html("Number of clients that were determined to be passersby over the time interval.");
            break;
        case 'storeFrontClients':
            $("#help-bestLocation").html("Percentage of clients seen outside that come into your store.");
            break;
        case 'unassociatedClients':
            $("#help-bestLocation").html("The number of clients not associated with the network over the given time interval.");
            break;
        case 'uniqueClients':
            $("#help-bestLocation").html("The number of unique clients over the time interval.");
            break;
    }
    var xAxisData = [];
    var data = [];
    var sortable = [];

    for (var locNum in bestLocations) {
        sortable.push([bestLocations[locNum]['name'], bestLocations[locNum][param]]);
    }
    sortable.sort(function(a, b) {return b[1] - a[1]});

    for (var i = 0; i < 5; i++){
        if (sortable.hasOwnProperty(i)){
        xAxisData.push(sortable[i][0]);
        data.push(parseInt(sortable[i][1]));
        } else {
            xAxisData.push("");
            data.push(0);
        }
    }
    displayWidgetChart("bestLocationChart", title, xAxisData, data, percentage);

}