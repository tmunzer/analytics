angular.module('Dashboard').controller("DashboardCtrl", function ($scope, $location, CardsService, LocationsService) {
    LocationsService.compareLocations.set(false);
    $scope.selected = LocationsService.selected;
    $scope.locations = LocationsService.locations;

    $scope.maps = {
        folders: 0,
        buildings: 0,
        floors: 0
    }
    $scope.devices = {
        devices: 0,
        connected: 0,
        sensors: 0
    }
    var updateCardsRequest;

    // update the cards when the locations are loaded
    $scope.$watch("locations.isReady()", function () {
        if ($location.path() == "/dashboard")
            if ($scope.locations.isReady()) {
                updateCardsRequest = new Date();
                var currentUpdateRequest = updateCardsRequest;
                setTimeout(function () {
                    if (currentUpdateRequest == updateCardsRequest) {
                        updateCards();
                    }
                }, 200)
            }
    })
    // update the cards when the selected locations change
    $scope.$watch("selected.get()", function () {
        if ($location.path() == "/dashboard")
            if (LocationsService.locations.isReady()) {
                updateCardsRequest = new Date();
                var currentUpdateRequest = updateCardsRequest;
                setTimeout(function () {
                    if (currentUpdateRequest == updateCardsRequest) {
                        updateCards();
                    }
                }, 200)
            }
    })


    function updateCards() {
        var data = {};
        if (LocationsService.selected.get().length > 0) data = { locations: LocationsService.checked.get() };
        var request = CardsService.update(data);
        request.then(function (promise) {
            if (promise && promise.error) {
                $scope.maps.folders = "X";
                $scope.maps.buildings = "X";
                $scope.maps.floors = "X";
                $scope.devices.sensors = "X";
                $scope.devices.connected = "X";
                $scope.devices.devices = "X";
            } else {
                $scope.maps.folders = promise.data.locationsCount.folder;
                $scope.maps.buildings = promise.data.locationsCount.building;
                $scope.maps.floors = promise.data.locationsCount.floor;
                $scope.devices.sensors = promise.data.devicesCount.sensor;
                $scope.devices.connected = promise.data.devicesCount.connected;
                $scope.devices.devices = promise.data.devicesCount.count;
            }
        })

    }
});


