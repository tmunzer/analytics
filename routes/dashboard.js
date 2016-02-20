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
router.get('/', function (req, res, next) {
    if (req.session.vpcUrl && req.session.ownerID && req.session.accessToken) {
        res.render('dashboard', {
            title: 'Analytics',
            current_page: 'dashboard'
        })
    } else res.redirect("/");
});

/*================================================================
 API
 ================================================================*/
router.post('/api/init/', function (req, res, next) {
    API.monitor.device(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, function (err, devices) {
        if (err) res.json({error: err});
        else API.configuration.location(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, function (err, locations) {
            if (err) res.json({error: err});
            else {
                req.session.locations = locations;
                req.session.locationsCount = Location.countBuildings(req.session.locations);
                var devicesCount = Device.countDevices(devices);
                res.json({
                    error: null,
                    locationsCount: req.session.locationsCount,
                    devicesCount: devicesCount,
                    locations: locations
                });
            }
        });

    });
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

        var widgetReqId = new Date().getTime();

        for (var i = 0; i < locations.length; i++) {
            location = locations[i];

            API.clientlocation.clientcountWithEE(
                req.session.vpcUrl,
                req.session.accessToken,
                req.session.ownerID,
                location,
                startTime.toISOString(),
                endTime.toISOString(),
                "dashboard widget now", widgetReqId);
            if (endTime - startTime <= 604800000) {
                API.clientlocation.clientcountWithEE(
                    req.session.vpcUrl,
                    req.session.accessToken,
                    req.session.ownerID,
                    location,
                    startLastWeek.toISOString(),
                    endLastWeek.toISOString(),
                    "dashboard widget lastWeek", widgetReqId);
            } else locWeekDone = locations.length;
            if (endTime - startTime <= 2678400000) {
                API.clientlocation.clientcountWithEE(
                    req.session.vpcUrl,
                    req.session.accessToken,
                    req.session.ownerID,
                    location,
                    startLastMonth.toISOString(),
                    endLastMonth.toISOString(),
                    "dashboard widget lastMonth", widgetReqId);
            } else locMonthDone = locations.length;
            API.clientlocation.clientcountWithEE(
                req.session.vpcUrl,
                req.session.accessToken,
                req.session.ownerID,
                location,
                startLastYear.toISOString(),
                endLastYear.toISOString(),
                "dashboard widget lastYear", widgetReqId);
        }
    } else res.json({error: "missing parameters"});


    eventEmitter.on("dashboard widget now", function (eventId, locId, err, data) {
        if (eventId == widgetReqId) {
            if (err) {
                res.json({error: err});
                locNowDone = -1;
            } else {
                dataNow['uniqueClients'] += data.data['uniqueClients'];
                dataNow['engagedClients'] += data.data['engagedClients'];
                dataNow['passersbyClients'] += data.data['passersbyClients'];
                dataNow['associatedClients'] += data.data['associatedClients'];
                dataNow['unassociatedClients'] += data.data['unassociatedClients'];
                locNowDone++;
                eventEmitter.emit("dashboard widget finished", eventId);
            }
        }
    })
        .on("dashboard widget lastWeek", function (eventId, locId, err, data) {
            if (eventId == widgetReqId) {
                if (err) {
                    res.json({error: err});
                    locWeekDone = -1;
                } else {
                    dataLastWeek['uniqueClients'] += data.data['uniqueClients'];
                    dataLastWeek['engagedClients'] += data.data['engagedClients'];
                    dataLastWeek['passersbyClients'] += data.data['passersbyClients'];
                    dataLastWeek['associatedClients'] += data.data['associatedClients'];
                    dataLastWeek['unassociatedClients'] += data.data['unassociatedClients'];
                    locWeekDone++;
                    eventEmitter.emit("dashboard widget finished", eventId);
                }
            }
        })
        .on("dashboard widget lastMonth", function (eventId, locId, err, data) {
            if (eventId == widgetReqId) {
                if (err) {
                    res.json({error: err});
                    locMonthDone = -1;
                } else {
                    dataLastMonth['uniqueClients'] += data.data['uniqueClients'];
                    dataLastMonth['engagedClients'] += data.data['engagedClients'];
                    dataLastMonth['passersbyClients'] += data.data['passersbyClients'];
                    dataLastMonth['associatedClients'] += data.data['associatedClients'];
                    dataLastMonth['unassociatedClients'] += data.data['unassociatedClients'];
                    locMonthDone++;
                    eventEmitter.emit("dashboard widget finished", eventId);
                }
            }
        })
        .on("dashboard widget lastYear", function (eventId, locId, err, data) {
            if (eventId == widgetReqId) {
                if (err) {
                    res.json({error: err});
                    locYearDone = -1;
                }
                else {
                    dataLastYear['uniqueClients'] += data.data['uniqueClients'];
                    dataLastYear['engagedClients'] += data.data['engagedClients'];
                    dataLastYear['passersbyClients'] += data.data['passersbyClients'];
                    dataLastYear['associatedClients'] += data.data['associatedClients'];
                    dataLastYear['unassociatedClients'] += data.data['unassociatedClients'];
                    locYearDone++;
                    eventEmitter.emit("dashboard widget finished", eventId);
                }
            }
        })
        .on("dashboard widget finished", function (eventId) {
            if (eventId == widgetReqId) {
                if (locNowDone == locations.length
                    && locWeekDone == locations.length
                    && locMonthDone == locations.length
                    && locYearDone == locations.length) {
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
router.post("/api/update/widget-best/", function (req, res, next) {
    var startTime, endTime, locDone, bestLocations, locations, location, locationsToGet, i;
    if (req.body.hasOwnProperty('startTime') && req.body.hasOwnProperty('endTime')) {
        startTime = new Date(req.body['startTime']);
        endTime = new Date(req.body['endTime']);

        if (req.body.hasOwnProperty("locations")) {
            locations = JSON.parse(req.body['locations']);
            if (locations.length == 0) locations = [req.session.locations.id];
        } else locations = [req.session.locations.id];

        locDone = 0;
        bestLocations = {};
        locationsToGet = Location.getFilteredFloorsId(req.session.locations, locations, "BUILDING");
        for (i = 0; i < locationsToGet.length; i++) {
            location = locationsToGet[i];

            API.clientlocation.clientcount(
                req.session.vpcUrl,
                req.session.accessToken,
                req.session.ownerID,
                location,
                startTime.toISOString(),
                endTime.toISOString(),
                function (err, data) {
                    if (err) {
                        res.json({error: err});
                        locDone = -1;
                    }
                    else {
                        var storeFrontClients, name;
                        if (data.data['unassociatedClients'] == 0) storeFrontClients = 0;
                        else storeFrontClients = ((data.data['engagedClients']/data.data['unassociatedClients'])*100).toFixed(0);
                        name = Location.getLocationName(req.session.locations, this.location);
                        bestLocations[this.location] = {
                            name: name,
                            uniqueClients: data.data['uniqueClients'],
                            engagedClients: data.data['engagedClients'],
                            passersbyClients: data.data['passersbyClients'],
                            associatedClients: data.data['associatedClients'],
                            unassociatedClients: data.data['unassociatedClients'],
                            storeFrontClients: storeFrontClients
                        };
                        locDone++;
                        if (locDone == locationsToGet.length) {
                            res.json({
                                error: null,
                                data: {
                                    bestLocations: bestLocations
                                }
                            })
                        }
                    }
                }.bind({location: location}));

        }
    } else res.json({error: "missing parameters"});
});
module.exports = router;
