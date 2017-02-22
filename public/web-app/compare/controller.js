angular.module('Compare').controller("CompareCtrl", function ($scope, $location, $sce, LocationsService, TimelineService, LocationsService, ComparisonService) {
    $scope.locationFilter = LocationsService.filter;
    $scope.date = TimelineService.date;
    $scope.lastTimelineChange = TimelineService.timeline.lastChange;
    LocationsService.compareLocations.set(false);
    ComparisonService.current.set("periods");

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

    $scope.lineStarted = false;
    $scope.lineLoaded = false;

    $scope.storefrontLineData;
    $scope.engagedLineData;
    $scope.passersbyLineData;
    $scope.uniqueLineData;
    $scope.associatedLineData;
    $scope.unassociatedLineData;
    $scope.lineCategories = [];

    var bestWorstLocation = {
        storefront: {
            best: "",
            bestValue: null,
            worst: "",
            worstValue: null
        },
        passersbyClients: {
            best: "",
            bestValue: null,
            worst: "",
            worstValue: null
        },
        engagedClients: {
            best: "",
            bestValue: null,
            worst: "",
            worstValue: null
        },
        associatedClients: {
            best: "",
            bestValue: null,
            worst: "",
            worstValue: null
        },
        newClients: {
            best: "",
            bestValue: null,
            worst: "",
            worstValue: null
        },
        returningClients: {
            best: "",
            bestValue: null,
            worst: "",
            worstValue: null
        }
    }
    $scope.bestWorstLocation = bestWorstLocation;
    var updateRequest;

    $scope.isCurrent = function (item) {
        if (ComparisonService.current.get() == item) return "md-primary";
    }

    $scope.changeComparison = function (item) {
        ComparisonService.current.set(item);
        if (ComparisonService.current.get() == "locations") {
            LocationsService.compareLocations.set(true);
            LocationsService.selected.reset();
        }
        else LocationsService.compareLocations.set(false);
        startUpdate();
    }
    $scope.$watch("lastTimelineChange()", function () {
        startUpdate();
    }, true)
    $scope.$watch("date.get()", function (a, b) {
        startUpdate();
    }, true)

    function startUpdate() {
        if ($location.path() == "/compare") {
            $scope.lineStarted = false;
            $scope.polarStarted = false;
            $scope.tableStarted = false;
            $scope.storefrontStarted = false;
            $scope.loyaltyStarted = false;
            $scope.wifiStarted = false;
            if ($scope.date.isReady()) {
                updateRequest = new Date();
                var currentUpdateRequest = updateRequest;
                setTimeout(function () {
                    if (currentUpdateRequest == updateRequest) {
                        updateCharts();
                        updateTimelines();
                    }
                }, 2000)
            }
        }
    }

    function updateCharts() {
        var endTime = $scope.date.get().to;
        var startTime = $scope.date.get().from;
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
            if (ComparisonService.current.get() == "periods") request = ComparisonService.getPeriods(startTime, endTime, LocationsService.selected.get());
            else if (ComparisonService.current.get() == "locations") request = ComparisonService.getLocations(startTime, endTime, LocationsService.selected.get(), LocationsService.filter.get());
            else console.log("no comparison selected");
            request.then(function (promise) {
                if (promise && promise.error) console.log(promise.error);
                else {
                    var seriesPolar = [];
                    var seriesBar = [];

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
                        promise.data.average.engagedClients,
                        promise.data.average.passersbyClients,
                        promise.data.average.associatedClients,
                        promise.data.average.unassociatedClients,
                        promise.data.average.newClients,
                        promise.data.average.returningClients
                    ];
                    if (promise.data.average.uniqueClients == 0) storeFrontClients = 0;
                    else storeFrontClients = ((promise.data.average.engagedClients / promise.data.average.uniqueClients) * 100).toFixed(0);

                    seriesPolar.push({
                        type: 'area',
                        color: 'rgba(0, 0, 0, 0.2)',
                        name: "Average",
                        data: average,
                        pointPlacement: 'on'
                    });

                    data.forEach(function (currentSerie) {

                        var dataChart = [
                            currentSerie.engagedClients,
                            currentSerie.passersbyClients,
                            currentSerie.associatedClients,
                            currentSerie.unassociatedClients,
                            currentSerie.newClients,
                            currentSerie.returningClients
                        ];

                        seriesPolar.push({
                            type: 'line',
                            name: currentSerie.serie,
                            data: dataChart,
                            pointPlacement: 'on'
                        });

                        if (currentSerie.uniqueClients == 0) {
                            engaged = 0;
                            passersBy = 0;
                            associated = 0;
                            unassociated = 0;
                            newClients = 0;
                            returningClients = 0;
                        }
                        else {
                            engaged = ((currentSerie.engagedClients / currentSerie.uniqueClients) * 100).toFixed(0);
                            passersBy = ((currentSerie.passersbyClients / currentSerie.uniqueClients) * 100).toFixed(0);
                            associated = ((currentSerie.associatedClients / currentSerie.uniqueClients) * 100).toFixed(0);
                            unassociated = ((currentSerie.unassociatedClients / currentSerie.uniqueClients) * 100).toFixed(0);
                            newClients = ((currentSerie.newClients / currentSerie.uniqueClients) * 100).toFixed(0);
                            returningClients = ((currentSerie.returningClients / currentSerie.uniqueClients) * 100).toFixed(0);
                        }

                        seriesBar.push(currentSerie.serie);

                        engagedBars.push(parseInt(engaged));
                        passersByBars.push(parseInt(passersBy));
                        engagedCountBars.push(currentSerie.engagedClients);
                        passersByCountBars.push(currentSerie.passersbyClients);

                        associatedBars.push(parseInt(associated));
                        unassociatedBars.push(parseInt(unassociated));
                        associatedCountBars.push(currentSerie.associatedClients);
                        unassociatedCountBars.push(currentSerie.unassociatedClients);

                        newBars.push(parseInt(newClients));
                        returningBars.push(parseInt(returningClients));
                        newCountBars.push(currentSerie.newClients);
                        returningCountBars.push(currentSerie.returningClients);

                        if (ComparisonService.current.get() == "locations") getBestWorstLocation(currentSerie);
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

                    $scope.polarData = seriesPolar;
                    $scope.polarCategories = ['engagedClients', 'passersbyClients', 'associatedClients',
                        'unassociatedClients', 'newClients', 'returningClients'];
                    $scope.polarLoaded = true;

                    $scope.storefrontData = visitorsVsEngaged;
                    $scope.storefrontCategories = seriesBar;
                    $scope.storefrontCountData = visitorsVsEngagedCount;
                    $scope.storefrontCountCategories = seriesBar;
                    $scope.storefrontLoaded = true;

                    $scope.wifiData = wifiClients;
                    $scope.wifiCategories = seriesBar;
                    $scope.wifiCountData = wifiClientsCount;
                    $scope.wifiCountCategories = seriesBar;
                    $scope.wifiLoaded = true;

                    $scope.loyaltyData = loyaltyClients;
                    $scope.loyaltyCategories = seriesBar;
                    $scope.loyaltyCountData = loyaltyClientsCount;
                    $scope.loyaltyCountCategories = seriesBar;
                    $scope.loyaltyLoaded = true;

                    if (ComparisonService.current.get() == "periods") $scope.table = getPeriodsTable(data);
                    if (ComparisonService.current.get() == "locations") $scope.table = getLocationsTable($scope.bestWorstLocation);
                    $scope.tableLoaded = true;
                }
            })
        }
    }

    function updateTimelines() {

        $scope.storefrontLineData = undefined;
        $scope.engagedLineData = undefined;
        $scope.passersbyLineData = undefined;
        $scope.uniqueLineData = undefined;
        $scope.associatedLineData = undefined;
        $scope.unassociatedLineData = undefined;
        $scope.lineCategories = [];

        $scope.lineStarted = false;
        $scope.lineLoaded = false;
        $scope.bestWorstLocation = bestWorstLocation;
        var endTime = $scope.date.get().to;
        var startTime = $scope.date.get().from;

        var dataLocation, dataAverage, format, step;
        if (endTime - startTime <= 2678400000) {

            $scope.lineStarted = true;
            $scope.lineLoaded = false;

            var request;
            if (ComparisonService.current.get() == "periods") request = ComparisonService.getPeriodsTimeline(startTime, endTime, LocationsService.selected.get());
            else if (ComparisonService.current.get() == "locations") request = ComparisonService.getLocationsTimeline(startTime, endTime, LocationsService.selected.get(), LocationsService.filter.get());
            else console.log("no comparison selected");

            request.then(function (promise) {
                if (promise && promise.error) console.log(promise.error);
                else {
                    var tmpUnique, tmpStorefront, tmpEngaged, tmpPassersBy, tmpAssociated, tmpUnassociated, tmpNew, tmpReturning, timeserie;
                    var seriesUnique = [];
                    var seriesStorefront = [];
                    var seriesEngaged = [];
                    var seriesPassersBy = [];
                    var seriesAssociated = [];
                    var seriesUnassociated = [];
                    var seriesNew = [];
                    var seriesReturning = [];
                    var timeserie = [];

                    promise.data.timeserie.forEach(function (time) {
                        timeserie.push(new Date(time));
                    });
                    promise.data.series.forEach(function (currentSerie) {
                        tmpUnique = [];
                        tmpStorefront = [];
                        tmpEngaged = [];
                        tmpPassersBy = [];
                        tmpAssociated = [];
                        tmpUnassociated = [];
                        tmpNew = [];
                        tmpReturning = [];
                        currentSerie.data.forEach(function (currentData) {
                            tmpUnique.push(currentData.uniqueClients);
                            tmpStorefront.push(currentData.storefrontClients);
                            tmpEngaged.push(currentData.engagedClients);
                            tmpPassersBy.push(currentData.passersbyClients);
                            tmpAssociated.push(currentData.associatedClients);
                            tmpUnassociated.push(currentData.unassociatedClients);
                            tmpNew.push(currentData.newClients);
                            tmpReturning.push(currentData.returningClients);
                        });

                        seriesUnique.push({
                            name: currentSerie.name,
                            data: tmpUnique,
                            marker: {
                                symbol: "circle"
                            }
                        });
                        seriesStorefront.push({
                            name: currentSerie.name,
                            data: tmpStorefront,
                            marker: {
                                symbol: "circle"
                            }
                        });
                        seriesEngaged.push({
                            name: currentSerie.name,
                            data: tmpEngaged,
                            marker: {
                                symbol: "circle"
                            }
                        });
                        seriesPassersBy.push({
                            name: currentSerie.name,
                            data: tmpPassersBy,
                            marker: {
                                symbol: "circle"
                            }
                        });
                        seriesAssociated.push({
                            name: currentSerie.name,
                            data: tmpAssociated,
                            marker: {
                                symbol: "circle"
                            }
                        });
                        seriesUnassociated.push({
                            name: currentSerie.name,
                            data: tmpUnassociated,
                            marker: {
                                symbol: "circle"
                            }
                        });
                        seriesNew.push({
                            name: currentSerie.name,
                            data: tmpNew,
                            marker: {
                                symbol: "circle"
                            }
                        });
                        seriesReturning.push({
                            name: currentSerie.name,
                            data: tmpReturning,
                            marker: {
                                symbol: "circle"
                            }
                        });
                    });

                    $scope.lineLoaded = true;

                    $scope.storefrontLineData = seriesStorefront;
                    $scope.engagedLineData = seriesEngaged;
                    $scope.passersbyLineData = seriesPassersBy;
                    $scope.uniqueLineData = seriesUnique;
                    $scope.associatedLineData = seriesAssociated;
                    $scope.unassociatedLineData = seriesUnassociated;
                    $scope.lineCategories = timeserie;

                }
            })
        }
    }

    function getBestWorstLocation(currentSerie) {
        var storeFrontClients;
        var series = ['passersbyClients', 'engagedClients', 'associatedClients', 'newClients', 'returningClients'];

        if (currentSerie.uniqueClients == 0) storeFrontClients = 0;
        else storeFrontClients = ((currentSerie.engagedClients / currentSerie.uniqueClients) * 100).toFixed(0);

        if ($scope.bestWorstLocation.storefront.bestValue == null || $scope.bestWorstLocation.storefront.bestValue < parseInt(storeFrontClients)) {
            $scope.bestWorstLocation.storefront.bestValue = parseInt(storeFrontClients);
            $scope.bestWorstLocation.storefront.best = currentSerie.serie;
        }
        if ($scope.bestWorstLocation.storefront.worstValue == null || $scope.bestWorstLocation.storefront.worstValue > parseInt(storeFrontClients)) {
            $scope.bestWorstLocation.storefront.worstValue = parseInt(storeFrontClients);
            $scope.bestWorstLocation.storefront.worst = currentSerie.serie;
        }

        series.forEach(function (serie) {
            if ($scope.bestWorstLocation[serie].bestValue == null || $scope.bestWorstLocation[serie].bestValue < currentSerie[serie]) {
                $scope.bestWorstLocation[serie].bestValue = currentSerie[serie];
                $scope.bestWorstLocation[serie].best = currentSerie.serie;
            }
            if ($scope.bestWorstLocation[serie].worstValue == null || $scope.bestWorstLocation[serie].worstValue > currentSerie[serie]) {
                $scope.bestWorstLocation[serie].worstValue = currentSerie[serie];
                $scope.bestWorstLocation[serie].worst = currentSerie.serie;
            }
        });
    }

    function getLocationsTable(data) {
        var serie1 = [
            {
                name: "Storefront Conversion",
                best: $scope.bestWorstLocation.storefront.best,
                worst: $scope.bestWorstLocation.storefront.worst
            },
            {
                name: "Passers By",
                best: $scope.bestWorstLocation.passersbyClients.best,
                worst: $scope.bestWorstLocation.passersbyClients.worst
            },
            {
                name: "Visitors",
                best: $scope.bestWorstLocation.engagedClients.best,
                worst: $scope.bestWorstLocation.engagedClients.worst
            }
        ];
        var serie2 = [
            {
                name: "New Clients",
                best: $scope.bestWorstLocation.newClients.best,
                worst: $scope.bestWorstLocation.newClients.worst
            },
            {
                name: "Returning Clients",
                best: $scope.bestWorstLocation.returningClients.best,
                worst: $scope.bestWorstLocation.returningClients.worst
            },
            {
                name: "Wi-Fi Connections",
                best: $scope.bestWorstLocation.associatedClients.best,
                worst: $scope.bestWorstLocation.associatedClients.worst
            }
        ];
        var htmlString = '<md-content class="flex-100 layout-row"><md-content class="flex-50 layout-column layout-padding">';
        serie1.forEach(function (serie) {
            htmlString +=
                '<div class="flex-100 layout-row" class="usageSection widget-section bestLoc">' +
                '<span class="num-label tagBlockTitle widget-info" style="width: 35%; float: left;">' + serie.name + "</span>" +
                '<span class="num-indicator widget-number md-whiteframe-5dp" style="width: 65%;">' +
                '<div class="compare"><span class="compare" style="color: green;">Best: </span><span class="compare">' + serie.best + "</div>" +
                '<div class="compare"><span class="compare" style="color: red;">Worst: </span><span class="compare">' + serie.worst + "</div>" +
                '</span>' +
                '</div>';
        });
        htmlString += '<div class="flex"></div></md-content><md-content class="flex-50 layout-column layout-padding">';
        serie2.forEach(function (serie) {
            htmlString +=
                '<div class="flex-100 layout-row" class="usageSection widget-section bestLoc">' +
                '<span class="num-label tagBlockTitle widget-info" style="width: 35%; float: left;">' + serie.name + "</span>" +
                '<span class="num-indicator widget-number md-whiteframe-5dp" style="width: 65%;">' +
                '<div class="compare"><span class="compare" style="color: green;">Best: </span><span class="compare">' + serie.best + "</div>" +
                '<div class="compare"><span class="compare" style="color: red;">Worst: </span><span class="compare">' + serie.worst + "</div>" +
                '</span>' +
                '</div>';
        });
        htmlString += '</md-content></md-content>';
        return $sce.trustAsHtml(htmlString);
    }

    function getPeriodsTable(data) {
        var htmlString = "<md-table-container>" +
            "<table class='md-table small'>" +
            "<thead class='md-head'><tr class='md-row'><th class='md-column'></th>";
        for (var i = 0; i < data.length - 1; i++) {
            htmlString += "<th class='md-column'>" + data[i].serie + "</th>";
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


