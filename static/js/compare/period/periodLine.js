var periodLineReq;
function updatePeriodLine() {
    var dataPeriod, dataAverage, format, step;
    var chart = $('#timeline').highcharts();
    var endTime = chart.xAxis[1].categories[max];
    var startTime = chart.xAxis[1].categories[min];
    // @TODO: Current API limitation
    if (endTime - startTime <= 2678400000) {

        $("#uniqueData").hide();
        $("#uniqueEmpty").hide();
        $("#uniqueLoading").show();

        $("#storefrontData").hide();
        $("#storefrontEmpty").hide();
        $("#storefrontLoading").show();

        $("#engagedData").hide();
        $("#engagedEmpty").hide();
        $("#engagedLoading").show();

        $("#passersByData").hide();
        $("#passersByEmpty").hide();
        $("#passersByLoading").show();

        $("#associatedData").hide();
        $("#associatedEmpty").hide();
        $("#associatedLoading").show();

        $("#unassociatedData").hide();
        $("#unassociatedEmpty").hide();
        $("#unassociatedLoading").show();

        switch (range){
            case 0:
                format = '{value:%H:%M}';
                step = 24;
                break;
            case 1:
                format = '{value:%m-%d %H:%M}';
                step = 24;
                break;
            case 2:
                format = '{value:%m-%d %H:%M}';
                step = 24;
                break;
            case 3:
                format = '{value:%m-%Y}';
                step = 1;
                break;
        }

        periodLineReq = new Date().getTime();
        $.ajax({
            method: 'POST',
            url: '/compare/api/period/timeline/',
            data: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                filterFolder: filterFolder,
                locations: JSON.stringify(locationAnalytics),
                reqId: periodLineReq
            }
        }).done(function (data) {
            if (data.error) displayModal("API", data.error);
            else if (data.reqId == periodLineReq) {
                console.log(data);
                var tmpUnique, tmpStorefront, tmpEngaged, tmpPassersBy, tmpAssociated, tmpUnassociated, timeserie;
                var seriesUnique = [];
                var seriesStorefront = [];
                var seriesEngaged = [];
                var seriesPassersBy = [];
                var seriesAssociated = [];
                var seriesUnassociated = [];

                /*
                for (var i in dataAverage['times']) {
                    time.push(dataAverage['times'][i]['time']);
                    tmpUnique.push(dataAverage['times'][i]['uniqueClients']);
                    tmpStorefront.push(dataAverage['times'][i]['storefrontClients']);
                    tmpEngaged.push(dataAverage['times'][i]['engagedClients']);
                    tmpPassersBy.push(dataAverage['times'][i]['passersbyClients']);
                    tmpAssociated.push(dataAverage['times'][i]['associatedClients']);
                    tmpUnassociated.push(dataAverage['times'][i]['unassociatedClients']);
                }
                seriesUnique.push({
                    name: 'Average',
                    data: tmpUnique
                });
                seriesStorefront.push({
                    name: 'Average',
                    data: tmpStorefront
                });
                seriesEngaged.push({
                    name: 'Average',
                    data: tmpEngaged
                });
                seriesPassersBy.push({
                    name: 'Average',
                    data: tmpPassersBy
                });
                seriesAssociated.push({
                    name: 'Average',
                    data: tmpAssociated
                });
                seriesUnassociated.push({
                    name: 'Average',
                    data: tmpUnassociated
                });
                 */
                timeserie = data.timeserie;
                for (var i in data.dataPeriod) {
                    tmpUnique = [];
                    tmpStorefront = [];
                    tmpEngaged = [];
                    tmpPassersBy = [];
                    tmpAssociated = [];
                    tmpUnassociated = [];
                    for (var j in data.dataPeriod[i]['times']) {
                        tmpUnique.push(data.dataPeriod[i]['times'][j]['uniqueClients']);
                        tmpStorefront.push(data.dataPeriod[i]['times'][j]['storefrontClients']);
                        tmpEngaged.push(data.dataPeriod[i]['times'][j]['engagedClients']);
                        tmpPassersBy.push(data.dataPeriod[i]['times'][j]['passersbyClients']);
                        tmpAssociated.push(data.dataPeriod[i]['times'][j]['associatedClients']);
                        tmpUnassociated.push(data.dataPeriod[i]['times'][j]['unassociatedClients']);
                    }
                    seriesUnique.push({
                        name: data.dataPeriod[i].period,
                        data: tmpUnique,
                        marker: {
                            symbol: "circle"
                        }
                    });
                    seriesStorefront.push({
                        name: data.dataPeriod[i].period,
                        data: tmpStorefront,
                        marker: {
                            symbol: "circle"
                        }
                    });
                    seriesEngaged.push({
                        name: data.dataPeriod[i].period,
                        data: tmpEngaged,
                        marker: {
                            symbol: "circle"
                        }                    });
                    seriesPassersBy.push({
                        name: data.dataPeriod[i].period,
                        data: tmpPassersBy,
                        marker: {
                            symbol: "circle"
                        }
                    });
                    seriesAssociated.push({
                        name: data.dataPeriod[i].period,
                        data: tmpAssociated,
                        marker: {
                            symbol: "circle"
                        }
                    });
                    seriesUnassociated.push({
                        name: data.dataPeriod[i].period,
                        data: tmpUnassociated,
                        marker: {
                            symbol: "circle"
                        }
                    });
            }
                displayLineChart('uniqueData', timeserie, seriesUnique, format, step);
                $("#uniqueData").show();
                $("#uniqueEmpty").hide();
                $("#uniqueLoading").hide();
                displayLineChart('storefrontData', timeserie, seriesStorefront, format, step);
                $("#storefrontData").show();
                $("#storefrontEmpty").hide();
                $("#storefrontLoading").hide();
                displayLineChart('engagedData', timeserie, seriesEngaged, format, step);
                $("#engagedData").show();
                $("#engagedEmpty").hide();
                $("#engagedLoading").hide();
                displayLineChart('passersByData', timeserie, seriesPassersBy, format, step);
                $("#passersByData").show();
                $("#passersByEmpty").hide();
                $("#passersByLoading").hide();
                displayLineChart('associatedData', timeserie, seriesAssociated, format, step);
                $("#associatedData").show();
                $("#associatedEmpty").hide();
                $("#associatedLoading").hide();
                displayLineChart('unassociatedData', timeserie, seriesUnassociated, format, step);
                $("#unassociatedData").show();
                $("#unassociatedEmpty").hide();
                $("#unassociatedLoading").hide();
            }
        })
    }
}

function displayLineChart(containerId, time, series, format, step) {
    var chart = $("#" + containerId);
    if (chart.highcharts()) chart.highcharts().destroy();
    chart.highcharts({
        colors: ['#0085bd', '#00aff8', '#307fa1', '#606c71', '#3095cf', '#005c83', '#003248', '#00090d'],
        chart: {
            type: 'spline',
            marginBottom: 80,
            plotBorderWidth: 1,
            height: 350,
            width: 950
        },
        title: {
            text: ''
        },
        legend: {
            y: 15
        },
        yAxis: {
            title: {
                text: 'Count'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        xAxis: {
            categories: time,
            tickInterval: step,
            labels: {
                format: format
            }
        },
        series: series
    });

}
