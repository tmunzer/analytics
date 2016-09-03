angular.module('identity').config(function ($routeProvider) {
    $routeProvider
        .when("/dashboard", {
            templateUrl: "/web-app/dashboard/view.html",
            module: "Dashboard",
            controller: "DashboardCtrl"
        })       
        .otherwise({
            redirectTo: "/dashboard/"
        });
});