var heatmapUniqueClients, heatmapUniqueClientsRange,
    heatmapEngagedClients, heatmapEngagedClientsRange,
    heatmapPassersbyClients, heatmapPassersbyClientsRange,
    heatmapAssociatedClients, heatmapAssociatedClientsRange,
    heatmapUnassociatedClients, heatmapUnassociatedClientsRange;

function updateHeatmap() {

    showLoading('line');
    showLoading('heatmap');

    var chart = $('#timeline').highcharts();
    var endTime = new Date(chart.xAxis[1].categories[max]);
    var startTime = new Date(chart.xAxis[1].categories[min]);

    if (endTime - startTime <= 2678400000) {
        //line chart
        var lineTime = [];
        var lineUniqueClients = [];
        var lineEngagedClients = [];
        var linePassersbyClients = [];
        var lineAssociatedClients = [];
        var lineUnassociatedClients = [];
        var format, step;
        //heatmap chart
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

        switch (range){
            case 0:
                format = '{value:%H:%M}';
                step = 24;
                break;
            case 1:
                format = '{value:%m-%d %H:%M}';
                step = 24;
                break;
            case 2:
                format = '{value:%m-%d %H:%M}';
                step = 24;
                break;
            case 3:
                format = '{value:%m-%Y}';
                step = 1;
                break;
        }


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
            url: "/details/api/clienttimeseries/",
            data: {
                locations: JSON.stringify(locationAnalytics),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            }
        }).done(function (data) {
            if (data.error) displayModal("API", data.error);
            else {
                var entry;
                var time, x, y, numEntries;
                for (var i in data['data']) {
                    entry = data['data'][i];
                    time = entry['time'];
                    lineTime.push(new Date(entry['time']));
                    lineUniqueClients.push(entry['uniqueClients']);
                    lineEngagedClients.push(entry['engagedClients']);
                    linePassersbyClients.push(entry['passersbyClients']);
                    lineAssociatedClients.push(entry['associatedClients']);
                    lineUnassociatedClients.push(entry['unassociatedClients']);
                    if (new Date() - new Date(time)) {
                        x = parseInt(time.split("T")[1].split(":")[0]);
                        y = new Date(time).getDay();
                        numEntries = heatmapTemp[x][y]['numEntries'] + 1;
                        heatmapTemp[x][y]['numEntries'] = numEntries;
                        heatmapTemp[x][y]['uniqueClients'] = heatmapTemp[x][y]['uniqueClients'] + entry['uniqueClients'];
                        heatmapTemp[x][y]['engagedClients'] = heatmapTemp[x][y]['engagedClients'] + entry['engagedClients'];
                        heatmapTemp[x][y]['passersbyClients'] = heatmapTemp[x][y]['passersbyClients'] + entry['passersbyClients'];
                        heatmapTemp[x][y]['associatedClients'] = heatmapTemp[x][y]['associatedClients'] + entry['associatedClients'];
                        heatmapTemp[x][y]['unassociatedClients'] = heatmapTemp[x][y]['unassociatedClients'] + entry['unassociatedClients'];
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
                displayLineChart(lineTime, lineUniqueClients, lineEngagedClients, linePassersbyClients,
                    lineAssociatedClients, lineUnassociatedClients, format, step);
            }
        });
    } else {
        showEmpty("line");
        showEmpty("heatmap");
    }
}