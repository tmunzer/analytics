angular.module('Details').controller("DetailsCtrl", function ($scope, $rootScope, $location, DetailsService) {
    var heatmapUniqueClients, heatmapUniqueClientsRange,
        heatmapEngagedClients, heatmapEngagedClientsRange,
        heatmapPassersbyClients, heatmapPassersbyClientsRange,
        heatmapAssociatedClients, heatmapAssociatedClientsRange,
        heatmapUnassociatedClients, heatmapUnassociatedClientsRange;
    $scope.heatmapChoiceList = {
        'associatedClients': { value: 'associatedClients', title: 'Associated Clients' },
        'engagedClients': { value: 'engagedClients', title: 'Engaged Clients' },
        //'newClients': { value: , range:  , title: 'New Clients', percentage: false },
        'passersbyClients': { value: 'passersbyClients', title: 'Passersby Clients' },
        //'returningClients': { value: , range:  , title: 'Returning Clients', percentage: false },
        //'storefront': { value: , range:  , title: 'Storefront Conversion', percentage: true },
        'unassociatedClients': { value: 'unassociatedClients', title: 'Unassociated Clients' },
        'uniqueClients': { value: 'uniqueClients', title: 'Unique Clients' }
    }
    $scope.heatmapChoice = "uniqueClients";

    $scope.heatmapStarted = false;
    $scope.heatmapLoaded = false;
    $scope.detailsLineStarted = false;
    $scope.detailsLineLoaded = false;



    var lastUpdateRequest;

    $scope.$watch("heatmapChoice", function () {
        if ($scope.heatmapLoaded) {
            var data, range;
            switch ($scope.heatmapChoice) {
                case "associatedClients":
                    data = heatmapAssociatedClients;
                    range = heatmapAssociatedClientsRange;
                    break;
                case "engagedClients":
                    data = heatmapEngagedClients;
                    range = heatmapEngagedClientsRange;
                    break;
                case "passersbyClients":
                    data = heatmapPassersbyClients;
                    range = heatmapPassersbyClientsRange;
                    break;
                case "unassociatedClients":
                    data = heatmapUnassociatedClients;
                    range = heatmapUnassociatedClientsRange;
                    break;
                case "uniqueClients":
                    data = heatmapUniqueClients;
                    range = heatmapUniqueClientsRange;
                    break;
            }
            displayHeatmap(data, range, $scope.heatmapChoiceList[$scope.heatmapChoice].title);
        }
    })
    $rootScope.$watch("date", function (a, b) {
        if ($location.path() == "/details")
            if ($rootScope.date.from != "" && $rootScope.date.to != "") {
                lastUpdateRequest = new Date();
                var currentUpdateRequest = lastUpdateRequest;
                setTimeout(function () {
                    if (currentUpdateRequest == lastUpdateRequest) {
                        updateDetails();
                    }
                }, 2000)
            }
    }, true)


    function updateDetails() {

        $scope.heatmapStarted = true;
        $scope.heatmapLoaded = false;
        $scope.detailsLineStarted = true;
        $scope.detailsLineLoaded = false;

        var endTime = $rootScope.date.to;
        var startTime = $rootScope.date.from;
        var locationAnalytics = $rootScope.selectedLocations;
        if (endTime - startTime <= 2678400000) {
            //line chart
            var lineTime = [];
            var lineUniqueClients = [];
            var lineEngagedClients = [];
            var linePassersbyClients = [];
            var lineAssociatedClients = [];
            var lineUnassociatedClients = [];
            var format, step;
            //heatmap chart
            heatmapUniqueClients = [];
            heatmapEngagedClients = [];
            heatmapPassersbyClients = [];
            heatmapAssociatedClients = [];
            heatmapUnassociatedClients = [];
            heatmapUniqueClientsRange = { min: 0, max: 0 };
            heatmapEngagedClientsRange = { min: 0, max: 0 };
            heatmapPassersbyClientsRange = { min: 0, max: 0 };
            heatmapAssociatedClientsRange = { min: 0, max: 0 };
            heatmapUnassociatedClientsRange = { min: 0, max: 0 };

            switch ($rootScope.period) {
                case "day":
                    format = '{value:%H:%M}';
                    step = 24;
                    break;
                case "week":
                    format = '{value:%m/%d/%y %H:%M}';
                    step = 24;
                    break;
                case "month":
                    format = '{value:%m-%d}';
                    step = 24;
                    break;
                case "year":
                    format = '{value:%m-%Y}';
                    step = 1;
                    break;
            }


            var heatmapTemp = {};
            for (var x = 0; x < 24; x++) {
                if (!heatmapTemp[x]) heatmapTemp[x] = {};
                for (var y = 0; y < 7; y++) {
                    if (!heatmapTemp[x][y]) heatmapTemp[x][y] = {};
                    heatmapTemp[x][y]['numEntries'] = 0;
                    heatmapTemp[x][y]['uniqueClients'] = 0;
                    heatmapTemp[x][y]['engagedClients'] = 0;
                    heatmapTemp[x][y]['passersbyClients'] = 0;
                    heatmapTemp[x][y]['associatedClients'] = 0;
                    heatmapTemp[x][y]['unassociatedClients'] = 0;
                }
            }
            var request = DetailsService.get(startTime, endTime, locationAnalytics);
            request.then(function (promise) {
                if (promise && promise.error) console.log(promise.error);
                else {
                    var time, x, y, numEntries;
                    promise.data.timeseries.forEach(function (currentData) {
                        time = currentData['time'];
                        lineTime.push(new Date(currentData['time']));
                        lineUniqueClients.push(currentData['uniqueClients']);
                        lineEngagedClients.push(currentData['engagedClients']);
                        linePassersbyClients.push(currentData['passersbyClients']);
                        lineAssociatedClients.push(currentData['associatedClients']);
                        lineUnassociatedClients.push(currentData['unassociatedClients']);
                        if (new Date() - new Date(time)) {
                            x = parseInt(time.split("T")[1].split(":")[0]);
                            y = new Date(time).getDay();
                            numEntries = heatmapTemp[x][y]['numEntries'] + 1;
                            heatmapTemp[x][y]['numEntries'] = numEntries;
                            heatmapTemp[x][y]['uniqueClients'] = heatmapTemp[x][y]['uniqueClients'] + currentData['uniqueClients'];
                            heatmapTemp[x][y]['engagedClients'] = heatmapTemp[x][y]['engagedClients'] + currentData['engagedClients'];
                            heatmapTemp[x][y]['passersbyClients'] = heatmapTemp[x][y]['passersbyClients'] + currentData['passersbyClients'];
                            heatmapTemp[x][y]['associatedClients'] = heatmapTemp[x][y]['associatedClients'] + currentData['associatedClients'];
                            heatmapTemp[x][y]['unassociatedClients'] = heatmapTemp[x][y]['unassociatedClients'] + currentData['unassociatedClients'];
                        }

                    });
                    var tempVal = 0;
                    var dayOfTheWeek;
                    for (x = 0; x < 24; x++) {
                        for (y = 0; y < 7; y++) {
                            if (y == 0) dayOfTheWeek = 6;
                            else dayOfTheWeek = y - 1;
                            tempVal = parseInt((heatmapTemp[x][y]['uniqueClients'] / heatmapTemp[x][y]['numEntries']).toFixed(0));
                            heatmapUniqueClients.push([x, dayOfTheWeek, tempVal]);
                            if (tempVal < heatmapUniqueClientsRange.min) heatmapUniqueClientsRange.min = tempVal;
                            if (tempVal > heatmapUniqueClientsRange.max) heatmapUniqueClientsRange.max = tempVal;


                            tempVal = parseInt((heatmapTemp[x][y]['engagedClients'] / heatmapTemp[x][y]['numEntries']).toFixed(0));
                            heatmapEngagedClients.push([x, dayOfTheWeek, tempVal]);
                            if (tempVal < heatmapEngagedClientsRange.min) heatmapEngagedClientsRange.min = tempVal;
                            if (tempVal > heatmapEngagedClientsRange.max) heatmapEngagedClientsRange.max = tempVal;

                            tempVal = parseInt((heatmapTemp[x][y]['passersbyClients'] / heatmapTemp[x][y]['numEntries']).toFixed(0));
                            heatmapPassersbyClients.push([x, dayOfTheWeek, tempVal]);
                            if (tempVal < heatmapPassersbyClientsRange.min) heatmapPassersbyClientsRange.min = tempVal;
                            if (tempVal > heatmapPassersbyClientsRange.max) heatmapPassersbyClientsRange.max = tempVal;

                            tempVal = parseInt((heatmapTemp[x][y]['associatedClients'] / heatmapTemp[x][y]['numEntries']).toFixed(0));
                            heatmapAssociatedClients.push([x, dayOfTheWeek, tempVal]);
                            if (tempVal < heatmapAssociatedClientsRange.min) heatmapAssociatedClientsRange.min = tempVal;
                            if (tempVal > heatmapAssociatedClientsRange.max) heatmapAssociatedClientsRange.max = tempVal;

                            tempVal = parseInt((heatmapTemp[x][y]['unassociatedClients'] / heatmapTemp[x][y]['numEntries']).toFixed(0));
                            heatmapUnassociatedClients.push([x, dayOfTheWeek, tempVal]);
                            if (tempVal < heatmapUnassociatedClientsRange.min) heatmapUnassociatedClientsRange.min = tempVal;
                            if (tempVal > heatmapUnassociatedClientsRange.max) heatmapUnassociatedClientsRange.max = tempVal;
                        }
                    }
                    displayHeatmap(heatmapEngagedClients, heatmapEngagedClientsRange, 'Engaged Clients');
                    displayLineChart(lineTime, lineUniqueClients, lineEngagedClients, linePassersbyClients,
                        lineAssociatedClients, lineUnassociatedClients, format, step);
                }
            });
        }
    }

    function displayHeatmap(data, range, title) {
        Highcharts.chart({
            chart: {
                renderTo: "heatmapChart",
                type: 'heatmap',
                plotBorderWidth: 1,
                height: 350,
                events: {
                    load: function (chart) {
                        setTimeout(function () {
                            chart.target.reflow();
                        });
                    }
                }
            },
            color: "#7a9fb8",
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
        $scope.heatmapLoaded = true;
    }

    function displayLineChart(time, uniqueClients, engagedClients, passersbyClients, associatedClients, unassociatedClients, format, step) {
        var chart = new Highcharts.chart({
            chart: {
                renderTo: "detailsLineChart",
                height: 350,
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
        $scope.detailsLineLoaded = true;

    }
});



angular.module("Details").factory("DetailsService", function ($http, $q) {
    function get(startTime, endTime, locationAnalytics) {
        var canceller = $q.defer();
        var request = $http({
            method: "GET",
            url: "/api/details/clienttimeseries/",
            params: {
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
        get: get
    }
});