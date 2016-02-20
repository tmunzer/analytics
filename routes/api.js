var express = require('express');
var router = express.Router();
var API = require(appRoot + "/bin/aerohive/api/main");
var Device = require(appRoot + "/bin/aerohive/models/device");
var Location = require(appRoot + "/bin/aerohive/models/location");

/* GET home page. */

router.post('/configuration/apLocationFolders/', function(req, res, next) {
    API.configuration.location(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, function(err, locations){
        if (err) res.json({error: err});
        else if (locations == null) res.json(
            {warning: {
                title: "No MAP configured",
                message:"To be able to get the Presence Analytics Information, you have to configure the Locations on your " +
                "<a href='http://cloud.aerohive.com' target='_blank'>HiveManager NG account</a>"
            }});
        else res.send(locations);
    });
});
router.post('/common/init/', function (req, res, next) {
    API.configuration.location(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, function (err, locations) {
        if (err) res.json({error: err});
        else if (! locations) res.json(
            {warning: {
                title: "There is no locations on this account...",
                message:"To be able to get the Presence Analytics Information, you have to configure the Locations on your " +
                "<a href='cloud.aerohive.com' target='_blank'>HiveManager NG account</a>"
            }});
        else API.monitor.device(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, function (err, devices) {
                if (err) res.json({error: err});
                else if (!devices) res.json(
                    {
                        warning: {
                            title: "There is no devices on this account...",
                            message: "To be able to get the Presence Analytics Information, you have to configure the Locations on your HiveManager NG account"
                        }
                    });
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
router.post('/common/timeline/', function (req, res, next) {
    var startTime, endTime, timeUnit, location, locations, locDone, timelineReq;
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
        timelineReq = req.body['reqId'];

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
                    series = result['times'];
                    for (var i in series) {
                        if (timeline.hasOwnProperty(i)) {
                            timeline[i]["uniqueClients"] += series[i]['uniqueClients'];
                        } else timeline[i] = {time: series[i]['time'], uniqueClients: series[i]['uniqueClients']};
                    }
                }
                locDone++;
                if (locDone == locations.length) {
                    res.json({
                        error: null,
                        data: timeline,
                        reqId: timelineReq
                    });
                }
            });
        }
    } else res.json({error: "missing parameters"});
});

module.exports = router;
