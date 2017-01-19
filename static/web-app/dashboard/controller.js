angular.module('Dashboard').controller("DashboardCtrl", function ($scope, $rootScope) {
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
});
