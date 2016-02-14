function displayMainChart() {
    var timeUnit = "";
    if (toDate - fromDate <= 172800000) {
        timeUnit = "FiveMinutes";
    } else if (toDate - fromDate <= 604800000) {
        timeUnit = "OneHour";
    } else  {
        timeUnit = "OneDay";
    }
    $.ajax({
        method: "POST",
        url: "/api/clientlocation/clienttimeseries/",
        data: {
            location: locationAnalytics,
            startTime: fromDate.toISOString(),
            endTime: toDate.toISOString(),
            timeUnit: timeUnit
        }
    }).done(function (data) {
        var entry;
        var time = [];
        var uniqueClients = [];
        var engagedClients = [];
        var passersbyClients = [];
        var associatedClients = [];
        var unassociatedClients = [];
        for (var i in data['data']['times']) {
            entry = data['data']['times'][i];
            time.push(new Date(entry['time']));
            uniqueClients.push(entry['uniqueClients']);
            engagedClients.push(entry['engagedClients']);
            passersbyClients.push(entry['passersbyClients']);
            associatedClients.push(entry['associatedClients']);
            unassociatedClients.push(entry['unassociatedClients']);
        }
        $('#clienttimeseries').highcharts({
            title: {
                text: ''
            },
            yAxis: {
                title: {
                    text: 'Count'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            xAxis: {
                categories: time
            },
            series: [
                {
                    name: 'uniqueClients',
                    data: uniqueClients
                }, {
                    name: 'engagedClients',
                    data: engagedClients
                },
                {
                    name: 'passersbyClients',
                    data: passersbyClients
                },
                {
                    name: 'associatedClients',
                    data: associatedClients
                },
                {
                    name: 'unassociatedClients',
                    data: unassociatedClients
                }
            ]
        });
    });
}
