var express = require('express');
var router = express.Router();

var devAccount = require("./../config").devAccount;
var endpoints = require("../bin/aerohive/api/main");

var Device = require("../bin/aerohive/models/device");
var Location = require("../bin/aerohive/models/location");

/*================================================================
 COMMON FUNCTIONS
 ================================================================*/
function locationsFromQuery(req) {
    // if the "locations" parameter exists, and is not null, will filter the request based on the locations selected by the user
    // otherwise takes the "root" folder
    if (req.query.locations && req.query.locations.length > 0) {
        locations = req.query.locations;
        if (locations.length == 0) locations = [req.session.locations.id];
    } else locations = [req.session.locations.id];
    if (typeof locations == "number" || typeof locations == "string") locations = [locations];
    return locations;
}


/*================================================================
 API
 ================================================================*/

/*================================================
 RETRIEVE AND SEND BACK THE LIST OF LOCATIONS
 =================================================*/
router.get('/apLocationFolders/', function (req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    endpoints.configuration.location.getLocations(currentApi, devAccount, function (err, locations) {
        console.log(err, locations);
        if (err) res.status(err.status).json({ error: err });
        else if (locations == null) res.json(
            {
                warning: {
                    title: "No MAP configured",
                    message: "To be able to get the Presence Analytics Information, you have to configure the Locations on your " +
                    "<a href='http://cloud.aerohive.com' target='_blank'>HiveManager NG account</a>"
                }
            });
        else {
            if (!req.session.locations) req.session.locations = locations;
            if (!req.session.locationsCount) req.session.locationsCount = Location.countBuildings(req.session.locations);
            res.send(locations);
        }
    });
});

/*================================================
 API CALLED TO DISPLAY THE TIMELINE
 =================================================*/
router.get('/timeline/', function (req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    var startTime, endTime, timeUnit, locations, locDone;
    var timeline = [];

    if (req.query.startTime && req.query.endTime) {
        // retrieve the start time and end time from the POST method
        startTime = new Date(req.query.startTime);
        endTime = new Date(req.query.endTime);
        // set the TimeUnit depending on the duration to fit the ACS API constraints
        if (endTime - startTime <= 172800000) {
            timeUnit = "FiveMinutes";
        } else if (endTime - startTime <= 604800000) {
            timeUnit = "OneHour";
        } else {
            timeUnit = "OneDay";
        }

        // if the "locations" parameter exists, and is not null, will filter the request based on the locations selected by the user
        // otherwise takes the "root" folder
        var locations = locationsFromQuery(req);

        locDone = 0;

        // For each location, send the API call
        locations.forEach(function (location) {
            endpoints.clientlocation.clienttimeseries.GET(currentApi, devAccount, location, startTime.toISOString(), endTime.toISOString(), timeUnit, function (err, result) {
                if (err && err.status) res.status(err.status).json({ error: err });
                else if (err) res.status(500).json({ error: err });
                else {
                    // will addition the number of "unique client" from each location to get an overall number of unique clients
                    for (var i in result['times']) {
                        if (timeline[i]) {
                            timeline[i]["uniqueClients"] += result['times'][i]['uniqueClients'];
                        } else timeline[i] = { time: result['times'][i]['time'], uniqueClients: result['times'][i]['uniqueClients'] };
                    }
                    locDone++;
                    // if all the locations are done, send back the response to the web browser
                    if (locDone == locations.length) {
                        res.json({
                            data: timeline
                        });
                    }
                }

            });
        });
    } else res.status(403).json({ error: "missing parameters" });
});

module.exports = router;
