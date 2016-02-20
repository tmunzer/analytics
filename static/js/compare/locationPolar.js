var locationPolarReq;
function updatePolar() {
    var dataLocation, dataAverage;
    var chart = $('#timeline').highcharts();
    var endTime = chart.xAxis[1].categories[max];
    var startTime = chart.xAxis[1].categories[min];
    // @TODO: Current API limitation
    if (endTime - startTime <= 2678400000) {

        $("#polarData").hide();
        $("#polarEmpty").hide();
        $("#polarLoading").show();

        polarReq = new Date().getTime();
        $.ajax({
            method: 'POST',
            url: '/compare/api/polar/',
            data: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                filterFolder: filterFolder,
                locations: JSON.stringify(locationAnalytics),
                reqId: locationPolarReq
            }
        }).done(function (data) {
            if (data.error) console.log(data.error);
            else if (data.reqId == locationPolarReq) {
                var series = [];

                dataLocation = data.dataLocation;
                dataAverage = [
                    data.dataAverage['uniqueClients'],
                    data.dataAverage['engagedClients'],
                    data.dataAverage['passersbyClients'],
                    data.dataAverage['associatedClients'],
                    data.dataAverage['unassociatedClients']
                ];
                series.push({
                    type: 'area',
                    name: "Average",
                    data: dataAverage,
                    pointPlacement: 'on'
                });

                for (var loc in dataLocation) {
                    var dataChart = [
                        dataLocation[loc]['uniqueClients'],
                        dataLocation[loc]['engagedClients'],
                        dataLocation[loc]['passersbyClients'],
                        dataLocation[loc]['associatedClients'],
                        dataLocation[loc]['unassociatedClients']
                    ];
                    series.push({
                        type: 'line',
                        name: dataLocation[loc].name,
                        data: dataChart,
                        pointPlacement: 'on'
                    });
                }
                displayLocationPole('polarData', "", series);

                $("#polarData").show();
                $("#polarEpmty").hide();
                $("#polarLoading").hide();
            }
        })
    }
}

function displayLocationPole(containerId, title, series) {
    $('#'+containerId).highcharts({
        colors: ['#0085bd', '#00aff8', '#307fa1', '#606c71', '#3095cf', '#005c83', '#003248', '#00090d'],

        chart: {
            polar: true,
            type: 'line',
            width: 800
        },

        title: {
            text: title,
            x: -80
        },

        pane: {
            size: '80%'
        },

        xAxis: {
            categories: ['uniqueClients', 'engagedClients', 'passersbyClients', 'associatedClients',
                'unassociatedClients', 'storeFrontClients'],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },

        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
        },

        legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 70,
            layout: 'vertical'
        },

        series: series

    });
}