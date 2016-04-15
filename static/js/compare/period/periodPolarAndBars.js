var periodPolarReq;

function updatePeriod() {

    var dataPeriod, dataAverage;
    var chart = $('#timeline').highcharts();
    var endTime = chart.xAxis[1].categories[max];
    var startTime = chart.xAxis[1].categories[min];
    // @TODO: Current API limitation
    if (endTime - startTime <= 2678400000) {

        showLoading("polar");
        showLoading("tableCompare");


        showLoading("visitorsVsEngagedBar");
        showLoading("visitorsVsEngagedCountBar");
        showLoading("wifiBar");
        showLoading("wifiCountBar");
        showLoading("loyaltyBar");
        showLoading("loyaltyCountBar");

        periodPolarReq = new Date().getTime();

        $.ajax({
            method: "POST",
            url: "/compare/api/period/polar/",
            data: {
                locations: JSON.stringify(locationAnalytics),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                reqId: periodPolarReq

            }
        }).done(function (data) {
            if (data.error) displayModal("API", data.error);
            else if (data.reqId == periodPolarReq) {
                var series = [];
                var locationsSeries = [];
                var storefrontBars = [];
                var storeFrontClients;

                var engagedCountBars = [];
                var passersByCountBars = [];
                var engagedBars = [];
                var passersByBars = [];
                var engaged;
                var passersBy;

                var associatedCountBars = [];
                var unassociatedCountBars = [];
                var associatedBars = [];
                var unassociatedBars = [];
                var associated;
                var unassociated;

                var newCountBars = [];
                var returningCountBars = [];
                var newBars = [];
                var returningBars = [];
                var newClients;
                var returningClients;


                dataPeriod = data.dataPeriod;
                dataAverage = [
                    data.dataAverage['uniqueClients'],
                    data.dataAverage['engagedClients'],
                    data.dataAverage['passersbyClients'],
                    data.dataAverage['associatedClients'],
                    data.dataAverage['unassociatedClients'],
                    data.dataAverage['newClients'],
                    data.dataAverage['returningClients']
                ];
                if (data.dataAverage['uniqueClients'] == 0) storeFrontClients = 0;
                else storeFrontClients = ((data.dataAverage['engagedClients'] / data.dataAverage['uniqueClients']) * 100).toFixed(0);

                series.push({
                    type: 'area',
                    color: 'rgba(0, 0, 0, 0.2)',
                    name: "Average",
                    data: dataAverage,
                    pointPlacement: 'on'
                });

                dataPeriod.forEach(function (currentPeriod) {

                    var dataChart = [
                        data.dataAverage['uniqueClients'],
                        data.dataAverage['engagedClients'],
                        data.dataAverage['passersbyClients'],
                        data.dataAverage['associatedClients'],
                        data.dataAverage['unassociatedClients'],
                        data.dataAverage['newClients'],
                        data.dataAverage['returningClients']
                    ];

                    series.push({
                        type: 'line',
                        name: currentPeriod['period'],
                        data: dataChart,
                        pointPlacement: 'on'
                    });





                    if (currentPeriod['uniqueClients'] == 0) {
                        engaged = 0;
                        passersBy = 0;
                        associated = 0;
                        unassociated = 0;
                        newClients = 0;
                        returningClients = 0;
                    }
                    else {
                        engaged = ((currentPeriod['engagedClients']/currentPeriod['uniqueClients'])*100).toFixed(0);
                        passersBy = ((currentPeriod['passersbyClients']/currentPeriod['uniqueClients'])*100).toFixed(0);
                        associated = ((currentPeriod['associatedClients']/currentPeriod['uniqueClients'])*100).toFixed(0);
                        unassociated = ((currentPeriod['unassociatedClients']/currentPeriod['uniqueClients'])*100).toFixed(0);
                        newClients = ((currentPeriod['newClients']/currentPeriod['uniqueClients'])*100).toFixed(0);
                        returningClients = ((currentPeriod['returningClients']/currentPeriod['uniqueClients'])*100).toFixed(0);
                    }

                    locationsSeries.push(currentPeriod['period']);

                    engagedBars.push(parseInt(engaged));
                    passersByBars.push(parseInt(passersBy));
                    engagedCountBars.push(currentPeriod['engagedClients']);
                    passersByCountBars.push(currentPeriod['passersbyClients']);

                    associatedBars.push(parseInt(associated));
                    unassociatedBars.push(parseInt(unassociated));
                    associatedCountBars.push(currentPeriod['associatedClients']);
                    unassociatedCountBars.push(currentPeriod['unassociatedClients']);

                    newBars.push(parseInt(newClients));
                    returningBars.push(parseInt(returningClients));
                    newCountBars.push(currentPeriod['newClients']);
                    returningCountBars.push(currentPeriod['returningClients']);

                });

                var visitorsVsEngaged = [{
                    name: 'Engaged Clients',
                    data: engagedBars
                }, {
                    name: 'Passers By',
                    data: passersByBars
                }];
                var visitorsVsEngagedCount = [{
                    name: 'Engaged Clients',
                    data: engagedCountBars
                }, {
                    name: 'Passers By',
                    data: passersByCountBars
                }];
                var wifiClients  = [{
                    name: 'Associated Clients',
                    data: associatedBars
                }, {
                    name: 'Unassociated Clients',
                    data: unassociatedBars
                }];
                var wifiClientsCount  = [{
                    name: 'Associated Clients',
                    data: associatedCountBars
                }, {
                    name: 'Unassociated Clients',
                    data: unassociatedCountBars
                }];
                var loyaltyClients = [{
                    name: 'New Clients',
                    data: newBars
                }, {
                    name: "Returning Clients",
                    data: returningBars
                }];
                var loyaltyClientsCount = [{
                    name: 'New Clients',
                    data: newCountBars
                }, {
                    name: "Returning Clients",
                    data: returningCountBars
                }];

                displayLocationPole('polarChart', "", series);
                showData("polar");

                displayStackedBarChart("visitorsVsEngagedBarChart", "", locationsSeries, visitorsVsEngaged, true);
                showData("visitorsVsEngagedBar");
                displayStackedBarChart("visitorsVsEngagedCountBarChart", "", locationsSeries, visitorsVsEngagedCount);
                showData("visitorsVsEngagedCountBar");

                displayStackedBarChart("wifiBarChart", "", locationsSeries, wifiClients, true);
                showData("wifiBar");
                displayStackedBarChart("wifiCountBarChart", "", locationsSeries, wifiClientsCount);
                showData("wifiCountBar");

                displayStackedBarChart("loyaltyBarChart", "", locationsSeries, loyaltyClients, true);
                showData("loyaltyBar");
                displayStackedBarChart("loyaltyCountBarChart", "", locationsSeries, loyaltyClientsCount);
                showData("loyaltyCountBar");

                var htmlString = "<table class='table table-hover'><thead><tr><th></th>";
                for (var i = 0; i < dataPeriod.length - 1; i++) {
                    htmlString += "<th>" + dataPeriod[i]['period'] + "</th>";
                }
                htmlString += "</tr></thead><tbody>";
                htmlString += "<tr><th>Engaged Clients</th>" + getTableRow(dataPeriod, "engagedClients") + "</tr>";
                htmlString += "<tr><th>PassersBy Clients</th>" + getTableRow(dataPeriod, "passersbyClients") + "</tr>";
                htmlString += "<tr><th>New Clients</th>" + getTableRow(dataPeriod, "newClients") + "</tr>";
                htmlString += "<tr><th>Returning Clients</th>" + getTableRow(dataPeriod, "returningClients") + "</tr>";
                htmlString += "<tr><th>Associated Clients</th>" + getTableRow(dataPeriod, "associatedClients") + "</tr>";
                htmlString += "<tr><th>Unassociated Clients</th>" + getTableRow(dataPeriod, "unassociatedClients") + "</tr>";
                htmlString += "</tbody></table>";
                $("#tableCompare").html(htmlString);
                showData("tableCompare");
            }
        })
    }
}