angular.module('Dashboard').controller("WidgetCtrl", function ($scope, $location, $sce, TimelineService, LocationsService, DashboardChartsService) {

    $scope.date = TimelineService.date;
    $scope.timeline = TimelineService.timeline;

    $scope.topLocationStarted = false;
    $scope.passersByStarted = false;
    $scope.engagedStarted = false;
    $scope.storeFrontStarted = false;
    $scope.newClientsStarted = false;
    $scope.returningClientsStarted = false;
    $scope.topLocationLoaded = false;
    $scope.passersByLoaded = false;
    $scope.engagedLoaded = false;
    $scope.storeFrontLoaded = false;
    $scope.newClientsLoaded = false;
    $scope.returningClientsLoaded = false;

    $scope.topLocationsChart = "storefront";

    $scope.topLocationsChoices = {
        'associatedClients': { value: 'associatedClients', title: 'Associated Clients', percentage: false },
        'engagedClients': { value: 'engagedClients', title: 'Engaged Clients', percentage: false },
        'newClients': { value: 'newClients', title: 'New Clients', percentage: false },
        'passersbyClients': { value: 'passersbyClients', title: 'Passersby Clients', percentage: false },
        'returningClients': { value: 'returningClients', title: 'Returning Clients', percentage: false },
        'storefront': { value: 'storefront', title: 'Storefront Conversion', percentage: true },
        'unassociatedClients': { value: 'unassociatedClients', title: 'Unassociated Clients', percentage: false },
        'uniqueClients': { value: 'uniqueClients', title: 'Unique Clients', percentage: false }
    }
    var lastUpdateRequest;
    var topLocations = {};

    // update the charts when the dates (from and to) change
    $scope.$watch("date.get()", function () {
        if ($location.path() == "/dashboard")
            if ($scope.date.isReady()) {
                $scope.topLocationLoaded = false;
                $scope.passersByLoaded = false;
                $scope.engagedLoaded = false;
                $scope.storeFrontLoaded = false;
                $scope.newClientsLoaded = false;
                $scope.returningClientsLoaded = false;
                lastUpdateRequest = new Date();
                var currentUpdateRequest = lastUpdateRequest;
                setTimeout(function () {
                    if (currentUpdateRequest == lastUpdateRequest) {
                        updateWidgets();
                        updateTopLocation();
                    }
                }, 2000)
            }
    }, true)


    $scope.$watch("topLocationsChart", function () {
        var choice = $scope.topLocationsChart;
        displayTopLocation($scope.topLocationsChoices[choice].value, $scope.topLocationsChoices[choice].title, $scope.topLocationsChoices[choice].percentage);
    })

    function getStoreFront(engaged, uniqueClient) {
        if (uniqueClient == 0) return 0;
        else return parseInt(((engaged / uniqueClient) * 100).toFixed(0));
    }
    function getPercentage(num1, num2) {
        if (num2 == 0) return null;
        else return (((num1 - num2) / num2) * 100).toFixed(0);
    }
    function getTrendPercentage(percentage) {
        if (!percentage) return "N/A";
        if (percentage < 0) return percentage + "%";
        else if (percentage > 0) return "+" + percentage + "%";
        else return "+" + percentage + "%";
    }
    function getTrendColor(percentage) {
        if (parseInt(percentage) < 0) return "rgb(221,41,0)";
        else if (percentage > 0) return "#5ea962";
        else if (percentage == 0) return "#000000";
        else return "#969696";
    }
    function getTrendIcon(percentage) {
        if (percentage < 0) return "trending_down";
        else if (percentage > 0) return "trending_up";
        else if (percentage == 0) return "trending_flat";
        else return "";
    }
    $scope.getTrendHtml = function (percentage) {
        var htmlString = '<span class="num-indicator widget-number" style="color: ' + getTrendColor(percentage) + '">' +
            '<i class="material-icons" style="vertical-align: middle;">' + getTrendIcon(percentage) + '</i>' +
            '<span>' + getTrendPercentage(percentage) + '</span>' +
            '</span>';
        return $sce.trustAsHtml(htmlString);
    }

    function updateWidgets() {
        $scope.topLocationStarted = true;
        $scope.passersByStarted = true;
        $scope.engagedStarted = true;
        $scope.storeFrontStarted = true;
        $scope.newClientsStarted = true;
        $scope.returningClientsStarted = true;
        $scope.topLocationLoaded = false;
        $scope.passersByLoaded = false;
        $scope.engagedLoaded = false;
        $scope.storeFrontLoaded = false;
        $scope.newClientsLoaded = false;
        $scope.returningClientsLoaded = false;
        var endTime = $scope.date.get().to;
        var startTime = $scope.date.get().from;
        // @TODO: Current API limitation
        if (endTime - startTime <= 2678400000) {

            var request = DashboardChartsService.widgets(startTime, endTime, LocationsService.selected.get());
            request.then(function (promise) {
                if (promise && promise.error) console.log(promise.error);
                else {
                    var data = promise.data;
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


                    displayWidgetChart("passersByChart", "Number of PassersBy Clients", xAxisData, dataPassersBy);
                    $scope.passersByWeek = getPercentage(data.dataNow.passersbyClients, data.dataLastWeek.passersbyClients);
                    $scope.passersByMonth = getPercentage(data.dataNow.passersbyClients, data.dataLastMonth.passersbyClients);
                    $scope.passersByYear = getPercentage(data.dataNow.passersbyClients, data.dataLastYear.passersbyClients);
                    $scope.passersByLoaded = true;

                    displayWidgetChart("engagedChart", "Number of Engaged Clients", xAxisData, dataEngaged);
                    $scope.engagedWeek = getPercentage(data.dataNow.engagedClients, data.dataLastWeek.engagedClients);
                    $scope.engagedMonth = getPercentage(data.dataNow.engagedClients, data.dataLastMonth.engagedClients);
                    $scope.engagedYear = getPercentage(data.dataNow.engagedClients, data.dataLastYear.engagedClients);
                    $scope.engagedLoaded = true;

                    displayWidgetChart("storeFrontChart", "StoreFront Conversion", xAxisData, dataStoreFront, true);
                    $scope.storeFrontWeek = getPercentage(
                        getStoreFront(data.dataNow.engagedClients, data.dataNow.uniqueClients),
                        getStoreFront(data.dataLastWeek.engagedClients, data.dataLastWeek.uniqueClients)
                    );
                    $scope.storeFrontMonth = getPercentage(
                        getStoreFront(data.dataNow.engagedClients, data.dataNow.uniqueClients),
                        getStoreFront(data.dataLastMonth.engagedClients, data.dataLastMonth.uniqueClients)
                    );
                    $scope.storeFrontYear = getPercentage(
                        getStoreFront(data.dataNow.engagedClients, data.dataNow.uniqueClients),
                        getStoreFront(data.dataLastYear.engagedClients, data.dataLastYear.uniqueClients)
                    );
                    $scope.storeFrontLoaded = true;

                    displayWidgetChart("newClientsChart", "Number of New Clients", xAxisData, dataNewClients);
                    $scope.newClientsWeek = getPercentage(data.dataNow.newClients, data.dataLastWeek.newClients);
                    $scope.newClientsMonth = getPercentage(data.dataNow.newClients, data.dataLastMonth.newClients);
                    $scope.newClientsYear = getPercentage(data.dataNow.newClients, data.dataLastYear.newClients);
                    $scope.newClientsLoaded = true;

                    displayWidgetChart("returningClientsChart", "Number of Returning Clients", xAxisData, dataReturningClients);
                    $scope.returningClientsWeek = getPercentage(data.dataNow.returningClients, data.dataLastWeek.returningClients);
                    $scope.returningClientsMonth = getPercentage(data.dataNow.returningClients, data.dataLastMonth.returningClients);
                    $scope.returningClientsYear = getPercentage(data.dataNow.returningClients, data.dataLastYear.returningClients);
                    $scope.returningClientsLoaded = true;
                }
            })
        }
    }


    function displayWidgetChart(container, title, xAxisData, data, percentage) {
        var yAxisTitle, pointFormatPercentage;
        if (percentage) {
            yAxisTitle = "% of Devices";
            pointFormatPercentage = "%";
        } else {
            yAxisTitle = 'Number of devices';
            pointFormatPercentage = "";
        }
        var chart = new Highcharts.chart({
            chart: {
                renderTo: container,
                type: 'column',
                height: 250,
                events: {
                    load: function (chart) {
                        setTimeout(function () {
                            chart.target.reflow();
                        });
                    }
                }
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


    function updateTopLocation() {

        var endTime = $scope.date.get().to;
        var startTime = $scope.date.get().from;
        // @TODO: Current API limitation
        if (endTime - startTime <= 2678400000) {

            $scope.topLocationStarted = true;
            $scope.topLocationLoaded = false;
            var request = DashboardChartsService.topLocations(startTime, endTime, LocationsService.selected.get());
            request.then(function (promise) {
                if (promise && promise.error) console.log(promise.error);
                else {
                    topLocations = promise.data.topLocations;
                    displayTopLocation("storefront", 'Storefront Conversion', true);
                    $scope.topLocationLoaded = true;
                }
            })
        }
    }

    function displayTopLocation(param, title, percentage) {
        /*$("#button-bestLocation").html(title);
        switch (param) {
            case 'associatedClients':
                $("#help-bestLocation").html("Number of clients that were associated with the network over the given time interval.");
                break;
            case 'engagedClients':
                $("#help-bestLocation").html("Number of clients that were engaged over the time interval.");
                break;
            case 'passersbyClients':
                $("#help-bestLocation").html("Number of clients that were determined to be passersby over the time interval.");
                break;
            case 'storeFrontClients':
                $("#help-bestLocation").html("Percentage of clients seen outside that come into your store.");
                break;
            case 'unassociatedClients':
                $("#help-bestLocation").html("The number of clients not associated with the network over the given time interval.");
                break;
            case 'uniqueClients':
                $("#help-bestLocation").html("The number of unique clients over the time interval.");
                break;
        }*/
        var xAxisData = [];
        var data = [];
        var sortable = [];

        for (var locNum in topLocations) {
            sortable.push([topLocations[locNum]['name'], topLocations[locNum][param]]);
        }
        sortable.sort(function (a, b) { return b[1] - a[1] });

        for (var i = 0; i < 5; i++) {
            if (sortable[i]) {
                xAxisData.push(sortable[i][0]);
                data.push(parseInt(sortable[i][1]));
            } else {
                xAxisData.push("");
                data.push(0);
            }
        }
        displayWidgetChart("topLocationChart", title, xAxisData, data, percentage);

    }
});
