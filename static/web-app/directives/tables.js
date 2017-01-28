angular.module("Tables").directive('tablePeriods', function () {
    return {
        scope: {
            title: '@',
            categories: "=",
            data: "=",
            containerid: '@',
            started: "=",
            loaded: "="
        },
        restrict: 'EA',
        replace: 'true',
        templateUrl: 'directives/chartBar.html',
        link: function (scope, element, attr) {
        }
    }
});

angular.module("Tables").directive('tableLocations', function () {

});