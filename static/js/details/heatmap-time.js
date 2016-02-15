

function displayHeatmap(data, range, title) {
    $("#heatmap-button").html(title);
    var chart = $("#heatmapChart");
    if (chart.highcharts()) chart.highcharts().destroy();
    chart.highcharts({
        color: "#7a9fb8",
        chart: {
            type: 'heatmap',
            marginBottom: 80,
            plotBorderWidth: 1,
            height: 350,
            width: 950
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
            text: ''
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
    $("#heatmapData").show();
    $("#heatmapLoading").hide();

}