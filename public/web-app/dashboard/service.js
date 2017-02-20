
angular.module("Dashboard").factory("DashboardChartsService", function ($http, $q) {
    function widgets(startTime, endTime, locationAnalytics) {
        var canceller = $q.defer();
        var request = $http({
            method: 'GET',
            url: '/api/dashboard/widgets/',
            params: {
                startTime: startTime,
                endTime: endTime,
                locations: locationAnalytics
            },
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function topLocations(startTime, endTime, locationAnalytics) {
        var canceller = $q.defer();
        var request = $http({
            method: 'GET',
            url: '/api/dashboard/widget-top/',
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
        widgets: widgets,
        topLocations: topLocations
    }
});

angular.module('Dashboard').factory("CardsService", function ($http, $q) {

    function update(locations) {
        var canceller = $q.defer();
        var request = $http({
            method: "GET",
            url: "/api/dashboard/cards/",
            params: locations,
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