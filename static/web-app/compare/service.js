angular.module("Compare").factory("CompareService", function ($http, $q) {
    function getPeriods(startTime, endTime, locationAnalytics) {
        var canceller = $q.defer();
        var request = $http({
            method: "GET",
            url: "/api/compare/periods/global",
            params: {
                startTime: startTime,
                endTime: endTime,
                locations: locationAnalytics
            },
            timeout: canceller.promise
        });
        return httpReq(request);
    }
    function getLocations(startTime, endTime, locationAnalytics) {
        var canceller = $q.defer();
        var request = $http({
            method: "GET",
            url: "/api/compare/locations/global",
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
        getPeriods: getPeriods,
        getLocations:getLocations
    }
});