angular.module("Charts").directive('chartLine', function () {
    return {
        scope: {
            title: '@',
            categories: "=",
            data: "=",
            containerid: '@',
            started: "=",
            loaded: "=",
            period: "=",            
            percentage: "@"
        },
        restrict: 'EA',
        replace: 'true',
        templateUrl: 'directives/chart-100.html',
        link: function (scope, element, attr) {
            var format, step;
            if (scope.percentage) {
                title = "% of Devices";
            } else {
                title = "Number of Devices";
            }
            switch (scope.period) {
                case "day":
                    format = '{value:%H:%M}';
                    step = 24;
                    break;
                case "week":
                    format = '{value:%m/%d/%y %H:%M}';
                    step = 24;
                    break;
                case "month":
                    format = '{value:%m-%d}';
                    step = 24;
                    break;
                case "year":
                    format = '{value:%m-%Y}';
                    step = 1;
                    break;
            }
            function changeDisplayed(toDisplay) {
                if (toDisplay == "wait") element[0].querySelector("#wait").style.display = "flex";
                else element[0].querySelector("#wait").style.display = "none";
                if (toDisplay == "load") element[0].querySelector("#load").style.display = "flex";
                else element[0].querySelector("#load").style.display = "none";
                if (toDisplay == "chart") element[0].querySelector("#chart").style.display = "flex";
                else element[0].querySelector("#chart").style.display = "none";
            }

            scope.$watch("started", function () {
                if (!scope.started) changeDisplayed("wait");
                else if (scope.started && !scope.loaded) changeDisplayed("load");
            })

            scope.$watch("loaded", function () {
                if (scope.started && scope.loaded) {
                    changeDisplayed("chart");
                    Highcharts.chart({
                        colors: ['#0085bd', '#00aff8', '#307fa1', '#606c71', '#3095cf', '#005c83', '#003248', '#00090d'],
                        chart: {
                            renderTo: scope.containerid,
                            type: 'spline',
                            marginBottom: 80,
                            plotBorderWidth: 1,
                            height: 350
                        },
                        title: {
                            text: ''
                        },
                        legend: {
                            y: 15
                        },
                        yAxis: {
                            title: {
                                text: title
                            },
                            plotLines: [{
                                value: 0,
                                width: 1,
                                color: '#808080'
                            }]
                        },
                        xAxis: {
                            categories: scope.categories,
                            tickInterval: step,
                            labels: {
                                format: format
                            }
                        },
                        series: scope.data
                    });
                }
            })

        }
    };
});

angular.module("Charts").directive('chartPolar', function () {
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
        templateUrl: 'directives/chart-100.html',
        link: function (scope, element, attr) {
            function changeDisplayed(toDisplay) {
                if (toDisplay == "wait") element[0].querySelector("#wait").style.display = "flex";
                else element[0].querySelector("#wait").style.display = "none";
                if (toDisplay == "load") element[0].querySelector("#load").style.display = "flex";
                else element[0].querySelector("#load").style.display = "none";
                if (toDisplay == "chart") element[0].querySelector("#chart").style.display = "flex";
                else element[0].querySelector("#chart").style.display = "none";
            }

            scope.$watch("started", function () {
                if (!scope.started) changeDisplayed("wait");
                else if (scope.started && !scope.loaded) changeDisplayed("load");
            })

            scope.$watch("loaded", function () {
                if (scope.started && scope.loaded) {
                    changeDisplayed("chart");
                    Highcharts.chart({
                        colors: ['#0085bd', '#00aff8', '#307fa1', '#606c71', '#3095cf', '#005c83', '#003248', '#00090d'],

                        chart: {
                            renderTo: scope.containerid,
                            polar: true,
                            type: 'line',
                            height: 390
                        },
                        title: {
                            text: scope.title,
                            x: -80
                        },
                        /*pane: {
                            size: '80%'
                        },*/

                        xAxis: {
                            categories: scope.categories,
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

                        series: scope.data

                    });
                }
            })

        }
    };
});


angular.module("Charts").directive('chartBar', function () {
    return {
        scope: {
            title: '@',
            categories: "=",
            data: "=",
            containerid: '@',
            started: "=",
            loaded: "=",
            percentage: "@"
        },
        restrict: 'EA',
        replace: 'true',
        templateUrl: 'directives/chart-50.html',
        link: function (scope, element, attr) {
            var title;
            if (scope.percentage) {
                title = "% of Devices";
            } else {
                title = "Number of Devices";
            }
            function changeDisplayed(toDisplay) {
                if (toDisplay == "wait") element[0].querySelector("#wait").style.display = "flex";
                else element[0].querySelector("#wait").style.display = "none";
                if (toDisplay == "load") element[0].querySelector("#load").style.display = "flex";
                else element[0].querySelector("#load").style.display = "none";
                if (toDisplay == "chart") element[0].querySelector("#chart").style.display = "flex";
                else element[0].querySelector("#chart").style.display = "none";
            }
            scope.$watch("started", function () {
                if (!scope.started) changeDisplayed("wait");
                else if (scope.started && !scope.loaded) changeDisplayed("load");
            })
            scope.$watch("loaded", function () {
                if (scope.started && scope.loaded) {
                    changeDisplayed("chart");
                    Highcharts.chart({
                        chart: {
                            renderTo: scope.containerid,
                            type: 'column',
                            height: 250
                        },
                        title: {
                            text: ''
                        },
                        xAxis: {
                            categories: scope.categories
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: title
                            }

                        },
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            series: {
                                borderWidth: 0,
                                dataLabels: {
                                    enabled: false
                                }
                            }
                        },

                        tooltip: {
                            headerFormat: '<span style="font-size:11px">{point.x}</span><br>',
                            pointFormat: '<span style="color:{point.color}">{series.name}</span>: <b>{point.y}</b><br/>'
                        },

                        series: [{
                            name: scope.title,
                            data: scope.data
                        }]
                    });
                }
            })
        }
    }
});



