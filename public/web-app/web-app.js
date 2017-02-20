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

    $rootScope.locations;
    $rootScope.compareLocations = false;
    $rootScope.locationFilter = "GENERIC";
    // rootscope variable to filter requests
    $rootScope.selectedLocations = [];
    // scope variable to know which checkbox is checked
    $scope.checkedLocations = [];
    $scope.locationsLoaded = false;
    var lastUpdateRequest;

    $scope.locationTypeEnable = function (location) {
        if (location) {
            if ($scope.compareLocations == false) return false;
            else return location.folderType != $rootScope.locationFilter;
        }
    }
    $scope.$watch("locationFilter", function () {
        $rootScope.locationFilter = $scope.locationFilter;
    })

    $rootScope.$watch("selectedLocations", function () {
        if ($rootScope.locations) {
            lastUpdateRequest = new Date();
            var currentUpdateRequest = lastUpdateRequest;
            setTimeout(function () {
                if (currentUpdateRequest == lastUpdateRequest) {
                    updateLocations();
                }
            }, 2000)
        }
    })





    $scope.locationsIcon = function (folder) {
        if (folder && folder.folderType == "GENERIC") return "map";
        else if (folder && folder.folderType == "BUILDING") return "business";
        else if (folder && folder.folderType == "FLOOR") return "layers";
    }

    //called when a checkbox is clicked
    $scope.toggle = function (item) {
        var idSelected = $rootScope.selectedLocations.indexOf(item.id);
        var idChecked = $scope.checkedLocations.indexOf(item.id);
        // if the checkbox was checked
        if (idChecked > -1) {
            // remove the id from the location filter list 
            $rootScope.selectedLocations.splice(idSelected, 1);
            // uncheck the box
            $scope.checkedLocations.splice(idChecked, 1);
            // uncheck the parent boxes and remove the id from the location filter list if needed
            uncheckParents(item);
            // add the direct childs id to the location filter list if needed
            var currentLocation = searchLocation($rootScope.locations, item.id);
            currentLocation.folders.forEach(function (child) {
                if ($rootScope.selectedLocations.indexOf(child.id) < 0) $rootScope.selectedLocations.push(child.id);
            })
        }
        // if the checkbox wasn't checked
        else {
            $rootScope.selectedLocations.push(item.id);
            toggleChilds(item);
        }
    };
    function toggleChilds(item) {
        // check the box for childs
        var idChecked = $scope.checkedLocations.indexOf(item.id);
        if (idChecked < 0) $scope.checkedLocations.push(item.id);
        else $scope.checkedLocations.splice(idChecked, 1);
        item.folders.forEach(function (folder) {
            // if the child is present in the selected locations (to filter the request) 
            // remove it (because it will be filtered on the newly checked location)
            var idSelected = $rootScope.selectedLocations.indexOf(folder.id);
            if (idSelected > -1) $rootScope.selectedLocations.splice(idSelected, 1);
            if (folder.folders) toggleChilds(folder);
        });
    }

    $scope.exists = function (item) {
        if (item) return $scope.checkedLocations.indexOf(item.id) > -1;
    };

    function searchLocation(item, itemId) {
        if (item.id == itemId) {
            return item;
        } else if (item.folders != null) {
            var i;
            var result = null;
            for (i = 0; result == null && i < item.folders.length; i++) {
                result = searchLocation(item.folders[i], itemId);
            }
            return result;
        }
        return null;
    }
    function uncheckParents(item) {
        var idSelected = $rootScope.selectedLocations.indexOf(item.parentId);
        if (idSelected > -1) $rootScope.selectedLocations.splice(idSelected, 1);
        var idChecked = $scope.checkedLocations.indexOf(item.parentId);
        if (idChecked > -1) $scope.checkedLocations.splice(idChecked, 1);;
        if (item.parentId) {
            var parentItem = searchLocation($rootScope.locations, item.parentId);
            if (parentItem) uncheckParents(parentItem);
        }
    }

    function updateLocations() {
        var request = LocationsService.get();
        request.then(function (promise) {
            console.log(promise);
            if (promise && !promise.error) {
                $rootScope.locations = promise;
                $scope.locationsLoaded = true;
            }
        })
    }
    if (!$rootScope.locations) updateLocations();
})

