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
                color: "#9cd2f1"
            }, {
                name: 'engagedClients',
                data: engagedClients,
                color: "#1b1464"
            },
            {
                name: 'passersbyClients',
                data: passersbyClients,
                color: '#155c8c'
            },
            {
                name: 'associatedClients',
                data: associatedClients,
                color: "#106dab"
            },
            {
                name: 'unassociatedClients',
                data: unassociatedClients,
                color: "#3095cf"
            }
        ]
    });
    showData("line");

}
