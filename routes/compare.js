var express = require('express');
var router = express.Router();

var API = require(appRoot + "/bin/aerohive/api/main");
var Device = require(appRoot + "/bin/aerohive/models/device");
var Location = require(appRoot + "/bin/aerohive/models/location");

/*================================================================
 ROUTES
 ================================================================*/
/*================================================================
 DASHBOARD
 ================================================================*/
router.get('/location/', function (req, res, next) {
    if (req.session.vpcUrl && req.session.ownerID && req.session.accessToken) {
        res.render('compare_location', {
            title: 'Analytics',
            current_page: 'compare',
            compare_page: 'location',
            server: req.session.vpcUrl,
            ownerId: req.session.ownerID,
            accessToken: req.session.accessToken
        });
    } else res.redirect("/");
}).get('/period/', function (req, res, next) {
    if (req.session.vpcUrl && req.session.ownerID && req.session.accessToken) {
        res.render('compare_period', {
            title: 'Analytics',
            current_page: 'compare',
            compare_page: 'period',
            server: req.session.vpcUrl,
            ownerId: req.session.ownerID,
            accessToken: req.session.accessToken
        });
    } else res.redirect("/");
});
/*================================================================
 API
 ================================================================*/
router.post('/api/location/polar/', function (req, res, next) {
    var startTime, endTime, locations, locDone, averageDone, numLoc, polarReq;
    var locResult = [];
    var dataAverage = [];
    if (req.body.hasOwnProperty('startTime') && req.body.hasOwnProperty('endTime')) {
        startTime = new Date(req.body['startTime']);
        endTime = new Date(req.body['endTime']);
        polarReq = req.body['reqId'];

        if (req.body.hasOwnProperty("locations")) {
            locations = JSON.parse(req.body['locations']);
            if (locations.length == 0) locations = [req.session.locations.id];
        } else locations = [req.session.locations.id];
        if (req.body.hasOwnProperty("filterFolder")) {
            switch (req.body["filterFolder"]) {
                case "GENERIC":
                    numLoc = req.session.locationsCount['folder'];
                    break;
                case "BUILDING":
                    numLoc = req.session.locationsCount['building'];
                    break;
                case "FLOOR":
                    numLoc = req.session.locationsCount['floor'];
                    break;
            }
        }

        locDone = 0;
        averageDone = false;
        var reqId = new Date().getTime();

        for (var location in locations) {
            API.clientlocation.clientcount.withEE(
                req.session.vpcUrl,
                req.session.accessToken,
                req.session.ownerID,
                locations[location],
                startTime.toISOString(),
                endTime.toISOString(),
                "compare location polar location",
                reqId
            );
        }
        API.clientlocation.clientcount.withEE(
            req.session.vpcUrl,
            req.session.accessToken,
            req.session.ownerID,
            req.session.locations.id,
            startTime.toISOString(),
            endTime.toISOString(),
            "compare location polar average",
            reqId
        );

        eventEmitter.on("compare location polar location", function (eventId, locId, err, data) {
            if (eventId == reqId) {
                if (err) res.json({error: err});
                else {
                    var name = Location.getLocationName(req.session.locations, locId);
                    var result = {
                        locationId: locId,
                        name: name,
                        uniqueClients: data['uniqueClients'],
                        engagedClients: data['engagedClients'],
                        passersbyClients: data['passersbyClients'],
                        associatedClients: data['associatedClients'],
                        unassociatedClients: data['unassociatedClients']
                    };
                    locResult.push(result);
                }
                locDone++;
                eventEmitter.emit("compare location polar finished", eventId);
            }
        })
            .on("compare location polar average", function (eventId, locId, err, data) {
                if (eventId == reqId) {
                    if (err) res.json({error: err});
                    else {
                        dataAverage = {
                            uniqueClients: parseInt((data['uniqueClients'] / numLoc).toFixed(0)),
                            engagedClients: parseInt((data['engagedClients'] / numLoc).toFixed(0)),
                            passersbyClients: parseInt((data['passersbyClients'] / numLoc).toFixed(0)),
                            associatedClients: parseInt((data['associatedClients'] / numLoc).toFixed(0)),
                            unassociatedClients: parseInt((data['unassociatedClients'] / numLoc).toFixed(0))

                        };
                    }
                    averageDone = true;
                    eventEmitter.emit("compare location polar finished", eventId);
                }
            })
            .on("compare location polar finished", function (eventId) {
                if (eventId == reqId) {
                    if (locDone == locations.length && averageDone) {
                        res.json({
                            error: null,
                            dataLocation: locResult,
                            dataAverage: dataAverage,
                            reqId: polarReq
                        })
                    }
                }
            });
    }
});
router.post('/api/location/timeline/', function (req, res, next) {
    var startTime, endTime, timeUnit, location, locations, locDone, timelineReq;
    var dataLocation = [];
    var timeserie = [];
    if (req.body.hasOwnProperty('startTime') && req.body.hasOwnProperty('endTime')) {
        startTime = new Date(req.body['startTime']);
        endTime = new Date(req.body['endTime']);
        if (endTime - startTime <= 172800000) {
            timeUnit = "FiveMinutes";
        } else if (endTime - startTime <= 604800000) {
            timeUnit = "OneHour";
        } else {
            timeUnit = "OneDay";
        }
        timelineReq = req.body['reqId'];

        if (req.body.hasOwnProperty("locations")) {
            locations = JSON.parse(req.body['locations']);
            if (locations.length == 0) locations = [req.session.locations.id];
        } else locations = [req.session.locations.id];

        var reqId = new Date().getTime();
        locDone = 0;

        for (var i = 0; i < locations.length; i++) {
            location = locations[i];
            API.clientlocation.clienttimeseries.withEE(
                req.session.vpcUrl,
                req.session.accessToken,
                req.session.ownerID,
                location,
                startTime.toISOString(),
                endTime.toISOString(),
                timeUnit,
                "compare location timeline",
                reqId);
        }


        eventEmitter
            .on("compare location timeline", function (eventId, locId, err, data) {
                if (eventId == reqId) {
                    if (err) res.json({error: err});
                    else {
                        var storeFrontClients, name;
                        name = Location.getLocationName(req.session.locations, locId);
                        for (var i in data['times']) {
                            if (data['times'][i]['unassociatedClients'] == 0) storeFrontClients = 0;
                            else storeFrontClients = ((data['times'][i]['engagedClients'] / data['times'][i]['unassociatedClients']) * 100).toFixed(0);
                            data['times'][i]['storefrontClients'] = parseInt(storeFrontClients);
                        }
                        timeserie = data['times'];
                        dataLocation.push({
                            name: name,
                            data: data['times']
                        });
                    }
                    locDone++;
                    eventEmitter.emit("compare location timeline finished", eventId);
                }
            })
            .on("compare location timeline finished", function (eventId) {
                if (eventId == reqId) {
                    if (locDone == locations.length) {
                        res.json({
                            error: null,
                            timeserie: timeserie,
                            dataLocation: dataLocation,
                            reqId: timelineReq
                        })
                    }
                }
            });
    } else res.json({error: "missing parameters"});
});