analytics.controller("TimelineCtrl", function ($scope, $rootScope, TimelineService) {
    var request, initialized;
    $rootScope.date = {
        from: "",
        to: ""
    };
    $rootScope.timelineLoaded = false;
    $rootScope.period = "week";
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

    $scope.$watch("period", function () {
        $rootScope.period = $scope.period;
        if (initialized && $rootScope.locations) {
            if ($rootScope.period == "day") $scope.range = 2;
            else if ($rootScope.period == "month") $scope.range = 7;
            else $scope.range = 1;
            updateTimeline();
        }
    })
    $rootScope.$watch("locations", function () {
        if ($rootScope.locations) {
            updateTimeline();
        }
    })
    $rootScope.$watch("selectedLocations", function () {
        if ($rootScope.locations) {
            updateTimeline();
        }
    }, true)


    function updateTimeline() {
        $rootScope.timelineLoaded = false;
        //if ($('#timeline').highcharts()) $('#timeline').highcharts().destroy();
        var endTime = new Date(new Date().toISOString().replace(/:[0-9]{2}:[0-9]{2}\.[0-9]{3}/, ":00:00.000"));
        var startTime = new Date(endTime);
        var selectedRange, step, format;
        switch ($rootScope.period) {
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
        timelineReq = new Date().getTime();
        request = TimelineService.get(
            startTime,
            endTime,
            $rootScope.selectedLocations,
            timelineReq
        );

        request.then(function (promise) {
            if (promise && promise.error) apiWarning(promise.error);
            else { } if (promise.data.reqId == timelineReq) {
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
                $scope.timeline = new Highcharts.StockChart({
                    chart: {
                        renderTo: 'timeline',
                        backgroundColor: 'rgb(255,255,255)',
                        height: 150,
                        events: {
                            redraw: function () {
                                $scope.safeApply(
                                    $rootScope.date = {
                                        from: this.xAxis[1].categories[(this.xAxis[0].getExtremes().min).toFixed(0)],
                                        to: this.xAxis[1].categories[(this.xAxis[0].getExtremes().max).toFixed(0)]
                                    }
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
            if ($scope.timeline) {
                max = $scope.timeline.xAxis[0].getExtremes().max;
                min = $scope.timeline.xAxis[0].getExtremes().min;
                $rootScope.date.from = $scope.timeline.xAxis[1].categories[min];
                $rootScope.date.to = $scope.timeline.xAxis[1].categories[max];
            }
            $rootScope.timelineLoaded = true;
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
        max = $scope.timeline.xAxis[0].getExtremes().dataMax;
        //if 0 (max range) retrive the min value
        if (range == 0) min = $scope.timeline.xAxis[0].getExtremes().dataMin;
        //or calculate the value depending on the range and the step
        else min = max - (range * step);
        $scope.timeline.xAxis[0].setExtremes(min, max);
        $rootScope.date.from = $scope.timeline.xAxis[1].categories[min];
        $rootScope.date.to = $scope.timeline.xAxis[1].categories[max];
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

angular.module('analytics').factory("TimelineService", function ($http, $q) {
    function get(startTime, endTime, selectedLocations, timelineReq) {
        var canceller = $q.defer();
        var request = $http({
            url: '/api/timeline/',
            method: "GET",
            params: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                locations: JSON.stringify(selectedLocations),
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

angular.module('analytics').factory("LocationsService", function ($http, $q, $rootScope) {
    function get() {
        var canceller = $q.defer();
        var request = $http({
            url: '/api/apLocationFolders',
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    };
    function addParentRef(folder, parentId) {
        folder.parentId = parentId;
        if (folder.folders.length > 0) {
            for (var i in folder.folders) {
                if (folder.folders[i].folders) folder.folders[i] = addParentRef(folder.folders[i], folder.id);
            }
        }
        return folder;
    }
    function httpReq(request) {
        var promise = request.then(
            function (response) {
                var folders = response.data;
                console.log(folders);
                return addParentRef(response.data, null);
            },
            function (response) {
                console.log(response);
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('apiError', response.data.error);
                    return ($q.reject(response.data.error));
                }
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