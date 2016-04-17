var locationPolarReq;
function updatePolarAndBars() {
    var dataLocation, dataAverage;
    var chart = $('#timeline').highcharts();
    var endTime = chart.xAxis[1].categories[max];
    var startTime = chart.xAxis[1].categories[min];
    // @TODO: Current API limitation
    if (endTime - startTime <= 2678400000) {

        showLoading("polar");
        showLoading("visitorsVsEngagedBar");
        showLoading("visitorsVsEngagedCountBar");
        showLoading("wifiBar");
        showLoading("wifiCountBar");
        showLoading("loyaltyBar");
        showLoading("loyaltyCountBar");

        locationPolarReq = new Date().getTime();
        $.ajax({
            method: 'POST',
            url: '/compare/api/location/polar/',
            data: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                filterFolder: filterFolder,
                locations: JSON.stringify(locationAnalytics),
                reqId: locationPolarReq
            }
        }).done(function (data) {
            if (data.error) displayModal("API", data.error);
            else if (data.reqId == locationPolarReq) {
                var series = [];
                var locationsSeries = [];

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

                var storeFrontClients;
                var bestLocations;

                // calculate average values for the polar chart
                dataLocation = data.dataLocation;
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
                else storeFrontClients = ((data.dataAverage['engagedClients']/data.dataAverage['uniqueClients'])*100).toFixed(0);

                series.push({
                    type: 'area',
                    color: 'rgba(0, 0, 0, 0.2)',
                    name: "Average",
                    data: dataAverage,
                    pointPlacement: 'on'
                });

                // calculate the best/worst locations
                bestLocations = {
                    storefront: {
                        best: "",
                        bestValue: null,
                        worst: "",
                        worstValue: null
                    },
                    passersBy: {
                        best: "",
                        bestValue: null,
                        worst: "",
                        worstValue: null
                    },
                    visitors: {
                        best: "",
                        bestValue: null,
                        worst: "",
                        worstValue: null
                    },
                    wifi: {
                        best: "",
                        bestValue: null,
                        worst: "",
                        worstValue: null
                    },
                    new: {
                        best: "",
                        bestValue: null,
                        worst: "",
                        worstValue: null
                    },
                    returning: {
                        best: "",
                        bestValue: null,
                        worst: "",
                        worstValue: null
                    }
                };

                // loop over each locations
                dataLocation.forEach(function(currentLocation){
                    var dataPolarChart = [
                        currentLocation['uniqueClients'],
                        currentLocation['engagedClients'],
                        currentLocation['passersbyClients'],
                        currentLocation['associatedClients'],
                        currentLocation['unassociatedClients'],
                        currentLocation['newClients'],
                        currentLocation['returningClients']
                    ];

                    series.push({
                        type: 'line',
                        name: currentLocation.name,
                        data: dataPolarChart,
                        pointPlacement: 'on'
                    });


                    if (currentLocation['uniqueClients'] == 0) {
                        engaged = 0;
                        passersBy = 0;
                        associated = 0;
                        unassociated = 0;
                        newClients = 0;
                        returningClients = 0;
                    }
                    else {
                        engaged = ((currentLocation['engagedClients']/currentLocation['uniqueClients'])*100).toFixed(0);
                        passersBy = ((currentLocation['passersbyClients']/currentLocation['uniqueClients'])*100).toFixed(0);
                        associated = ((currentLocation['associatedClients']/currentLocation['uniqueClients'])*100).toFixed(0);
                        unassociated = ((currentLocation['unassociatedClients']/currentLocation['uniqueClients'])*100).toFixed(0);
                        newClients = ((currentLocation['newClients']/currentLocation['uniqueClients'])*100).toFixed(0);
                        returningClients = ((currentLocation['returningClients']/currentLocation['uniqueClients'])*100).toFixed(0);
                    }

                    locationsSeries.push(currentLocation.name);

                    engagedBars.push(parseInt(engaged));
                    passersByBars.push(parseInt(passersBy));
                    engagedCountBars.push(currentLocation['engagedClients']);
                    passersByCountBars.push(currentLocation['passersbyClients']);

                    associatedBars.push(parseInt(associated));
                    unassociatedBars.push(parseInt(unassociated));
                    associatedCountBars.push(currentLocation['associatedClients']);
                    unassociatedCountBars.push(currentLocation['unassociatedClients']);

                    newBars.push(parseInt(newClients));
                    returningBars.push(parseInt(returningClients));
                    newCountBars.push(currentLocation['newClients']);
                    returningCountBars.push(currentLocation['returningClients']);

                    if (bestLocations.storefront.bestValue == null || bestLocations.storefront.bestValue < parseInt(storeFrontClients)){
                        bestLocations.storefront.bestValue = parseInt(storeFrontClients);
                        bestLocations.storefront.best = currentLocation.name;
                    } else if (bestLocations.storefront.worstValue == null || bestLocations.storefront.worstValue > parseInt(storeFrontClients)) {
                        bestLocations.storefront.worstValue = parseInt(storeFrontClients);
                        bestLocations.storefront.worst = currentLocation.name;
                    }
                    if (bestLocations.passersBy.bestValue == null || bestLocations.passersBy.bestValue < currentLocation['passersbyClients']){
                        bestLocations.passersBy.bestValue =currentLocation['passersbyClients'];
                        bestLocations.passersBy.best = currentLocation.name;
                    } else if (bestLocations.passersBy.worstValue == null || bestLocations.passersBy.worstValue > currentLocation['passersbyClients']) {
                        bestLocations.passersBy.worstValue = currentLocation['passersbyClients'];
                        bestLocations.passersBy.worst = currentLocation.name;
                    }
                    if (bestLocations.visitors.bestValue == null || bestLocations.visitors.bestValue < currentLocation['engagedClients']){
                        bestLocations.visitors.bestValue = currentLocation['engagedClients'];
                        bestLocations.visitors.best = currentLocation.name;
                    } else if (bestLocations.visitors.worstValue == null || bestLocations.visitors.worstValue > currentLocation['engagedClients']) {
                        bestLocations.visitors.worstValue = currentLocation['engagedClients'];
                        bestLocations.visitors.worst = currentLocation.name;
                    }
                    if (bestLocations.wifi.bestValue == null || bestLocations.wifi.bestValue < currentLocation['associatedClients']){
                        bestLocations.wifi.bestValue = currentLocation['associatedClients'];
                        bestLocations.wifi.best = currentLocation.name;
                    } else if (bestLocations.wifi.worstValue == null || bestLocations.wifi.worstValue > currentLocation['associatedClients']) {
                        bestLocations.wifi.worstValue = currentLocation['associatedClients'];
                        bestLocations.wifi.worst = currentLocation.name;
                    }
                    if (bestLocations.wifi.bestValue == null || bestLocations.wifi.bestValue < currentLocation['associatedClients']){
                        bestLocations.wifi.bestValue = currentLocation['associatedClients'];
                        bestLocations.wifi.best = currentLocation.name;
                    } else if (bestLocations.wifi.worstValue == null || bestLocations.wifi.worstValue > currentLocation['associatedClients']) {
                        bestLocations.wifi.worstValue = currentLocation['associatedClients'];
                        bestLocations.wifi.worst = currentLocation.name;
                    }
                    if (bestLocations.new.bestValue == null || bestLocations.new.bestValue < currentLocation['newClients']){
                        bestLocations.new.bestValue = currentLocation['newClients'];
                        bestLocations.new.best = currentLocation.name;
                    } else if (bestLocations.returning.worstValue == null || bestLocations.returning.worstValue > currentLocation['newClients']) {
                        bestLocations.new.worstValue = currentLocation['newClients'];
                        bestLocations.new.worst = currentLocation.name;
                    }
                    if (bestLocations.returning.bestValue == null || bestLocations.returning.bestValue < currentLocation['returningClients']){
                        bestLocations.returning.bestValue = currentLocation['returningClients'];
                        bestLocations.returning.best = currentLocation.name;
                    } else if (bestLocations.returning.worstValue == null || bestLocations.returning.worstValue > currentLocation['returningClients']) {
                        bestLocations.returning.worstValue = currentLocation['returningClients'];
                        bestLocations.returning.worst = currentLocation.name;
                    }
                });
                console.log(bestLocations);
                $("#storefrontBest").html(bestLocations.storefront.best);
                $("#storefrontWorst").html(bestLocations.storefront.worst);
                $("#passersByBest").html(bestLocations.passersBy.best);
                $("#passersByWorst").html(bestLocations.passersBy.worst);
                $("#visitorsBest").html(bestLocations.visitors.best);
                $("#visitorsWorst").html(bestLocations.visitors.worst);
                $("#wifiBest").html(bestLocations.wifi.best);
                $("#wifiWorst").html(bestLocations.wifi.worst);
                $("#newBest").html(bestLocations.new.best);
                $("#newWorst").html(bestLocations.new.worst);
                $("#returningBest").html(bestLocations.returning.best);
                $("#returningWorst").html(bestLocations.returning.worst);


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
                'unassociatedClients', 'newClients', 'returningClients'],
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