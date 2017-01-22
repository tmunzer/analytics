angular.module('Dashboard').controller("DashboardCtrl", function ($scope, $rootScope, CardsService) {
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

    $rootScope.$watch("selectedLocations", function () {
        if ($rootScope.locations) {
            updateCards();
        }
    })
    $rootScope.$watch("locations", function () {
        if ($rootScope.locations) {
            updateCards();
        }
    })

    function updateCards() {
        var data = {};
        if ($rootScope.selectedLocations.length > 0) data = { locations: JSON.stringify($rootScope.selectedLocations) };
        var request = CardsService.update(data);
        request.then(function (promise) {
            if (promise && promise.error) {
                console.log(promise.error);
                $scope.maps.folder = "X";
                $scope.maps.buildings = "X";
                $scope.maps.floors = "X";
                $scope.devices.sensors = "X";
                $scope.devices.connected = "X";
                $scope.devices.devices = "X";
            } else {
                $scope.maps.folder = promise.data.locationsCount.folder;
                $scope.maps.buildings = promise.data.locationsCount.building;
                $scope.maps.floors = promise.data.locationsCount.floor;
                $scope.devices.sensors = promise.data.devicesCount.sensor;
                $scope.devices.connected = promise.data.devicesCount.connected;
                $scope.devices.devices = promise.data.devicesCount.count;
            }
        })

    }
});



angular.module('Dashboard').factory("CardsService", function ($http, $q) {

    function update(locations) {
        var canceller = $q.defer();
        var request = $http({
            method: "POST",
            url: "/dashboard/api/update/cards/",
            data: locations,
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function httpReq(request) {
        var promise = request.then(
            function (response) {
                return response;
            },
            function (response) {
                return { error: response.data };
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }


    return {
        update: update
    }
});

angular.module('Dashboard').controller("WidgetCtrl", function ($scope, $rootScope, WidgetService) {
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

    var lastUpdateRequest;

    $rootScope.$watch("date", function (a, b) {
        console.log($rootScope.date);
        if ($rootScope.date.from != "" && $rootScope.date.to != "") {
            lastUpdateRequest = new Date();
            var currentUpdateRequest = lastUpdateRequest;
            setTimeout(function () {
                if (currentUpdateRequest == lastUpdateRequest) {
                    updateWidgets();
                }
            }, 2000)
        }
    }, true)
    $rootScope.$watch("timelineLoaded", function (a, b) {
        lastUpdateRequest = new Date();
        var currentUpdateRequest = lastUpdateRequest;
        setTimeout(function () {
            if (currentUpdateRequest == lastUpdateRequest)
                if ($rootScope.timelineLoaded == true) updateWidgets();
        }, 500)
    });

    function getStoreFront(engaged, uniqueClient) {
        if (uniqueClient == 0) return 0;
        else return parseInt(((engaged / uniqueClient) * 100).toFixed(0));
    }

    function getPercentage(num1, num2) {
        if (num2 == 0) return null;
        else return (((num1 - num2) / num2) * 100).toFixed(0);
    }
    $scope.getTrendPercentage = function (percentage) {
        if (!percentage) return "N/A";
        if (percentage < 0) return percentage + "%";
        else if (percentage > 0) return "+" + percentage + "%";
        else return "+" + percentage + "%";
    }
    $scope.getTrendColor = function (percentage) {
        if (parseInt(percentage) < 0) return "{'color': '#dd2c00'}";
        else if (percentage > 0) return "{'color': '#5ea962'}";
        else if (percentage == 0) return "{'color': '#ffffff'}";
        else return "{'color': '#969696'}";
    }
    $scope.getTrendIcon = function (percentage) {
        if (percentage < 0) return "trending_down";
        else if (percentage > 0) return "trending_up";
        else if (percentage == 0) return "trending_flat";
        else return "";
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
        var endTime = $rootScope.date.to;
        var startTime = $rootScope.date.from;
        // @TODO: Current API limitation
        if (endTime - startTime <= 2678400000) {

            var request = WidgetService.update(startTime, endTime, $rootScope.selectedLocations);
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

                    $scope.passersByLoaded = true;
                    displayWidgetChart("passersByChart", "Number of PassersBy Clients", xAxisData, dataPassersBy);
                    $scope.passersByWeek = getPercentage(data.dataNow.passersbyClients, data.dataLastWeek.passersbyClients);
                    $scope.passersByMonth = getPercentage(data.dataNow.passersbyClients, data.dataLastMonth.passersbyClients);
                    $scope.passersByYear = getPercentage(data.dataNow.passersbyClients, data.dataLastYear.passersbyClients);

                    $scope.engagedLoaded = true;
                    displayWidgetChart("engagedChart", "Number of Engaged Clients", xAxisData, dataEngaged);
                    $scope.engagedWeek = getPercentage(data.dataNow.engagedClients, data.dataLastWeek.engagedClients);
                    $scope.engagedMonth = getPercentage(data.dataNow.engagedClients, data.dataLastMonth.engagedClients);
                    $scope.engagedYear = getPercentage(data.dataNow.engagedClients, data.dataLastYear.engagedClients);

                    $scope.storeFrontLoaded = true;
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

                    $scope.newClientsLoaded = true;
                    displayWidgetChart("newClientsChart", "Number of New Clients", xAxisData, dataNewClients);
                    $scope.newClientsWeek = getPercentage(data.dataNow.newClients, data.dataLastWeek.newClients);
                    $scope.newClientsMonth = getPercentage(data.dataNow.newClients, data.dataLastMonth.newClients);
                    $scope.newClientsYear = getPercentage(data.dataNow.newClients, data.dataLastYear.newClients);

                    $scope.returningClientsLoaded = true;
                    displayWidgetChart("returningClientsChart", "Number of Returning Clients", xAxisData, dataReturningClients);
                    $scope.returningClientsWeek = getPercentage(data.dataNow.returningClients, data.dataLastWeek.returningClients);
                    $scope.returningClientsMonth = getPercentage(data.dataNow.returningClients, data.dataLastMonth.returningClients);
                    $scope.returningClientsYear = getPercentage(data.dataNow.returningClients, data.dataLastYear.returningClients);

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
});

angular.module("Dashboard").factory("WidgetService", function ($http, $q) {
    function update(startTime, endTime, locationAnalytics) {
        var canceller = $q.defer();
        var request = $http({
            method: 'POST',
            url: '/dashboard/api/update/widgets/',
            data: {
                startTime: startTime,
                endTime: endTime,
                locations: locationAnalytics
            },
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function httpReq(request) {
        var promise = request.then(
            function (response) {
                return response;
            },
            function (response) {
                return { error: response.data };
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }


    return {
        update: update
    }
});