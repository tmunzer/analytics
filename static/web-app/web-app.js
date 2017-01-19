angular.module('Dashboard', []);
angular.module('Compare', []);
angular.module("Details", []);
angular.module("Modals", []);
var analytics = angular.module("analytics", [
    "ngRoute",
    'ngSanitize',
    'ngMaterial',
    'ngMessages',
    'md.data.table',
    'Dashboard',
    'Compare',
    'Details',
    'Modals',
    'highcharts-ng',
    'pascalprecht.translate'
]);

analytics
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("blue", {
                'default': '600'
            })
            .accentPalette('green', {
                'default': '400' // by default use shade 400 from the pink palette for primary intentions
            });
    }).config(['$httpProvider', function ($httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors

        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    }]).config(function ($translateProvider) {
        $translateProvider.useMissingTranslationHandlerLog();
        $translateProvider
            .translations('en', en)
            .registerAvailableLanguageKeys(['en'], {
                'en_*': 'en',
                '*': 'en'
            })
            .determinePreferredLanguage()
            .fallbackLanguage('en')
            .usePostCompiling(true)
            .useSanitizeValueStrategy("escapeParameters");

    });

analytics.controller("UserCtrl", function ($scope, $rootScope, $mdDialog, $mdSidenav, $location, $translate) {
    var originatorEv;

    this.openMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };
    this.sideNav = function (id) {
        $mdSidenav(id).toggle()
    };
    this.showFab = function () {
        var haveFab = ["/dashboard", "/compare", "/details"];
        return (haveFab.indexOf($location.path().toString()) > -1);
    };
});

analytics.controller("HeaderCtrl", function ($scope, $location) {
    $scope.appDetails = {};

    $scope.nav = {};
    $scope.nav.isActive = function (path) {
        if (path === $location.path().toString().split("/")[1]) return true;
        else return false;
    };
    $scope.subnav = {};
    $scope.subnav.isActive = function (path) {
        if (path === $location.path().toString().split("/")[2]) return true;
        else return false;
    };

});

