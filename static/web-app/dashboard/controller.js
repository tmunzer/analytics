angular.module('Dashboard').controller("DashboardCtrl", function ($scope, $rootScope, CardsService) {
    console.log("Dashboard");
    $scope.maps= {
        folders: 0,
        buildings: 0,
        floors: 0
    }
    $scope.devices = {
        devices: 0,
        connected: 0,
        sensors: 0
    }
    $scope.locations;

    var request = CardsService.get();
    request.then(function(promise){
        if (promise && promise.error) console.log(promise.error);
        else {            
                $scope.maps.folder = promise.data.locationsCount.folder;
                $scope.maps.buildings = promise.data.locationsCount.building;
                $scope.maps.floors = promise.data.locationsCount.floor;
                $scope.devices.sensors = promise.data.devicesCount.sensor;
                $scope.devices.connected = promise.data.devicesCount.connected;
                $scope.devices.devices = promise.data.devicesCount.count;
                $scope.locations = promise.data.locations;
        }
    })
});



angular.module('Dashboard').factory("CardsService", function ($http, $q) {
    function get(startTime, endTime, locationAnalytics, timelineReq) {
        var canceller = $q.defer();
        var request = $http({
            method: "POST",
            url: "/api/common/init/",        
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