function getTableRow(dataPeriod, dataName) {
    var htmlString = "";
    for (var i = 0; i < dataPeriod.length - 1; i++) {
        htmlString += "<td>" + getPercentage(dataPeriod[dataPeriod.length -1][dataName], dataPeriod[i][dataName]) + "</td>";
    }
    return htmlString;
}

function getPercentage(num1, num2) {
    var htmlString = "";
    if (num2 == 0) {
        htmlString = '<span style="color: gray">N/A</span>';
    } else {
        var percentage = (((num1 - num2) / num2) * 100);
        if (percentage < 0) htmlString =
            '<span style="color: red"><i class="fa fa-caret-down fa-lg" style="margin: auto;color: red;"></i> ' + percentage.toFixed(0) + '%</span>';
        else if (percentage > 0) htmlString =
            '<span style="color: green"><i class="fa fa-caret-up fa-lg" style="margin: auto;color: green;"></i> +' + percentage.toFixed(0) + '%</span>';
        else htmlString =
            '<span style="color: gray"><i class="fa fa-caret-right fa-lg" style="margin: auto;"></i> ' + percentage.toFixed(0) + '%</span>';
    }
    return htmlString
}


function displayLocationPole(containerId, title, series) {
    $('#' + containerId).highcharts({
        colors: ['#0085bd', '#00aff8', '#307fa1', '#606c71', '#3095cf', '#005c83', '#003248', '#00090d'],

        chart: {
            polar: true,
            type: 'line',
            width: 800,
            height: 390
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


function displayBarChart(containerId, title, xAxisData, data, percentage) {
    var yAxisTitle, pointFormatPercentage;
    if (percentage) {
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
            pointFormat: '<span style="color:{point.color}">{series.name}</span>: <b>{point.y}' + pointFormatPercentage + '</b><br/>'
        },

        series: [{
            name: title,
            data: data
        }]
    });
}

function displayStackedBarChart(containerId, title, xAxisData, data, percentage) {
    var yAxisTitle, pointFormatPercentage;
    if (percentage) {
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
            type: 'column'
        },
        title: {
            text: title
        },
        xAxis: {
            categories: xAxisData
        },
        yAxis: {
            min: 0,
            title: {
                text: yAxisTitle
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}' + pointFormatPercentage + '<br/>Total: {point.stackTotal}' + pointFormatPercentage
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    style: {
                        textShadow: '0 0 3px contrast'
                    }
                }
            }
        },
        series: data
    });
}

