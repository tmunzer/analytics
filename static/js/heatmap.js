var heatmapUniqueClients, heatmapUniqueClientsRange,
    heatmapEngagedClients, heatmapEngagedClientsRange,
    heatmapPassersbyClients, heatmapPassersbyClientsRange,
    heatmapAssociatedClients, heatmapAssociatedClientsRange,
    heatmapUnassociatedClients, heatmapUnassociatedClientsRange;

function heatmap() {
    heatmapUniqueClients = [];
    heatmapEngagedClients = [];
    heatmapPassersbyClients = [];
    heatmapAssociatedClients = [];
    heatmapUnassociatedClients = [];
    heatmapUniqueClientsRange = {min: 0, max: 0};
    heatmapEngagedClientsRange = {min: 0, max: 0};
    heatmapPassersbyClientsRange = {min: 0, max: 0};
    heatmapAssociatedClientsRange = {min: 0, max: 0};
    heatmapUnassociatedClientsRange = {min: 0, max: 0};
    var heatmapTemp = {};
    for (var x = 0; x < 24; x++) {
        if (!heatmapTemp.hasOwnProperty(x)) heatmapTemp[x] = {};
        for (var y = 0; y < 7; y++) {
            if (!heatmapTemp[x].hasOwnProperty(y)) heatmapTemp[x][y] = {};
            heatmapTemp[x][y]['numEntries'] = 0;
            heatmapTemp[x][y]['uniqueClients'] = 0;
            heatmapTemp[x][y]['engagedClients'] = 0;
            heatmapTemp[x][y]['passersbyClients'] = 0;
            heatmapTemp[x][y]['associatedClients'] = 0;
            heatmapTemp[x][y]['unassociatedClients'] = 0;
        }
    }
    $.ajax({
        method: "POST",
        url: "/api/clientlocation/clienttimeseries/",
        data: {
            location: locationAnalytics,
            startTime: fromDate.toISOString(),
            endTime: toDate.toISOString(),
            timeUnit: "OneHour"
        }
    }).done(function (data) {
        var entry;
        var time, x, y, numEntries, uniqueClients, engagedClients, passersbyClients, associatedClients, unassociatedClients;
        for (var i in data['data']['times']) {
            entry = data['data']['times'][i];
            time = entry['time'];
            if (new Date() - new Date(time)) {
                x = parseInt(time.split("T")[1].split(":")[0]);
                y = new Date(time).getDay();
                numEntries = heatmapTemp[x][y]['numEntries'] + 1;
                uniqueClients = heatmapTemp[x][y]['uniqueClients'] + entry['uniqueClients'];
                engagedClients = heatmapTemp[x][y]['engagedClients'] + entry['engagedClients'];
                passersbyClients = heatmapTemp[x][y]['passersbyClients'] + entry['passersbyClients'];
                associatedClients = heatmapTemp[x][y]['associatedClients'] + entry['associatedClients'];
                unassociatedClients = heatmapTemp[x][y]['unassociatedClients'] + entry['unassociatedClients'];
                heatmapTemp[x][y]['numEntries'] = numEntries;
                heatmapTemp[x][y]['uniqueClients'] = uniqueClients;
                heatmapTemp[x][y]['engagedClients'] = engagedClients;
                heatmapTemp[x][y]['passersbyClients'] = passersbyClients;
                heatmapTemp[x][y]['associatedClients'] = associatedClients;
                heatmapTemp[x][y]['unassociatedClients'] = unassociatedClients;
            }
        }
        var tempVal = 0;
        var dayOfTheWeek;
        for (x = 0; x < 24; x++) {
            for (y = 0; y < 7; y++) {
                if (y == 0) dayOfTheWeek = 6;
                else dayOfTheWeek = y - 1;
                tempVal = parseInt((heatmapTemp[x][y]['uniqueClients'] / heatmapTemp[x][y]['numEntries']).toFixed(0));
                heatmapUniqueClients.push([x, dayOfTheWeek, tempVal]);
                if (tempVal < heatmapUniqueClientsRange.min) heatmapUniqueClientsRange.min = tempVal;
                if (tempVal > heatmapUniqueClientsRange.max) heatmapUniqueClientsRange.max = tempVal;


                tempVal = parseInt((heatmapTemp[x][y]['engagedClients'] / heatmapTemp[x][y]['numEntries']).toFixed(0));
                heatmapEngagedClients.push([x, dayOfTheWeek, tempVal]);
                if (tempVal < heatmapEngagedClientsRange.min) heatmapEngagedClientsRange.min = tempVal;
                if (tempVal > heatmapEngagedClientsRange.max) heatmapEngagedClientsRange.max = tempVal;

                tempVal = parseInt((heatmapTemp[x][y]['passersbyClients'] / heatmapTemp[x][y]['numEntries']).toFixed(0));
                heatmapPassersbyClients.push([x, dayOfTheWeek, tempVal]);
                if (tempVal < heatmapPassersbyClientsRange.min) heatmapPassersbyClientsRange.min = tempVal;
                if (tempVal > heatmapPassersbyClientsRange.max) heatmapPassersbyClientsRange.max = tempVal;

                tempVal = parseInt((heatmapTemp[x][y]['associatedClients'] / heatmapTemp[x][y]['numEntries']).toFixed(0));
                heatmapAssociatedClients.push([x, dayOfTheWeek, tempVal]);
                if (tempVal < heatmapAssociatedClientsRange.min) heatmapAssociatedClientsRange.min = tempVal;
                if (tempVal > heatmapAssociatedClientsRange.max) heatmapAssociatedClientsRange.max = tempVal;

                tempVal = parseInt((heatmapTemp[x][y]['unassociatedClients'] / heatmapTemp[x][y]['numEntries']).toFixed(0));
                heatmapUnassociatedClients.push([x, dayOfTheWeek, tempVal]);
                if (tempVal < heatmapUnassociatedClientsRange.min) heatmapUnassociatedClientsRange.min = tempVal;
                if (tempVal > heatmapUnassociatedClientsRange.max) heatmapUnassociatedClientsRange.max = tempVal;
            }
        }
        displayHeatmap(heatmapEngagedClients, heatmapEngagedClientsRange, 'Engaged Clients');
    });
}

