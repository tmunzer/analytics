function updateWidgets() {
    var chart = $('#timeline').highcharts();
    var endTime = chart.xAxis[1].categories[max];
    var startTime = chart.xAxis[1].categories[min];
    $("#passersByEmpty").hide();
    $("#passersByData").hide();

    $("#engagedEmpty").hide();
    $("#engagedData").hide();

    $("#storeFrontEmpty").hide();
    $("#storeFrontData").hide();

    $("#passersByLoading").show();
    $("#engagedLoading").show();
    $("#storeFrontLoading").show();

    $.ajax({
        method: 'POST',
        url: '/dashboard/api/update/widgets/',
        data: {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            locations: JSON.stringify(locationAnalytics)
        }
    }).done(function (data) {
        if (data.error) console.log(data.error);
        else {
            var dataPassersBy = [data.dataLastYear.passersbyClients, data.dataLastMonth.passersbyClients, data.dataLastWeek.passersbyClients, data.dataNow.passersbyClients];
            var dataEngaged = [data.dataLastYear.engagedClients, data.dataLastMonth.engagedClients, data.dataLastWeek.engagedClients, data.dataNow.engagedClients];
            var dataStoreFront = [
                getStoreFront(data.dataLastYear.engagedClients, data.dataLastYear.uniqueClients),
                getStoreFront(data.dataLastMonth.engagedClients, data.dataLastMonth.uniqueClients),
                getStoreFront(data.dataLastWeek.engagedClients, data.dataLastWeek.uniqueClients),
                getStoreFront(data.dataNow.engagedClients, data.dataNow.uniqueClients)
            ];
            var xAxisData = ['Previous Year', 'Previous Month', 'Previous Week', 'Selected Period'];

            $("#passersByLoading").hide();
            $("#passersByData").show();
            displayWidgetChart("passersByChart", "Number of PassersBy Clients", xAxisData, dataPassersBy);
            $("#passersByWeek").html(getHtmlPercentage(data.dataNow.passersbyClients, data.dataLastWeek.passersbyClients));
            $("#passersByMonth").html(getHtmlPercentage(data.dataNow.passersbyClients, data.dataLastMonth.passersbyClients));
            $("#passersByYear").html(getHtmlPercentage(data.dataNow.passersbyClients, data.dataLastYear.passersbyClients));

            $("#engagedLoading").hide();
            $("#engagedData").show();
            displayWidgetChart("engagedChart", "Number of Engaged Clients", xAxisData, dataEngaged);

            $("#engagedWeek").html(getHtmlPercentage(data.dataNow.engagedClients, data.dataLastWeek.engagedClients));
            $("#engagedMonth").html(getHtmlPercentage(data.dataNow.engagedClients, data.dataLastMonth.engagedClients));
            $("#engagedYear").html(getHtmlPercentage(data.dataNow.engagedClients, data.dataLastYear.engagedClients));

            $("#storeFrontLoading").hide();
            $("#storeFrontData").show();
            displayWidgetChart("storeFrontChart", "StoreFront Conversion", xAxisData, dataStoreFront);
            $("#storeFrontWeek").html(getHtmlPercentage(
                getStoreFront(data.dataNow.engagedClients, data.dataNow.uniqueClients),
                getStoreFront(data.dataLastWeek.engagedClients, data.dataLastWeek.uniqueClients)
            ));
            $("#storeFrontMonth").html(getHtmlPercentage(
                getStoreFront(data.dataNow.engagedClients, data.dataNow.uniqueClients),
                getStoreFront(data.dataLastMonth.engagedClients, data.dataLastMonth.uniqueClients)
            ));
            $("#storeFrontYear").html(getHtmlPercentage(
                getStoreFront(data.dataNow.engagedClients, data.dataNow.uniqueClients),
                getStoreFront(data.dataLastYear.engagedClients, data.dataLastYear.uniqueClients)
            ));
        }
    });


}

function displayWidgetChart(containerId, title, xAxisData, data) {
    var container = $('#' + containerId);
    if (container.highcharts()) container.highcharts().destroy();
    container.highcharts({
        chart: {
            type: 'column',
            height: 250
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: xAxisData
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Number of devices'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: false
                }
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{point.x}</span><br>',
            pointFormat: '<span style="color:{point.color}">{series.name}</span>: <b>{point.y}</b><br/>'
        },

        series: [{
            name: title,
            data: data
        }]
    });
}

function getStoreFront(engaged, uniqueClient) {
    if (uniqueClient == 0) return 0;
    else return parseInt(((engaged / uniqueClient)*100).toFixed(0));
}

function getHtmlPercentage(num1, num2) {
    var htmlString = "";
    if (num2 == 0) {
        htmlString = '<span style="color: gray">N/A</span>';
    } else {
        var percentage = (((num1 - num2) / num2) * 100);
        if (percentage < 0) htmlString =
            '<ul>' +
            '<li class="widget-li">' +
            '<span style="color: red">' + percentage.toFixed(0) + '%</span>' +
            '</li>' +
            '<li class="widget-li">' +
            '<i class="fa fa-caret-down fa-lg" style="margin: auto;color: red"></i>' +
            '</li>' +
            '</ul>';
        else if (percentage > 0) htmlString =
            '<ul>' +
            '<li class="widget-li">' +
            '<i class="fa fa-caret-up fa-lg" style="margin: auto;color: green"></i>' +
            '</li>' +
            '<li class="widget-li">' +
            '<span style="color: green">+' + percentage.toFixed(0) + '%</span>' +
            '</li>' +
            '</ul>';
        else htmlString =
                '<ul>' +
                '<li class="widget-li">' +
                '<i class="fa fa-caret-right fa-lg" style="margin: auto;color: gray"></i>' +
                '</li>' +
                '<li class="widget-li">' +
                '<span style="color: gray">' + percentage.toFixed(0) + '%</span>' +
                '</li>' +
                '</ul>';
    }
    return htmlString
}