router.post("/api/period/polar/", function (req, res, next) {
    var oneHour, oneDay, oneWeek, oneMonth, range, reqPeriods;
    var startTime, endTime, location, locations, ajaxReqId;

    if (req.body.hasOwnProperty('startTime') && req.body.hasOwnProperty('endTime')) {
        startTime = new Date(req.body['startTime']);
        endTime = new Date(req.body['endTime']);
        range = endTime - startTime;

        ajaxReqId = req.body['reqId'];

        if (req.body.hasOwnProperty("locations")) {
            locations = JSON.parse(req.body['locations']);
            if (locations.length == 0) locations = [req.session.locations.id];
        } else locations = [req.session.locations.id];

        oneHour = 1000 * 60 * 60;
        oneDay = oneHour * 24;
        oneWeek = oneDay * 7;
        oneMonth = oneDay * 31;

        if (range <= oneDay) {
            reqPeriods = [{
                period: 'Today',
                start: startTime,
                end: endTime,
                "uniqueClients": 0,
                "engagedClients": 0,
                "passersbyClients": 0,
                "associatedClients": 0,
                "unassociatedClients": 0
            }];
            for (var i = 1; i <= 7; i++) {
                var startDay = new Date(startTime);
                startDay.setDate(startDay.getDate() - i);
                var endDay = new Date(endTime);
                endDay.setDate(endDay.getDate() - i);
                reqPeriods.push({
                    period: 'Day -' + i, start: startDay, end: endDay,
                    "uniqueClients": 0,
                    "engagedClients": 0,
                    "passersbyClients": 0,
                    "associatedClients": 0,
                    "unassociatedClients": 0
                })
            }
        }
        else if (range <= oneWeek) {
            reqPeriods = [{
                period: 'This Week', start: startTime, end: endTime,
                "uniqueClients": 0,
                "engagedClients": 0,
                "passersbyClients": 0,
                "associatedClients": 0,
                "unassociatedClients": 0
            }];
            for (var i = 1; i <= 5; i++) {
                var startWeek = new Date(startTime);
                startWeek.setDate(startWeek.getDate() - i * 7);
                var endWeek = new Date(endTime);
                endWeek.setDate(endWeek.getDate() - i * 7);
                reqPeriods.push({
                    period: 'Week -' + i, start: startWeek, end: endWeek,
                    "uniqueClients": 0,
                    "engagedClients": 0,
                    "passersbyClients": 0,
                    "associatedClients": 0,
                    "unassociatedClients": 0
                })
            }
        }
        else if (range <= oneMonth) {
            reqPeriods = [{
                period: 'This Month', start: startTime, end: endTime,
                "uniqueClients": 0,
                "engagedClients": 0,
                "passersbyClients": 0,
                "associatedClients": 0,
                "unassociatedClients": 0
            }];
            for (var i = 1; i <= 6; i++) {
                var startMonth = new Date(startTime);
                startMonth.setMonth(startMonth.getMonth() - i);
                var endMonth = new Date(endTime);
                endMonth.setMonth(endMonth.getMonth() - i);
                reqPeriods.push({
                    period: 'Month -' + i, start: startMonth, end: endMonth,
                    "uniqueClients": 0,
                    "engagedClients": 0,
                    "passersbyClients": 0,
                    "associatedClients": 0,
                    "unassociatedClients": 0
                })
            }
        }
        var reqDone = 0;
        var reqTotal = locations.length * reqPeriods.length;
        var reqId = new Date().getTime();
        for (var i = 0; i < locations.length; i++) {
            location = locations[i];
            for (var j = 0; j < reqPeriods.length; j++) {
                API.clientlocation.clientcount(
                    req.session.vpcUrl,
                    req.session.accessToken,
                    req.session.ownerID,
                    location,
                    reqPeriods[j]['start'].toISOString(),
                    reqPeriods[j]['end'].toISOString(),
                    function (err, result) {
                        if (err) {
                            res.json({error: err});
                            reqDone = -1;
                        } else {
                            reqDone++;
                            reqPeriods[this.j]['uniqueClients'] += result['uniqueClients'];
                            reqPeriods[this.j]['engagedClients'] += result['engagedClients'];
                            reqPeriods[this.j]['passersbyClients'] += result['passersbyClients'];
                            reqPeriods[this.j]['associatedClients'] += result['associatedClients'];
                            reqPeriods[this.j]['unassociatedClients'] += result['unassociatedClients'];
                            if (reqDone == reqTotal) {
                                var dataAverage = {
                                    "uniqueClients": 0,
                                    "engagedClients": 0,
                                    "passersbyClients": 0,
                                    "associatedClients": 0,
                                    "unassociatedClients": 0
                                };
                                for (var k = 0; k < reqPeriods.length; k++) {
                                    dataAverage['uniqueClients'] += reqPeriods[k]['uniqueClients'];
                                    dataAverage['engagedClients'] += reqPeriods[k]['engagedClients'];
                                    dataAverage['passersbyClients'] += reqPeriods[k]['passersbyClients'];
                                    dataAverage['associatedClients'] += reqPeriods[k]['associatedClients'];
                                    dataAverage['unassociatedClients'] += reqPeriods[k]['unassociatedClients'];
                                }
                                dataAverage['uniqueClients'] = parseInt((dataAverage['uniqueClients'] / reqPeriods.length).toFixed(0));
                                dataAverage['engagedClients'] = parseInt((dataAverage['engagedClients'] / reqPeriods.length).toFixed(0));
                                dataAverage['passersbyClients'] = parseInt((dataAverage['passersbyClients'] / reqPeriods.length).toFixed(0));
                                dataAverage['associatedClients'] = parseInt((dataAverage['associatedClients'] / reqPeriods.length).toFixed(0));
                                dataAverage['unassociatedClients'] = parseInt((dataAverage['unassociatedClients'] / reqPeriods.length).toFixed(0));
                                res.json({
                                    error: null,
                                    dataAverage: dataAverage,
                                    dataPeriod: reqPeriods,
                                    reqId: ajaxReqId
                                })
                            }
                        }
                    }.bind({j: j}));
            }
        }
    }
    else
        res.json({error: "missing parameters"});
});

