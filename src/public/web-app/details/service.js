
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