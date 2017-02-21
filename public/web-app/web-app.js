angular.module("Charts", []);
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
    'Charts',
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

analytics.controller("LocationCtrl", function ($scope, $rootScope, $location, LocationsService) {

    $rootScope.compareLocations = false;
    $scope.locationsSelected = LocationsService.selected.get();
    var lastUpdateRequest;


    $scope.locationTypeEnable = function (location) {
        if (location) {
            if ($scope.compareLocations == false) return false;
            else return location.folderType != $rootScope.locationFilter;
        }
    }
    $scope.$watch("locationFilter", function () {
        LocationsService.filter.set($scope.locationFilter);
    })

    $scope.locationsIcon = function (folder) {
        if (folder && folder.folderType == "GENERIC") return "map";
        else if (folder && folder.folderType == "BUILDING") return "business";
        else if (folder && folder.folderType == "FLOOR") return "layers";
    }

    //called when a checkbox is clicked
    $scope.toggle = function (item) {
        var idChecked = LocationsService.checked.get().indexOf(item.id);
        // if the user just unchecked the box
        if (idChecked > -1) {
            // uncheck the box
            LocationsService.checked.del(item.id);
            // uncheck the parent boxes and remove the id from the location filter list if needed
            uncheckParents(item);
        }
        // if the user just checked the box
        else {
            LocationsService.checked.add(item.id);
            if ($location.path() != "/compare" || $rootScope.compare != "locations")
                checkChilds(item);
        }
        // update the list of selected locations
        LocationsService.selected.refresh();

        $scope.locationsSelected = LocationsService.selected.get();
    };


    function checkChilds(item) {
        item.folders.forEach(function (folder) {
            var idChecked = LocationsService.checked.get().indexOf(folder.id);
            // check the box for childs
            if (idChecked < 0) LocationsService.checked.add(folder.id);
            // if child folders, do the same
            if (folder.folders.length > -1) checkChilds(folder);
        });
    };

    function uncheckParents(item) {
        if (item.parentId) {
            LocationsService.checked.del(item.parentId);
            var parentItem = LocationsService.locations.search(item.parentId);
            if (parentItem) uncheckParents(parentItem);
        }
    }


    $scope.exists = function (item) {
        if (item) return LocationsService.checked.get().indexOf(item.id) > -1;
    };




    var request = LocationsService.locations.retrieve();
    request.then(function (promise) {
        if (promise) {
            $scope.locations = LocationsService.locations.get();
            $scope.locationsLoaded = LocationsService.locations.isReady();
        }
    })

})

