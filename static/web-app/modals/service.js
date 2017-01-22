angular.module("Modals").factory("selfService", function($http, $q, $rootScope){
    var promise = null;

    function getSelf(){
        var canceller = $q.defer();
        var request = $http({
            url: "/api/settings/self",
            method: "GET",
            timeout: canceller.promise
        });
        if (promise) promise.abort();
        promise = request.then(
            function(response){
                if (response.data) {
                    if (response.data.error) return response.data;
                    else return response.data;
                }else return true;
            },
            function(response){
                if (response.status && response.status >= 0){
                    $rootScope.$broadcast("serverError", response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function(){
            canceller.resolve();
        };
        promise.finally(function(){
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        getSelf: getSelf
    }
});