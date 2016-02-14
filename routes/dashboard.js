var express = require('express');
var router = express.Router();

var API = require(appRoot + "/bin/aerohive/api/main");
var Device = require(appRoot + "/bin/aerohive/models/device");
var Location = require(appRoot + "/bin/aerohive/models/location");
/*================================================================
 PARAMETERS
 ================================================================*/

router.param("vpcUrl", function (req, res, next, vpcUrl) {
    var apiServers = ["cloud-va.aerohive.com", "cloud-ie.aerohive.com"];
    if (!apiServers.hasOwnProperty(vpcUrl)) {
        res.redirect("/?errorcode=1");
    } else {
        req.session.vpcUrl = apiServers[vpcUrl];
        next();
    }
});
router.param("ownerID", function (req, res, next, ownerID) {
    var ownerIdRegexp = new RegExp("^[0-9]*$");
    if (!ownerIdRegexp.test(ownerID)) {
        res.redirect("/?errorcode=2");
    } else {
        req.session.ownerID = ownerID;
        next();
    }
});
router.param("accessToken", function (req, res, next, accessToken) {
    var accessTokenRegexp = new RegExp("^[a-zA-Z0-9]{40}$");
    if (!accessTokenRegexp.test(accessToken)) {
        res.redirect("/?errorcode=3");
    } else {
        req.session.accessToken = accessToken;
        next();
    }
});

/*================================================================
 ROUTES
 ================================================================*/
/*================================================================
 DASHBOARD
 ================================================================*/
router.post('/', function (req, res, next) {
    var ownerIdRegexp = new RegExp("^[0-9]*$");
    var accessTokenRegexp = new RegExp("^[a-zA-Z0-9]{40}$");
    var apiServers = ["cloud-va.aerohive.com", "cloud-ie.aerohive.com"];
    if (!(req.body.hasOwnProperty("vpcUrl") && apiServers.indexOf(req.body["vpcUrl"]) >= 0)) {
        res.redirect("/?errorcode=1");
    } else if (!(req.body.hasOwnProperty("ownerID") && ownerIdRegexp.test(req.body['ownerID']))) {
        res.redirect("/?errorcode=2");
    } else if (!(req.body.hasOwnProperty("accessToken") && accessTokenRegexp.test(req.body["accessToken"].trim()))) {
        res.redirect("/?errorcode=3");
    } else {
        req.session.vpcUrl = req.body["vpcUrl"];
        req.session.ownerID = req.body["ownerID"];
        req.session.accessToken = req.body["accessToken"].trim();
        res.render('dashboard', {title: 'Analytics'});
    }
}).get('/:vpcUrl/:ownerID/:accessToken', function (req, res, next) {
    res.render('dashboard', {title: 'Analytics'});
}).get('/', function(req, res, next){
    res.redirect("/");
});


/*================================================================
 API
 ================================================================*/
