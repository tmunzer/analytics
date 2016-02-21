var periodPolarReq;

function updatePeriod() {

    var dataPeriod, dataAverage;
    var chart = $('#timeline').highcharts();
    var endTime = chart.xAxis[1].categories[max];
    var startTime = chart.xAxis[1].categories[min];
    // @TODO: Current API limitation
    if (endTime - startTime <= 2678400000) {

        showLoading("polar");
        showLoading("storefrontBar");
        showLoading("wifiBar");
        showLoading("uniqueBar");

        periodPolarReq = new Date().getTime();

        $.ajax({
            method: "POST",
            url: "/compare/api/period/",
            data: {
                locations: JSON.stringify(locationAnalytics),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                reqId: periodPolarReq

            }
        }).done(function (data) {
            if (data.error) console.log(data.error);
            else if (data.reqId == periodPolarReq) {
                console.log(data);
                var series = [];
                var locationsSeries = [];
                var storefrontBars = [];
                var engagedBars = [];
                var passersByBars = [];
                var uniqueBars = [];
                var associatedBars = [];
                var unassociatedBars = [];
                var storeFrontClients;

                dataPeriod = data.dataPeriod;
                dataAverage = [
                    data.dataAverage['uniqueClients'],
                    data.dataAverage['engagedClients'],
                    data.dataAverage['passersbyClients'],
                    data.dataAverage['associatedClients'],
                    data.dataAverage['unassociatedClients']
                ];
                if (data.dataAverage['uniqueClients'] == 0) storeFrontClients = 0;
                else storeFrontClients = ((data.dataAverage['engagedClients']/data.dataAverage['uniqueClients'])*100).toFixed(0);

                series.push({
                    type: 'area',
                    color: 'rgba(0, 0, 0, 0.2)',
                    name: "Average",
                    data: dataAverage,
                    pointPlacement: 'on'
                });

                for (var period in dataPeriod) {
                    var dataChart = [
                        dataPeriod[period]['uniqueClients'],
                        dataPeriod[period]['engagedClients'],
                        dataPeriod[period]['passersbyClients'],
                        dataPeriod[period]['associatedClients'],
                        dataPeriod[period]['unassociatedClients']
                    ];

                    series.push({
                        type: 'line',
                        name: dataPeriod[period]['period'],
                        data: dataChart,
                        pointPlacement: 'on'
                    });

                    if (dataPeriod[period]['uniqueClients'] == 0) storeFrontClients = 0;
                    else storeFrontClients = ((dataPeriod[period]['engagedClients']/dataPeriod[period]['uniqueClients'])*100).toFixed(0);

                    locationsSeries.push(dataPeriod[period]['period']);
                    storefrontBars.push(parseInt(storeFrontClients));
                    engagedBars.push(dataPeriod[period]['engagedClients']);
                    passersByBars.push(dataPeriod[period]['passersbyClients']);
                    uniqueBars.push(dataPeriod[period]['uniqueClients']);
                    associatedBars.push(dataPeriod[period]['associatedClients']);
                    unassociatedBars.push(dataPeriod[period]['unassociatedClients']);


                }

                var uniqueClients = [{
                    name: 'Engaged Clients',
                    data: engagedBars
                }, {
                    name: 'Passers By',
                    data: passersByBars
                }];
                var wifiClients  = [{
                    name: 'Associated Clients',
                    data: associatedBars
                }, {
                    name: 'Unassociated Clients',
                    data: unassociatedBars
                }];

                displayLocationPole('polarChart', "", series);
                showData("polar");

                displayBarChart("storefrontBarChart", "", locationsSeries, storefrontBars, true);
                showData("storefrontBar");

                displayStackedBarChart("uniqueBarChart", "", locationsSeries, uniqueClients);
                showData("uniqueBar");


                displayStackedBarChart("wifiBarChart", "", locationsSeries, wifiClients);
                showData("wifiBar");

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