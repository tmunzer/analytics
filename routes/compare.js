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
        res.render('compare', {
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
router.post('/api/polar/', function (req, res, next) {
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
router.post('/api/timeline/', function (req, res, next) {
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
                        for (var i in data['times']){
                            if (data['times'][i]['unassociatedClients'] == 0) storeFrontClients = 0;
                            else storeFrontClients = ((data['times'][i]['engagedClients']/data['times'][i]['unassociatedClients'])*100).toFixed(0);
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

module.exports = router;