router.post('/api/period/timeline/', function (req, res, next) {
    var oneHour, oneDay, oneWeek, oneMonth, range, reqPeriods, range;
    var startTime, endTime, timeUnit, location, locations, locDone, timelineReq, ajaxReqId;
    var dataLocation = [];
    var timeserie = [];

    ajaxReqId = req.body['reqId'];

    if (req.body.hasOwnProperty('startTime') && req.body.hasOwnProperty('endTime')) {
        startTime = new Date(req.body['startTime']);
        endTime = new Date(req.body['endTime']);
        range = endTime - startTime;
        if (range <= 172800000) {
            timeUnit = "FiveMinutes";
        } else if (range <= 604800000) {
            timeUnit = "OneHour";
        } else {
            timeUnit = "OneDay";
        }
        timelineReq = req.body['reqId'];

        if (req.body.hasOwnProperty("locations")) {
            locations = JSON.parse(req.body['locations']);
            if (locations.length == 0) locations = [req.session.locations.id];
        } else locations = [req.session.locations.id];

        var reqId = new Date().getTime();
        locDone = 0;

        oneHour = 1000 * 60 * 60;
        oneDay = oneHour * 24;
        oneWeek = oneDay * 7;
        oneMonth = oneDay * 31;

        if (range <= oneDay) {
            reqPeriods = [{period: 'Today', start: startTime, end: endTime, times: null}];
            for (var i = 1; i <= 7; i++) {
                var startDay = new Date(startTime);
                startDay.setDate(startDay.getDate() - i);
                var endDay = new Date(endTime);
                endDay.setDate(endDay.getDate() - i);
                reqPeriods.push({period: 'Day -' + i, start: startDay, end: endDay, times: null})
            }
        }
        else if (range <= oneWeek) {
            reqPeriods = [{period: 'This Week', start: startTime, end: endTime, times: null}];
            for (var i = 1; i <= 5; i++) {
                var startWeek = new Date(startTime);
                startWeek.setDate(startWeek.getDate() - i * 7);
                var endWeek = new Date(endTime);
                endWeek.setDate(endWeek.getDate() - i * 7);
                reqPeriods.push({
                    period: 'Week -' + i, start: startWeek, end: endWeek, times: null
                })
            }
        }
        else if (range <= oneMonth) {
            reqPeriods = [{period: 'This Month', start: startTime, end: endTime, times: null}];
            for (var i = 1; i <= 6; i++) {
                var startMonth = new Date(startTime);
                startMonth.setMonth(startMonth.getMonth() - i);
                var endMonth = new Date(endTime);
                endMonth.setMonth(endMonth.getMonth() - i);
                reqPeriods.push({period: 'Month -' + i, start: startMonth, end: endMonth, times: null})
            }
        }

        var reqDone = 0;
        var reqTotal = locations.length * reqPeriods.length;
        for (var i = 0; i < locations.length; i++) {
            location = locations[i];
            for (var j = 0; j < reqPeriods.length; j++) {
                API.clientlocation.clienttimeseries(
                    req.session.vpcUrl,
                    req.session.accessToken,
                    req.session.ownerID,
                    location,
                    reqPeriods[j]['start'].toISOString(),
                    reqPeriods[j]['end'].toISOString(),
                    timeUnit,
                    function (err, data) {
                        if (err) res.json({error: err});
                        else {
                            if (reqPeriods[this.j]['times'] == null) reqPeriods[this.j]["times"] = data['times'];
                            else {
                                for (var k = 0; k < data['times'].length; k++) {
                                    reqPeriods[this.j]["times"][k]['uniqueClients'] += data['times']['uniqueClients'];
                                    reqPeriods[this.j]["times"][k]['engagedClients'] += data['times']['engagedClients'];
                                    reqPeriods[this.j]["times"][k]['passersbyClients'] += data['times']['passersbyClients'];
                                    reqPeriods[this.j]["times"][k]['associatedClients'] += data['times']['associatedClients'];
                                    reqPeriods[this.j]["times"][k]['unassociatedClients'] += data['times']['unassociatedClients'];
                                }
                            }
                            reqDone++;
                            if (reqDone == reqTotal) {
                                var storeFrontClients;
                                for (var l = 0; l < reqPeriods.length; l++) {
                                    for (var m = 0; m < reqPeriods[l]["times"].length; m++) {
                                        timeserie.push(reqPeriods[l]["times"][m]['time']);
                                        if (reqPeriods[l]['times'][m]['unassociatedClients'] == 0) storeFrontClients = 0;
                                        else storeFrontClients = ((reqPeriods[l]['times'][m]['engagedClients'] / reqPeriods[l]['times'][m]['unassociatedClients']) * 100).toFixed(0);
                                        reqPeriods[l]['times'][m]['storefrontClients'] = parseInt(storeFrontClients);
                                    }
                                }
                                res.json({
                                    error: null,
                                    timeserie: timeserie,
                                    dataPeriod: reqPeriods,
                                    reqId: ajaxReqId
                                })
                            }
                        }
                    }.bind({j: j}));
            }
        }
    } else res.json({error: "missing parameters"});
});
module.exports = router;
