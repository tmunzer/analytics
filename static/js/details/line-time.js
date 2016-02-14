function displayLineChart(time, uniqueClients, engagedClients, passersbyClients, associatedClients, unassociatedClients, format, step) {
    var chart = $("#lineChart");
    if (chart.highcharts()) chart.highcharts().destroy();
    chart.highcharts({
        chart: {
            marginBottom: 80,
            plotBorderWidth: 1,
            height: 350,
            width: 950
        },
        title: {
            text: ''
        },
        legend: {
            y: 15
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
            categories: time,
            tickInterval: step,
            labels: {
                format: format
            }
        },
        series: [
            {
                name: 'uniqueClients',
                data: uniqueClients,
                color: "#7a9fb8"
            }, {
                name: 'engagedClients',
                data: engagedClients,
                color: "#1b1464"
            },
            {
                name: 'passersbyClients',
                data: passersbyClients,
                color: '#FCC132'
            },
            {
                name: 'associatedClients',
                data: associatedClients,
                color: "gray"
            },
            {
                name: 'unassociatedClients',
                data: unassociatedClients,
                color: "#73D5D8"
            }
        ]
    });

    $("#lineData").show();
    $("#lineLoading").hide();
}
