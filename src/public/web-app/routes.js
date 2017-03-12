angular.module('analytics').config(function ($routeProvider) {
    $routeProvider
        .when("/dashboard", {
            templateUrl: "/web-app/dashboard/view.html",
            module: "Dashboard",
            controller: "DashboardCtrl"
        })
        .when("/compare", {
            templateUrl: "/web-app/compare/view.html",
            module: "Compare",
            controller: "CompareCtrl"
        })
        .when("/details", {
            templateUrl: "/web-app/details/view.html",
            module: "Details",
            controller: "DetailsCtrl"
        })
        .otherwise({
            redirectTo: "/dashboard/"
        });
});