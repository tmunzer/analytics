var express = require('express');
var router = express.Router();

var devAccount = require("./../config").devAccount;
var endpoints = require("../bin/aerohive/api/main");

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

// api call to get the list of clients over the time (heatmap display on the browser)
router.get('/clienttimeseries/', function (req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    var startTime, endTime, timeUnit, locations;
    var series = [];
    var timeseries = [];
    var errors = [];
    var locDone = 0;
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

        locations = locationsFromQuery(req)

        locations.forEach(function (location) {
            // retrieve the data from the ACS for every selected location
            endpoints.clientlocation.clienttimeseries.GET(
                currentApi,
                devAccount,
                location,
                startTime.toISOString(),
                endTime.toISOString(),
                timeUnit,
                function (err, result) {
                    if (err) errors.push(err);
                    else {
                        // create the array for the xAxis
                        series = result['times'];
                        for (var i in series) {
                            //add the values for this location to the values for all locations
                            if (timeseries[i]) {
                                timeseries[i]["uniqueClients"] += series[i]['uniqueClients'];
                                timeseries[i]["engagedClients"] += series[i]['engagedClients'];
                                timeseries[i]["passersbyClients"] += series[i]['passersbyClients'];
                                timeseries[i]["associatedClients"] += series[i]['associatedClients'];
                                timeseries[i]["unassociatedClients"] += series[i]['unassociatedClients'];
                            } else timeseries[i] = series[i];
                        }
                    }
                    locDone++;
                    // if all locations are done, send back the response to the web browser
                    if (locDone == locations.length) {
                        if (errors.length > 0) res.status(500).json({ errors: errors });
                        else res.status(200).send({ timeseries: timeseries });
                    }
                }
            )
        });
    } else res.status(400).json({ error: "missing parameters" });
});

module.exports = router;