angular.module("Charts").directive('chartBarStacked', function () {
    return {
        scope: {
            title: '@',
            categories: "=",
            data: "=",
            containerid: '@',
            started: "=",
            loaded: "=",
            percentage: '='
        },
        restrict: 'EA',
        replace: 'true',
        templateUrl: 'directives/chart-50.html',
        link: function (scope, element, attr) {
            var title;
            if (scope.percentage) {
                title = "% of Devices";
            } else {
                title = "Number of Devices";
            }
            function changeDisplayed(toDisplay) {
                if (toDisplay == "wait") element[0].querySelector("#wait").style.display = "flex";
                else element[0].querySelector("#wait").style.display = "none";
                if (toDisplay == "load") element[0].querySelector("#load").style.display = "flex";
                else element[0].querySelector("#load").style.display = "none";
                if (toDisplay == "chart") element[0].querySelector("#chart").style.display = "flex";
                else element[0].querySelector("#chart").style.display = "none";
            }
            scope.$watch("started", function () {
                if (!scope.started) changeDisplayed("wait");
                else if (scope.started && !scope.loaded) changeDisplayed("load");
            });
            scope.$watch("loaded", function () {
                if (scope.started && scope.loaded) {
                    changeDisplayed("chart");
                    Highcharts.chart({
                        chart: {
                            type: 'column',
                            renderTo: scope.containerid
                        },
                        title: {
                            text: ""
                        },
                        xAxis: {
                            categories: scope.categories
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: title
                            },
                            stackLabels: {
                                enabled: true,
                                style: {
                                    fontWeight: 'bold',
                                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                                }
                            }
                        },
                        legend: {
                            align: 'right',
                            verticalAlign: 'top',
                            borderColor: '#CCC',
                            borderWidth: 1,
                            shadow: false
                        },
                        tooltip: {
                            headerFormat: '<b>{point.x}</b><br/>',
                            pointFormat: '<span style="color:{point.color}">{series.name}</span>: {point.y}<br/>Total: {point.stackTotal}'
                        },
                        plotOptions: {
                            column: {
                                stacking: 'normal',
                                dataLabels: {
                                    enabled: true,
                                    style: {
                                        textShadow: '0 0 3px contrast'
                                    }
                                }
                            }
                        },
                        series: scope.data
                    });
                }
            })
        }
    }
});


angular.module("Charts").directive('chartBarProgess', function () {
    //@TODO
    return {
        scope: {
            title: '@',
            categories: "=",
            data: "=",
            containerid: '@',
            started: "=",
            loaded: "=",
            percentage: '@'
        },
        restrict: 'EA',
        replace: 'true',
        templateUrl: 'directives/chart-50.html',
        link: function (scope, element, attr) {
            var title, pointFormat;
            if (scope.percentage) {
                title = "% of Devices";
                pointFormat: '{series.name}: {point.y}%<br/>Total: {point.stackTotal}%';
            } else {
                title = "Number of Devices";
                pointFormat = '{series.name}: {point.y}<br/>Total: {point.stackTotal}';
            }
            scope.$watch("loaded", function () {
                function changeDisplayed(toDisplay) {
                    if (toDisplay == "wait") element[0].querySelector("#wait").style.display = "flex";
                    else element[0].querySelector("#wait").style.display = "none";
                    if (toDisplay == "load") element[0].querySelector("#load").style.display = "flex";
                    else element[0].querySelector("#load").style.display = "none";
                    if (toDisplay == "chart") element[0].querySelector("#chart").style.display = "flex";
                    else element[0].querySelector("#chart").style.display = "none";
                }
                scope.$watch("started", function () {
                if (!scope.started) changeDisplayed("wait");
                else if (scope.started && !scope.loaded) changeDisplayed("load");
                })
                scope.$watch("loaded", function () {
                    if (scope.started && scope.loaded) {
                        changeDisplayed("chart");
                        Highcharts.chart({
                            chart: {
                                type: 'column',
                                renderTo: scope.containerid
                            },
                            title: {
                                text: ""
                            },
                            xAxis: {
                                categories: scope.categories
                            },
                            yAxis: {
                                min: 0,
                                title: {
                                    text: title
                                },
                                stackLabels: {
                                    enabled: true,
                                    style: {
                                        fontWeight: 'bold',
                                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                                    }
                                }
                            },
                            legend: {
                                align: 'right',
                                verticalAlign: 'top',
                                borderColor: '#CCC',
                                borderWidth: 1,
                                shadow: false
                            },
                            tooltip: {
                                headerFormat: '<b>{point.x}</b><br/>',
                                pointFormat: pointFormat
                            },
                            plotOptions: {
                                column: {
                                    stacking: 'normal',
                                    dataLabels: {
                                        enabled: true,
                                        style: {
                                            textShadow: '0 0 3px contrast'
                                        }
                                    }
                                }
                            },
                            series: scope.data
                        });
                    }
                })
            });
        }
    }
});