router.post('/api/init/', function (req, res, next) {
    API.monitor.device(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, function (err, devices) {
        if (err) res.send(err);
        else API.configuration.location(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, function (err, locations) {
            if (err) res.send(err);
            else {
                req.session.locations = locations;
                var locationsCount = Location.countBuildings(req.session.locations);
                var devicesCount = Device.countDevices(devices);
                res.json({
                    error: null,
                    locationsCount: locationsCount,
                    devicesCount: devicesCount,
                    locations: locations
                });
            }
        });

    });
});
router.post('/api/timeline', function (req, res, next) {
    var startTime, endTime, timeUnit, location, locations, locDone;
    var timeline = [];
    var series = [];
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

        if (req.body.hasOwnProperty("locations")) {
            locations = JSON.parse(req.body['locations']);
            if (locations.length == 0) locations = [req.session.locations.id];
        } else locations = [req.session.locations.id];
        locDone = 0;
        for (var i = 0; i < locations.length; i++) {
            location = locations[i];
            API.clientlocation.clienttimeseries(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, location, startTime.toISOString(), endTime.toISOString(), timeUnit, function (err, result) {
                if (err) res.json({error: err});
                else {
                    series = result.data['times'];
                    for (var i in series) {
                        if (timeline.hasOwnProperty(i)) {
                            timeline[i]["uniqueClients"] += series[i]['uniqueClients'];
                        } else timeline[i] = {time: series[i]['time'], uniqueClients: series[i]['uniqueClients']};
                    }
                }
                locDone++;
                if (locDone == locations.length) {
                    res.json({error: null, data: timeline});
                }
            });
        }
    } else res.json({error: "missing parameters"});
});
router.post('/api/update/cards/', function (req, res, next) {
    var locations = [];
    if (req.body.hasOwnProperty('locations')) locations = JSON.parse(req.body['locations']);

    API.monitor.device(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, function (err, devices) {
        if (err) res.send(err);
        var floorsFilter = Location.getFilteredFloorsId(req.session.locations, locations);
        var locationsCount = Location.countBuildings(req.session.locations, floorsFilter);
        var devicesCount = Device.countDevices(devices, floorsFilter);

        res.json({error: null, locationsCount: locationsCount, devicesCount: devicesCount});
    });
});
router.post('/api/update/widgets/', function (req, res, next) {
    var startTime, endTime, location, locations, locNowDone, locWeekDone, locMonthDone, locYearDone,
        startLastWeek, endLastWeek, startLastMonth, endLastMonth, startLastYear, endLastYear;
    var dataNow = {
        "uniqueClients": 0,
        "engagedClients": 0,
        "passersbyClients": 0,
        "associatedClients": 0,
        "unassociatedClients": 0
    };
    var dataLastWeek = {
        "uniqueClients": 0,
        "engagedClients": 0,
        "passersbyClients": 0,
        "associatedClients": 0,
        "unassociatedClients": 0
    };
    var dataLastMonth = {
        "uniqueClients": 0,
        "engagedClients": 0,
        "passersbyClients": 0,
        "associatedClients": 0,
        "unassociatedClients": 0
    };
    var dataLastYear = {
        "uniqueClients": 0,
        "engagedClients": 0,
        "passersbyClients": 0,
        "associatedClients": 0,
        "unassociatedClients": 0
    };
    if (req.body.hasOwnProperty('startTime') && req.body.hasOwnProperty('endTime')) {
        startTime = new Date(req.body['startTime']);
        endTime = new Date(req.body['endTime']);
        if (endTime - startTime <= 604800000) {
            startLastWeek = new Date(startTime);
            startLastWeek.setDate(startLastWeek.getDate() - 7);
            endLastWeek = new Date(endTime);
            endLastWeek.setDate(endLastWeek.getDate() - 7);
        }
        if (endTime - startTime <= 2678400000) {
            startLastMonth = new Date(startTime);
            startLastMonth.setMonth(startLastMonth.getMonth() - 1);
            endLastMonth = new Date(endTime);
            endLastMonth.setMonth(endLastMonth.getMonth() - 1);
        }

        startLastYear = new Date(startTime);
        startLastYear.setFullYear(startLastYear.getFullYear() - 1);
        endLastYear = new Date(endTime);
        endLastYear.setFullYear(endLastYear.getFullYear() - 1);

        if (req.body.hasOwnProperty("locations")) {
            locations = JSON.parse(req.body['locations']);
            if (locations.length == 0) locations = [req.session.locations.id];
        } else locations = [req.session.locations.id];

        locNowDone = 0;
        locWeekDone = 0;
        locMonthDone = 0;
        locYearDone = 0;

        var reqId = new Date().getTime();

        for (var i = 0; i < locations.length; i++) {
            location = locations[i];

            API.clientlocation.clientcountWithEE(
                req.session.vpcUrl,
                req.session.accessToken,
                req.session.ownerID,
                location,
                startTime.toISOString(),
                endTime.toISOString(),
                "dashboard widget now", reqId);
            if (endTime - startTime <= 604800000) {
                API.clientlocation.clientcountWithEE(
                    req.session.vpcUrl,
                    req.session.accessToken,
                    req.session.ownerID,
                    location,
                    startLastWeek.toISOString(),
                    endLastWeek.toISOString(),
                    "dashboard widget lastWeek", reqId);
            } else locWeekDone = locations.length;
            if (endTime - startTime <= 2678400000) {
                API.clientlocation.clientcountWithEE(
                    req.session.vpcUrl,
                    req.session.accessToken,
                    req.session.ownerID,
                    location,
                    startLastMonth.toISOString(),
                    endLastMonth.toISOString(),
                    "dashboard widget lastMonth", reqId);
            } else locMonthDone = locations.length;
            API.clientlocation.clientcountWithEE(
                req.session.vpcUrl,
                req.session.accessToken,
                req.session.ownerID,
                location,
                startLastYear.toISOString(),
                endLastYear.toISOString(),
                "dashboard widget lastYear", reqId);
        }
    } else res.json({error: "missing parameters"});


    eventEmitter.on("dashboard widget now", function (enventId, err, data) {
        if (enventId == reqId) {
            if (err) res.json({error: err});
            else {
                dataNow['uniqueClients'] += data.data['uniqueClients'];
                dataNow['engagedClients'] += data.data['engagedClients'];
                dataNow['passersbyClients'] += data.data['passersbyClients'];
                dataNow['associatedClients'] += data.data['associatedClients'];
                dataNow['unassociatedClients'] += data.data['unassociatedClients'];
            }
            locNowDone++;
            eventEmitter.emit("dashboard widget finished", enventId);
        }
    })
        .on("dashboard widget lastWeek", function (enventId, err, data) {
            if (enventId == reqId) {
                if (err) res.json({error: err});
                else {
                    dataLastWeek['uniqueClients'] += data.data['uniqueClients'];
                    dataLastWeek['engagedClients'] += data.data['engagedClients'];
                    dataLastWeek['passersbyClients'] += data.data['passersbyClients'];
                    dataLastWeek['associatedClients'] += data.data['associatedClients'];
                    dataLastWeek['unassociatedClients'] += data.data['unassociatedClients'];
                }
                locWeekDone++;
                eventEmitter.emit("dashboard widget finished", enventId);
            }
        })
        .on("dashboard widget lastMonth", function (enventId, err, data) {
            if (enventId == reqId) {
                if (err) res.json({error: err});
                else {
                    dataLastMonth['uniqueClients'] += data.data['uniqueClients'];
                    dataLastMonth['engagedClients'] += data.data['engagedClients'];
                    dataLastMonth['passersbyClients'] += data.data['passersbyClients'];
                    dataLastMonth['associatedClients'] += data.data['associatedClients'];
                    dataLastMonth['unassociatedClients'] += data.data['unassociatedClients'];
                }
                locMonthDone++;
                eventEmitter.emit("dashboard widget finished", enventId);
            }
        })
        .on("dashboard widget lastYear", function (enventId, err, data) {
            if (enventId == reqId) {
                if (err) res.json({error: err});
                else {
                    dataLastYear['uniqueClients'] += data.data['uniqueClients'];
                    dataLastYear['engagedClients'] += data.data['engagedClients'];
                    dataLastYear['passersbyClients'] += data.data['passersbyClients'];
                    dataLastYear['associatedClients'] += data.data['associatedClients'];
                    dataLastYear['unassociatedClients'] += data.data['unassociatedClients'];
                }
                locYearDone++;
                eventEmitter.emit("dashboard widget finished", enventId);
            }
        })
        .on("dashboard widget finished", function (enventId) {
            if (enventId == reqId) {
                if (locNowDone == locations.length
                    && locWeekDone == locations.length
                    && locMonthDone == locations.length
                    && locYearDone == locations.length) {
                    console.log("============================= END");
                    res.json({
                        error: null,
                        dataNow: dataNow,
                        dataLastWeek: dataLastWeek,
                        dataLastMonth: dataLastMonth,
                        dataLastYear: dataLastYear
                    })
                }
            }
        });
});
module.exports = router;
