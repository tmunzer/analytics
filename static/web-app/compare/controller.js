angular.module('Compare').controller("CompareCtrl", function ($scope, $rootScope, $location, $sce, CompareService) {
    var compare = "locations";

    $scope.polarStarted = false;
    $scope.polarLoaded = false;
    $scope.tableStarted = false;
    $scope.tableLoaded = false;
    $scope.storefrontStarted = false;
    $scope.storefrontLoaded = false;
    $scope.loyaltyStarted = false;
    $scope.loyaltyLoaded = false;
    $scope.wifiLoaded = false;
    $scope.wifiStarted = false;
    $scope.table = "";

    var updateRequest;

    $scope.isCurrent = function (item) {
        if (compare == item) return "md-primary";
    }


    $scope.changeComparison = function (item) {
        compare = item;
        startUpdate();
    }
    $rootScope.$watch("date", function (a, b) {
        if ($location.path() == "/compare")
            startUpdate();
    }, true)

    function startUpdate() {
        if ($rootScope.date.from != "" && $rootScope.date.to != "") {
            updateRequest = new Date();
            var currentUpdateRequest = updateRequest;
            setTimeout(function () {
                if (currentUpdateRequest == updateRequest) {
                    updateCharts();
                }
            }, 2000)
        }
    }

    function updateCharts() {
        var endTime = $rootScope.date.to;
        var startTime = $rootScope.date.from;
        var locationAnalytics = $rootScope.selectedLocations;
        // @TODO: Current API limitation
        if (endTime - startTime <= 2678400000) {

            $scope.polarStarted = true;
            $scope.tableStarted = true;
            $scope.storefrontStarted = true;
            $scope.loyaltyStarted = true;
            $scope.wifiStarted = true;

            $scope.polarLoaded = false;
            $scope.tableLoaded = false;
            $scope.storefrontLoaded = false;
            $scope.loyaltyLoaded = false;
            $scope.wifiLoaded = false;

            var request;
            if (compare == "periods") request = CompareService.getPeriods(startTime, endTime, locationAnalytics);
            if (compare == "locations") request = CompareService.getLocations(startTime, endTime, locationAnalytics);
            else a = 1;
            request.then(function (promise) {
                if (promise && promise.error) console.log(promise.error);
                else {
                    console.log(promise);
                    var series = [];
                    var locationsSeries = [];
                    var storefrontBars = [];
                    var storeFrontClients;

                    var engagedCountBars = [];
                    var passersByCountBars = [];
                    var engagedBars = [];
                    var passersByBars = [];
                    var engaged;
                    var passersBy;

                    var associatedCountBars = [];
                    var unassociatedCountBars = [];
                    var associatedBars = [];
                    var unassociatedBars = [];
                    var associated;
                    var unassociated;

                    var newCountBars = [];
                    var returningCountBars = [];
                    var newBars = [];
                    var returningBars = [];
                    var newClients;
                    var returningClients;


                    var data = promise.data.data;
                    var average = [
                        promise.data.average['uniqueClients'],
                        promise.data.average['engagedClients'],
                        promise.data.average['passersbyClients'],
                        promise.data.average['associatedClients'],
                        promise.data.average['unassociatedClients'],
                        promise.data.average['newClients'],
                        promise.data.average['returningClients']
                    ];
                    if (promise.data.average['uniqueClients'] == 0) storeFrontClients = 0;
                    else storeFrontClients = ((promise.data.average['engagedClients'] / promise.data.average['uniqueClients']) * 100).toFixed(0);

                    series.push({
                        type: 'area',
                        color: 'rgba(0, 0, 0, 0.2)',
                        name: "Average",
                        data: average,
                        pointPlacement: 'on'
                    });

                    data.forEach(function (currentPeriod) {

                        var dataChart = [
                            promise.data.average['uniqueClients'],
                            promise.data.average['engagedClients'],
                            promise.data.average['passersbyClients'],
                            promise.data.average['associatedClients'],
                            promise.data.average['unassociatedClients'],
                            promise.data.average['newClients'],
                            promise.data.average['returningClients']
                        ];

                        series.push({
                            type: 'line',
                            name: currentPeriod['period'],
                            data: dataChart,
                            pointPlacement: 'on'
                        });

                        if (currentPeriod['uniqueClients'] == 0) {
                            engaged = 0;
                            passersBy = 0;
                            associated = 0;
                            unassociated = 0;
                            newClients = 0;
                            returningClients = 0;
                        }
                        else {
                            engaged = ((currentPeriod['engagedClients'] / currentPeriod['uniqueClients']) * 100).toFixed(0);
                            passersBy = ((currentPeriod['passersbyClients'] / currentPeriod['uniqueClients']) * 100).toFixed(0);
                            associated = ((currentPeriod['associatedClients'] / currentPeriod['uniqueClients']) * 100).toFixed(0);
                            unassociated = ((currentPeriod['unassociatedClients'] / currentPeriod['uniqueClients']) * 100).toFixed(0);
                            newClients = ((currentPeriod['newClients'] / currentPeriod['uniqueClients']) * 100).toFixed(0);
                            returningClients = ((currentPeriod['returningClients'] / currentPeriod['uniqueClients']) * 100).toFixed(0);
                        }

                        locationsSeries.push(currentPeriod['period']);

                        engagedBars.push(parseInt(engaged));
                        passersByBars.push(parseInt(passersBy));
                        engagedCountBars.push(currentPeriod['engagedClients']);
                        passersByCountBars.push(currentPeriod['passersbyClients']);

                        associatedBars.push(parseInt(associated));
                        unassociatedBars.push(parseInt(unassociated));
                        associatedCountBars.push(currentPeriod['associatedClients']);
                        unassociatedCountBars.push(currentPeriod['unassociatedClients']);

                        newBars.push(parseInt(newClients));
                        returningBars.push(parseInt(returningClients));
                        newCountBars.push(currentPeriod['newClients']);
                        returningCountBars.push(currentPeriod['returningClients']);

                    });

                    var visitorsVsEngaged = [{
                        name: 'Engaged Clients',
                        data: engagedBars
                    }, {
                        name: 'Passers By',
                        data: passersByBars
                    }];
                    var visitorsVsEngagedCount = [{
                        name: 'Engaged Clients',
                        data: engagedCountBars
                    }, {
                        name: 'Passers By',
                        data: passersByCountBars
                    }];
                    var wifiClients = [{
                        name: 'Associated Clients',
                        data: associatedBars
                    }, {
                        name: 'Unassociated Clients',
                        data: unassociatedBars
                    }];
                    var wifiClientsCount = [{
                        name: 'Associated Clients',
                        data: associatedCountBars
                    }, {
                        name: 'Unassociated Clients',
                        data: unassociatedCountBars
                    }];
                    var loyaltyClients = [{
                        name: 'New Clients',
                        data: newBars
                    }, {
                        name: "Returning Clients",
                        data: returningBars
                    }];
                    var loyaltyClientsCount = [{
                        name: 'New Clients',
                        data: newCountBars
                    }, {
                        name: "Returning Clients",
                        data: returningCountBars
                    }];

                    $scope.polarData = series;
                    $scope.polarCategories = ['uniqueClients', 'engagedClients', 'passersbyClients', 'associatedClients',
                        'unassociatedClients', 'storeFrontClients'];
                    $scope.polarLoaded = true;

                    $scope.storefrontData = visitorsVsEngaged;
                    $scope.storefrontCategories = locationsSeries;
                    $scope.storefrontCountData = visitorsVsEngagedCount;
                    $scope.storefrontCountCategories = locationsSeries;
                    $scope.storefrontLoaded = true;

                    $scope.wifiData = wifiClients;
                    $scope.wifiCategories = locationsSeries;
                    $scope.wifiCountData = wifiClientsCount;
                    $scope.wifiCountCategories = locationsSeries;
                    $scope.wifiLoaded = true;

                    $scope.loyaltyData = loyaltyClients;
                    $scope.loyaltyCategories = locationsSeries;
                    $scope.loyaltyCountData = loyaltyClientsCount;
                    $scope.loyaltyCountCategories = locationsSeries;
                    $scope.loyaltyLoaded = true;

                    $scope.table = getPeriodsTable(data);
                    $scope.tableLoaded = true;
                }
            })
        }
    }

    function getPeriodsTable(data) {
        var htmlString = "<md-table-container>" +
            "<table class='md-table small'>" +
            "<thead class='md-head'><tr class='md-row'><th class='md-column'></th>";
        for (var i = 0; i < data.length - 1; i++) {
            htmlString += "<th class='md-column'>" + data[i]['period'] + "</th>";
        }
        htmlString += "</tr></thead><tbody class='md-body'>";
        htmlString += "<tr class='md-row'><td class='md-cell'>Engaged Clients</th>" + getTableRow(data, "engagedClients") + "</tr>";
        htmlString += "<tr class='md-row'><td class='md-cell'>PassersBy Clients</th>" + getTableRow(data, "passersbyClients") + "</tr>";
        htmlString += "<tr class='md-row'><td class='md-cell'>New Clients</th>" + getTableRow(data, "newClients") + "</tr>";
        htmlString += "<tr class='md-row'><td class='md-cell'>Returning Clients</th>" + getTableRow(data, "returningClients") + "</tr>";
        htmlString += "<tr class='md-row'><td class='md-cell'>Associated Clients</th>" + getTableRow(data, "associatedClients") + "</tr>";
        htmlString += "<tr class='md-row'><td class='md-cell'>Unassociated Clients</th>" + getTableRow(data, "unassociatedClients") + "</tr>";
        htmlString += "</tbody></table><md-table-container>";
        return $sce.trustAsHtml(htmlString);
    }

    function getTableRow(data, dataName) {
        var htmlString = "";
        for (var i = 0; i < data.length - 1; i++) {
            htmlString += "<td class='md-cell'>" + getPercentage(data[data.length - 1][dataName], data[i][dataName]) + "</td>";
        }
        return htmlString;
    }

    function getPercentage(num1, num2) {
        var htmlString = "";
        if (num2 == 0) {
            htmlString = '<span style="color: gray">N/A</span>';
        } else {
            var percentage = (((num1 - num2) / num2) * 100);
            if (percentage < 0) htmlString =
                '<span style="color: red"><i class="fa fa-caret-down fa-lg" style="margin: auto;color: red;"></i> ' + percentage.toFixed(0) + '%</span>';
            else if (percentage > 0) htmlString =
                '<span style="color: green"><i class="fa fa-caret-up fa-lg" style="margin: auto;color: green;"></i> +' + percentage.toFixed(0) + '%</span>';
            else htmlString =
                '<span style="color: gray"><i class="fa fa-caret-right fa-lg" style="margin: auto;"></i> ' + percentage.toFixed(0) + '%</span>';
        }
        return htmlString
    }






});



/*

var chart = new Highcharts.chart({
        colors: ['#0085bd', '#00aff8', '#307fa1', '#606c71', '#3095cf', '#005c83', '#003248', '#00090d'],

        chart: {
            renderTo: containerId,
            polar: true,
            type: 'line',
            height: 390,
            events: {
                load: function (chart) {
                    setTimeout(function () {
                        chart.target.reflow();
                    });
                }
            }
        },

        title: {
            text: title,
            x: -80
        },

        pane: {
            size: '80%'
        },

        xAxis: {
            categories: ['uniqueClients', 'engagedClients', 'passersbyClients', 'associatedClients',
                'unassociatedClients', 'newClients', 'returningClients'],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },

        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
        },

        legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 70,
            layout: 'vertical'
        },

        series: series

    });

*/