function displayHeatmap(data, range, title) {
    $("#heatmap-button").html(title);
    var chart = $("#heat");
    if (chart.highcharts()) chart.highcharts().destroy();
    chart.highcharts({
        chart: {
            type: 'heatmap',
            marginTop: 40,
            marginBottom: 80,
            plotBorderWidth: 1
        },
        xAxis: {
            categories: ['00H00-01h00', '01H00-02H00', '02H00-03H00', '03H00-04H00', '04H00-05H00', '05H00-06H00',
                '06H00-06H00', '07H00-08H00', '08H00-09H00', '09H00-10H00', '10H00-11H00', '11H00-12H00',
                '12H00-13H00', '13H00-14H00', '14H00-15H00', '15H00-16H00', '16H00-17H00', '17H00-18H00',
                '18H00-19H00', '19H00-20H00', '20H00-21H00', '21H00-22H00', '22H00-23H00', '23H00-24H00']
        },

        yAxis: {
            categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            title: null
        },

        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'top',
            y: 100,
            symbolHeight: 200
        },
        title: {
            text: 'Number of ' + title + " per hour"
        },
        colorAxis: {
            min: range.min,
            max: range.max,
            minColor: '#FFFFFF',
            maxColor: Highcharts.getOptions().colors[0]
        },
        series: [{
            name: 'Number of ' + title + " per hour",
            borderWidth: 1,
            data: data,
            dataLabels: {
                enabled: true,
                color: '#000000'
            }
        }],
        tooltip: {
            formatter: function () {
                return '<b>Day: </b>' + this.series.yAxis.categories[this.point.y] + '<br>' +
                    "<b>Time: </b>" + this.series.xAxis.categories[this.point.x] + '</b><br>' +
                    this.point.value + '</b> ' + title + ' <br>';
            }
        }
    });

}