analytics.controller("TimelineCtrl", function ($scope, TimelineService) {
    var request;
    $scope.date = {
        from: "",
        to: ""
    }
    $scope.range=0;
    $scope.locationAnalytics;
    function updateTimeline() {
        //if ($('#timeline').highcharts()) $('#timeline').highcharts().destroy();
        var endTime = new Date(new Date().toISOString().replace(/:[0-9]{2}:[0-9]{2}\.[0-9]{3}/, ":00:00.000"));
        var startTime = new Date(endTime);
        var selectedRange, step, format;
    
        switch ($scope.range) {
            case 0:
                startTime.setDate(startTime.getDate() - 1);
                selectedRange = 24;
                step = 24;
                format = '{value:%H:%M}';
                break;
            case 1:
                startTime.setDate(startTime.getDate() - 7);
                selectedRange = 24;
                step = 24;
                format = '{value:%Y-%m-%d}';
                break;
            case 2:
                startTime.setMonth(startTime.getMonth() - 1);
                selectedRange = 7;
                step = 7;
                format = '{value:%Y-%m-%d}';
                break;
            case 3:
                startTime.setFullYear(startTime.getFullYear() - 1);
                selectedRange = 30;
                step = 30;
                format = '{value:%m-%Y}';
                break;
        }
        timelineReq = new Date().getTime();
        request = TimelineService.get(
            startTime,
            endTime,
            $scope.locationAnalytics,
            timelineReq
        );

        request.then(function (promise) {
            if (promise && promise.error) apiWarning(promise.error);
            else if (data.reqId == timelineReq) {
                var maxChart = 0;
                var time = [];
                var chart = [];
                for (var x in data.data) {
                    time[x] = new Date(data.data[x]['time']);
                    chart[x] = data.data[x]['uniqueClients'];
                    if (chart[x] > maxChart) maxChart = chart[x];
                }
                // Create the chart
                Highcharts.setOptions({
                    global: {
                        useUTC: true
                    }
                });
                window.chart = new Highcharts.StockChart({
                    chart: {
                        renderTo: 'timeline',
                        backgroundColor: 'rgb(255,255,255)',
                        height: 150,
                        spacing: 25,
                        spacingBottom: 25
                        /*events: {
                            redraw: function () {
                                $("#span-from-date").html(displayDate(this.xAxis[1].categories[(this.xAxis[0].getExtremes().min).toFixed(0)]));
                                $("#span-to-date").html(displayDate(this.xAxis[1].categories[(this.xAxis[0].getExtremes().max).toFixed(0)]));
                            }
                        }*/
                    },
                    rangeSelector: {
                        enabled: false
                    },
                    tooltip: {
                        enabled: false
                    },
                    title: {
                        text: ''
                    },
                    yAxis: {
                        height: 0,
                        gridLineWidth: 0,
                        labels: {
                            enabled: false
                        }
                    },
                    xAxis: {
                        lineWidth: 0,
                        tickLength: 0,
                        range: selectedRange,
                        labels: {
                            enabled: false
                        },
                        minRange: 1
                    },
                    scrollbar: {
                        enabled: false
                    },
                    navigator: {
                        maskFill: 'rgba(255, 255, 255, 0.70)',
                        maskInside: false,
                        height: 100,
                        handles: {
                            backgroundColor: 'white',
                            borderColor: 'black'
                        },
                        xAxis: {
                            tickPosition: "outside",
                            range: selectedRange,
                            tickInterval: step,
                            categories: time,
                            labels: {
                                y: 15,
                                format: format
                            }

                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: 'Unique Clients'
                            },
                            units: [0, maxChart]
                        }
                    },
                    series: [{
                        data: chart
                    }]
                });
            }
            chart = $('#timeline').highcharts();
            max = chart.xAxis[0].getExtremes().max;
            min = chart.xAxis[0].getExtremes().min;
            $scope.date.from = chart.xAxis[1].categories[min];
            $scope.date.to = chart.xAxis[1].categories[max];
            updateCharts();
        });
    }



    function changeRange(period, range) {
        var step, chart;
        //set the step depending on the graph range
        if (period == "Day") step = 12;
        else if (period == "Week") step = 24;
        else if (period == "Month") step = 1;
        else if (period == "Year") step = 30;
        //change the selected button
        $(".timeline-range").removeClass("entity-radioset-cur");
        $("#timeline-" + range).addClass("entity-radioset-cur");
        //get the chart selector
        chart = $('#timeline').highcharts();
        // retrieve the max value
        max = chart.xAxis[0].getExtremes().dataMax;
        //if 0 (max range) retrive the min value
        if (range == 0) min = chart.xAxis[0].getExtremes().dataMin;
        //or calculate the value depending on the range and the step
        else min = max - (range * step);
        chart.xAxis[0].setExtremes(min, max);
        $("#span-from-date").html(displayDate(chart.xAxis[1].categories[min]));
        $("#span-to-date").html(displayDate(chart.xAxis[1].categories[max]));
        updateCharts();

    }

    function getHourAndMinutes(date) {
        var hour = addZero(date.getHours());
        var minutes = addZero(date.getMinutes());
        return hour + ":" + minutes

    }
    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    $scope.displayDate = function () {
        return $scope.date.toDateString() + ', ' + addZero(date.getHours()) + ":" + addZero(date.getMinutes());
    }
    updateTimeline();
})




angular.module('analytics').factory("TimelineService", function ($http, $q) {
    function get(startTime, endTime, locationAnalytics, timelineReq) {
        var canceller = $q.defer();
        var request = $http({
            url: '/api/common/timeline/',
            method: "POST",
            data: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                locations: JSON.stringify(locationAnalytics),
                reqId: timelineReq
            },
            timeout: canceller.promise
        });
        return httpReq(request);
    };


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