analytics.controller("TimelineCtrl", function ($scope, TimelineService, LocationsService) {
    var request, initialized, updateTimelineRequest;

    $scope.selected = LocationsService.selected;
    $scope.locations = LocationsService.locations;
    $scope.timeline = TimelineService;
    

    $scope.period="week";
    $scope.range = 7;
    $scope.durations = {
        "day": [
            { name: "1H", range: "1" },
            { name: "2H", range: "2" },
            { name: "8H", range: "8" },
            { name: "24H", range: "0" }
        ],
        "week": [
            { name: '1D', range: "1" },
            { name: '2D', range: "2" },
            { name: '7D', range: "7" },
        ],
        "month": [
            { name: "1D", range: "1" },
            { name: "7D", range: "7" },
            { name: "14D", range: "14" },
            { name: "1M", range: "0" }
        ],
        "year": [
            { name: "1M", range: "1" },
            { name: "2M", range: "2" },
            { name: "6M", range: "6" },
            { name: "1Y", range: "0" }
        ]
    }



    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    // update timeline when user change the period (ex: 1D / 2D / 7D buttons)
    $scope.$watch("period", function () {
        TimelineService.period.set($scope.period);
        if (initialized && LocationsService.locations.isReady()) {
            if (TimelineService.period.get() == "day") $scope.range = 2;
            else if (TimelineService.period.get() == "month") $scope.range = 7;
            else $scope.range = 1;
            updateTimeline();
        }
    })

    // update timeline once the locations are loaded
    $scope.$watch("locations.isReady()", function () {
        if ($scope.locations.isReady()) {
            updateTimelineRequest = new Date();
            var currentUpdateRequest = updateTimelineRequest;
            setTimeout(function () {
                if (currentUpdateRequest == updateTimelineRequest) updateTimeline();
            }, 200)
        }
    }, true)

    // update timeline once the selected locations changed
    $scope.$watch("selected.get()", function () {
        if ($scope.locations.isReady()) {
            updateTimelineRequest = new Date();
            var currentUpdateRequest = updateTimelineRequest;
            setTimeout(function () {
                if (currentUpdateRequest == updateTimelineRequest) updateTimeline();
            }, 200)
        }
    }, true)

    // change the timeline values
    $scope.$watch("timeline.date.get()", function(){
        if ($scope.timeline.date.get().from != "" && $scope.timeline.date.get().to != "") $scope.date = $scope.timeline.date.get();
    }, true)

    function updateTimeline() {
        var endTime = new Date(new Date().toISOString().replace(/:[0-9]{2}:[0-9]{2}\.[0-9]{3}/, ":00:00.000"));
        var startTime = new Date(endTime);
        var selectedRange, step, format;
        console.log(TimelineService);
        console.log(TimelineService.period.get());
        switch (TimelineService.period.get()) {
            case "day":
                startTime.setDate(startTime.getDate() - 1);
                selectedRange = 24;
                step = 24;
                format = '{value:%H:%M}';
                break;
            case "week":
                startTime.setDate(startTime.getDate() - 7);
                selectedRange = 24 * 7;
                step = 24;
                format = '{value:%Y-%m-%d}';
                break;
            case "month":
                startTime.setMonth(startTime.getMonth() - 1);
                selectedRange = 7;
                step = 7;
                format = '{value:%Y-%m-%d}';
                break;
            case "year":
                startTime.setFullYear(startTime.getFullYear() - 1);
                selectedRange = 30;
                step = 30;
                format = '{value:%m-%Y}';
                break;
        }
        request = TimelineService.timeline.get(
            startTime,
            endTime,
            LocationsService.selected.get()
        );

        request.then(function (promise) {
            if (promise && promise.error) apiWarning(promise.error);
            else {
                var data = promise.data.data;
                var maxChart = 0;
                var time = [];
                var chart = [];
                for (var x in data) {
                    time[x] = new Date(data[x]['time']);
                    chart[x] = data[x].uniqueClients;
                    if (chart[x] > maxChart) maxChart = chart[x];
                }
                // Create the chart
                Highcharts.setOptions({
                    global: {
                        useUTC: false
                    }
                });
                $scope.timelineChart = new Highcharts.StockChart({
                    chart: {
                        renderTo: 'timeline',
                        backgroundColor: 'rgb(255,255,255)',
                        height: 150,
                        events: {
                            redraw: function () {
                                $scope.safeApply(
                                    TimelineService.date.set({
                                        from: this.xAxis[1].categories[(this.xAxis[0].getExtremes().min).toFixed(0)],
                                        to: this.xAxis[1].categories[(this.xAxis[0].getExtremes().max).toFixed(0)]
                                    })
                                )
                            }
                        }
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
                            enabled: true
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
                        maskFill: 'rgba(250, 250, 250, 0.70)',
                        maskInside: false,
                        height: 100,
                        handles: {
                            backgroundColor: 'rgb(255, 255, 255)',
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
            if ($scope.timelineChart) {
                max = $scope.timelineChart.xAxis[0].getExtremes().max;
                min = $scope.timelineChart.xAxis[0].getExtremes().min;
                TimelineService.date.set({
                    from: $scope.timelineChart.xAxis[1].categories[min],
                    to: $scope.timelineChart.xAxis[1].categories[max]
                })
            }
        });
    }


    $scope.isCurrentRange = function (range) {
        if (range == $scope.range) return 'md-primary';
        else return "";
    }

    $scope.changeRange = function (period, range) {
        $scope.range = range;
        var step, chart;
        //set the step depending on the graph range
        if (period == "day") step = 12;
        else if (period == "week") step = 24;
        else if (period == "month") step = 1;
        else if (period == "year") step = 30;
        // retrieve the max value
        max = $scope.timelineChart.xAxis[0].getExtremes().dataMax;
        //if 0 (max range) retrive the min value
        if (range == 0) min = $scope.timelineChart.xAxis[0].getExtremes().dataMin;
        //or calculate the value depending on the range and the step
        else min = max - (range * step);
        $scope.timelineChart.xAxis[0].setExtremes(min, max);
        TimelineService.date.set({
                    from: $scope.timelineChart.xAxis[1].categories[min],
                    to: $scope.timelineChart.xAxis[1].categories[max]
                })
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

    initialized = true;

})
