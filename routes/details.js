var express = require('express');
var router = express.Router();

var devAccount = require("./../config").devAccount;
var endpoints = require("../bin/aerohive/api/main");
/*================================================================
 ROUTES
 ================================================================*/
/*================================================================
 DETAILS
 ================================================================*/
router.get('/', function (req, res, next) {
    if (req.session.xapi) {
        var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];
        res.render('details', {
            title: 'Analytics',
            current_page: 'details',
            server: currentApi.vpcUrl,
            ownerId: currentApi.ownerId,
            accessToken: currentApi.accessToken
        });
    } else res.redirect("/login/");
});


/*================================================================
 API
 ================================================================*/
// api call called to get the list of locations
router.post('/api/init/', function (req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    endpoints.configuration.location.getLocations(currentApi, devAccount, function (err, locations) {
        if (err) res.send(err);
        else {
            req.session.locations = locations;
            res.json({
                error: null,
                locations: locations
            });
        }
    });
});
// api call to get the list of clients over the time (heatmap display on the browser)
router.post('/api/clienttimeseries/', function (req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    var startTime, endTime, timeUnit, locDone, locations, series, timeseries;
    series = [];
    timeseries = [];
    locDone = 0;
    if (req.body.startTime && req.body.endTime) {
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

        // if the "locations" parameter exists, and is not null, will filter the request based on the locations selected by the user
        // otherwise takes the "root" folder
        if (req.body.locations && req.body.locations.length > 0) {
            locations = JSON.parse(req.body['locations']);
            if (locations.length == 0) locations = [req.session.locations.id];
        } else locations = [req.session.locations.id];

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
                    if (err) res.json({error: err});
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
                        res.send({error: null, data: timeseries});
                    }
                }
            )
        });
    } else res.json({error: "missing parameters"});
});

module.exports = router;