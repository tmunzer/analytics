var express = require('express');
var router = express.Router();

var devAccount = require("./../config").aerohive;
var endpoints = require("../bin/aerohive/api/main");

var Device = require("../bin/aerohive/models/device");
var Location = require("../bin/aerohive/models/location");
/*================================================================
 API
 ================================================================*/

/*================================================
 RETRIEVE AND SEND BACK THE LIST OF LOCATIONS
 =================================================*/
router.post('/configuration/apLocationFolders/', function(req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    endpoints.configuration.location.getLocations(currentApi, devAccount, function(err, locations){
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
/*================================================
 RETRIEVE AND SEND BACK THE LIST OF LOCATIONS,
    DEVICES AND SOME COUNTERS (NUMBER OF LOCATIONS,
    NUMBER OF DEVICES, ...)
 =================================================*/
router.post('/common/init/', function (req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    endpoints.configuration.location.getLocations(currentApi, devAccount, function (err, locations) {
        if (err) res.json({error: err});
        else if (! locations) res.json(
            {warning: {
                title: "There is no locations on this account...",
                message:"To be able to get the Presence Analytics Information, you have to configure the Locations on your " +
                "<a href='cloud.aerohive.com' target='_blank'>HiveManager NG account</a>"
            }});
        else endpoints.monitor.device.getDevices(currentApi, devAccount, function (err, devices) {
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
/*================================================
 API CALLED TO DISPLAY THE TIMELINE
 =================================================*/
router.post('/common/timeline/', function (req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    var startTime, endTime, timeUnit, locations, locDone, timelineReq;
    var timeline = [];

    if (req.body.hasOwnProperty('startTime') && req.body.hasOwnProperty('endTime')) {
        // retrieve the start time and end time from the POST method
        startTime = new Date(req.body['startTime']);
        endTime = new Date(req.body['endTime']);
        // set the TimeUnit depending on the duration to fit the ACS API constraints
        if (endTime - startTime <= 172800000) {
            timeUnit = "FiveMinutes";
        } else if (endTime - startTime <= 604800000) {
            timeUnit = "OneHour";
        } else {
            timeUnit = "OneDay";
        }
        // retrieve the "reqId" parameter from the POST Method.
        // This will be sent back to the web browser to identify the request
        timelineReq = req.body['reqId'];

        // if the "locations" parameter exists, and is not null, will filter the request based on the locations selected by the user
        // otherwise takes the "root" folder
        if (req.body.hasOwnProperty("locations")) {
            locations = JSON.parse(req.body['locations']);
            if (locations.length == 0) locations = [req.session.locations.id];
        } else locations = [req.session.locations.id];

        locDone = 0;

        // For each location, send the API call
        locations.forEach(function (location){
            endpoints.clientlocation.clienttimeseries.GET(currentApi, devAccount, location, startTime.toISOString(), endTime.toISOString(), timeUnit, function (err, result) {
                if (err) res.json({error: err});
                else {
                    // will addition the number of "unique client" from each location to get an overall number of unique clients
                    for (var i in result['times']) {
                        if (timeline.hasOwnProperty(i)) {
                            timeline[i]["uniqueClients"] += result['times'][i]['uniqueClients'];
                        } else timeline[i] = {time: result['times'][i]['time'], uniqueClients: result['times'][i]['uniqueClients']};
                    }
                }
                locDone++;
                // if all the locations are done, send back the response to the web browser
                if (locDone == locations.length) {
                    res.json({
                        error: null,
                        data: timeline,
                        reqId: timelineReq
                    });
                }
            });
        });
        } else res.json({error: "missing parameters"});
});

module.exports = router;
