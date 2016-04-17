function updateWidgets() {

    var chart = $('#timeline').highcharts();
    var endTime = chart.xAxis[1].categories[max];
    var startTime = chart.xAxis[1].categories[min];
    // @TODO: Current API limitation
    if (endTime - startTime <= 2678400000) {

        showLoading("passersBy");
        showLoading("engaged");
        showLoading("storeFront");
        showLoading("newClients");
        showLoading("returningClients");

        $.ajax({
            method: 'POST',
            url: '/dashboard/api/update/widgets/',
            data: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                locations: JSON.stringify(locationAnalytics)
            }
        }).done(function (data) {
            if (data.error) displayModal("API", data.error);
            else {
                var dataPassersBy, dataEngaged, dataStoreFront, dataNewClients, dataReturningClients, xAxisData;
                //less than 1 week
                if (endTime - startTime <= 604800000) {
                    xAxisData = ['Previous Year', 'Previous Month', 'Previous Week', 'Selected Period'];
                    dataPassersBy = [data.dataLastYear.passersbyClients, data.dataLastMonth.passersbyClients, data.dataLastWeek.passersbyClients, data.dataNow.passersbyClients];
                    dataEngaged = [data.dataLastYear.engagedClients, data.dataLastMonth.engagedClients, data.dataLastWeek.engagedClients, data.dataNow.engagedClients];
                    dataNewClients = [data.dataLastYear.newClients, data.dataLastMonth.newClients, data.dataLastWeek.newClients, data.dataNow.newClients];
                    dataReturningClients = [data.dataLastYear.returningClients, data.dataLastMonth.returningClients, data.dataLastWeek.returningClients, data.dataNow.returningClients];
                    dataStoreFront = [
                        getStoreFront(data.dataLastYear.engagedClients, data.dataLastYear.uniqueClients),
                        getStoreFront(data.dataLastMonth.engagedClients, data.dataLastMonth.uniqueClients),
                        getStoreFront(data.dataLastWeek.engagedClients, data.dataLastWeek.uniqueClients),
                        getStoreFront(data.dataNow.engagedClients, data.dataNow.uniqueClients)
                    ];
                } else if (endTime - startTime <= 2678400000) {
                    xAxisData = ['Previous Year', 'Previous Month', 'Selected Period'];
                    dataPassersBy = [data.dataLastYear.passersbyClients, data.dataLastMonth.passersbyClients, data.dataNow.passersbyClients];
                    dataEngaged = [data.dataLastYear.engagedClients, data.dataLastMonth.engagedClients, data.dataNow.engagedClients];
                    dataNewClients = [data.dataLastYear.newClients, data.dataLastMonth.newClients, data.dataNow.newClients];
                    dataReturningClients = [data.dataLastYear.returningClients, data.dataLastMonth.returningClients, data.dataNow.returningClients];
                    dataStoreFront = [
                        getStoreFront(data.dataLastYear.engagedClients, data.dataLastYear.uniqueClients),
                        getStoreFront(data.dataLastMonth.engagedClients, data.dataLastMonth.uniqueClients),
                        getStoreFront(data.dataNow.engagedClients, data.dataNow.uniqueClients)
                    ];
                } else {
                    xAxisData = ['Previous Year', 'Selected Period'];
                    dataPassersBy = [data.dataLastYear.passersbyClients, data.dataNow.passersbyClients];
                    dataEngaged = [data.dataLastYear.engagedClients, data.dataNow.engagedClients];
                    dataNewClients = [data.dataLastYear.newClients, data.dataNow.newClients];
                    dataReturningClients = [data.dataLastYear.returningClients, data.dataNow.returningClients];
                    dataStoreFront = [
                        getStoreFront(data.dataLastYear.engagedClients, data.dataLastYear.uniqueClients),
                        getStoreFront(data.dataNow.engagedClients, data.dataNow.uniqueClients)
                    ];
                }

                showData("passersBy");
                displayWidgetChart("passersByChart", "Number of PassersBy Clients", xAxisData, dataPassersBy);
                $("#passersByWeek").html(getHtmlPercentage(data.dataNow.passersbyClients, data.dataLastWeek.passersbyClients));
                $("#passersByMonth").html(getHtmlPercentage(data.dataNow.passersbyClients, data.dataLastMonth.passersbyClients));
                $("#passersByYear").html(getHtmlPercentage(data.dataNow.passersbyClients, data.dataLastYear.passersbyClients));

                showData("engaged");
                displayWidgetChart("engagedChart", "Number of Engaged Clients", xAxisData, dataEngaged);
                $("#engagedWeek").html(getHtmlPercentage(data.dataNow.engagedClients, data.dataLastWeek.engagedClients));
                $("#engagedMonth").html(getHtmlPercentage(data.dataNow.engagedClients, data.dataLastMonth.engagedClients));
                $("#engagedYear").html(getHtmlPercentage(data.dataNow.engagedClients, data.dataLastYear.engagedClients));

                showData("storeFront");
                displayWidgetChart("storeFrontChart", "StoreFront Conversion", xAxisData, dataStoreFront, true);
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

                showData("newClients");
                displayWidgetChart("newClientsChart", "Number of New Clients", xAxisData, dataNewClients);
                $("#newClientsWeek").html(getHtmlPercentage(data.dataNow.newClients, data.dataLastWeek.newClients));
                $("#newClientsMonth").html(getHtmlPercentage(data.dataNow.newClients, data.dataLastMonth.newClients));
                $("#newClientsYear").html(getHtmlPercentage(data.dataNow.newClients, data.dataLastYear.newClients));

                showData("returningClients");
                displayWidgetChart("returningClientsChart", "Number of Returning Clients", xAxisData, dataReturningClients);
                $("#returningClientsWeek").html(getHtmlPercentage(data.dataNow.returningClients, data.dataLastWeek.returningClients));
                $("#returningClientsMonth").html(getHtmlPercentage(data.dataNow.returningClients, data.dataLastMonth.returningClients));
                $("#returningClientsYear").html(getHtmlPercentage(data.dataNow.returningClients, data.dataLastYear.returningClients));

            }
        });
    } else {
        showEmpty("passersBy");
        showEmpty("engaged");
        showEmpty("storeFront");
        showEmpty("newClients");
        showEmpty("returningClients");

    }

}

function displayWidgetChart(containerId, title, xAxisData, data, percentage) {
    var yAxisTitle, pointFormatPercentage;
    if (percentage){
        yAxisTitle = "% of Devices";
        pointFormatPercentage = "%";
    } else {
        yAxisTitle = 'Number of devices';
        pointFormatPercentage = "";
    }
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
                text: yAxisTitle
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
            pointFormat: '<span style="color:{point.color}">{series.name}</span>: <b>{point.y}'+pointFormatPercentage+'</b><br/>'
        },

        series: [{
            name: title,
            data: data
        }]
    });
}

function getStoreFront(engaged, uniqueClient) {
    if (uniqueClient == 0) return 0;
    else return parseInt(((engaged / uniqueClient) * 100).toFixed(0));
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