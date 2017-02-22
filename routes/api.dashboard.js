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
        if (locations.length == 0) locations = req.session.locations.id;
    } else locations = req.session.locations.id;
    if (typeof locations == "number" || typeof locations == "string") locations = [locations];
    return locations;
}


/*================================================================
 API
 ================================================================*/
// route called to get the data for the cards at the top of the dashboard
router.get('/cards/', function (req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    var locations = locationsFromQuery(req);

    endpoints.monitor.device.getDevices(currentApi, devAccount, function (err, devices) {
        if (err) res.status(500).send(err);
        else {
            // get the list of locationID based on the selection made by the user
            var floorsFilter = Location.getFilteredFloorsId(req.session.locations, locations);
            // get the counters about location and devices, filtered on the locations
            var locationsCount = Location.countBuildings(req.session.locations, floorsFilter);
            var devicesCount = Device.countDevices(devices, floorsFilter);

            res.status(200).json({ locationsCount: locationsCount, devicesCount: devicesCount });
        }
    });
});

// route called to get the values for the charts on the dashboard
router.get('/widgets/', function (req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    var startTime, endTime, locations, locNowDone, locWeekDone, locMonthDone, locYearDone,
        startLastWeek, endLastWeek, startLastMonth, endLastMonth, startLastYear, endLastYear;
    var dataNow = {
        "uniqueClients": 0,
        "engagedClients": 0,
        "passersbyClients": 0,
        "associatedClients": 0,
        "unassociatedClients": 0,
        "newClients": 0,
        "returningClients": 0
    };
    var dataLastWeek = {
        "uniqueClients": 0,
        "engagedClients": 0,
        "passersbyClients": 0,
        "associatedClients": 0,
        "unassociatedClients": 0,
        "newClients": 0,
        "returningClients": 0
    };
    var dataLastMonth = {
        "uniqueClients": 0,
        "engagedClients": 0,
        "passersbyClients": 0,
        "associatedClients": 0,
        "unassociatedClients": 0,
        "newClients": 0,
        "returningClients": 0
    };
    var dataLastYear = {
        "uniqueClients": 0,
        "engagedClients": 0,
        "passersbyClients": 0,
        "associatedClients": 0,
        "unassociatedClients": 0,
        "newClients": 0,
        "returningClients": 0
    };
    if (req.query.startTime && req.query.endTime) {
        // retrieve the start time and end time from the POST method
        startTime = new Date(req.query['startTime']);
        endTime = new Date(req.query['endTime']);

        var locations = locationsFromQuery(req);

        locNowDone = 0;
        locWeekDone = 0;
        locMonthDone = 0;
        locYearDone = 0;

        // this "widgetReqId" is used to identify the calls to ACS API.
        // It is needed because of the use of "Event Emitter" instead of the callback method
        var widgetReqId = new Date().getTime();
        locations.forEach(function (location) {

            // get the values for the time range defined by the user
            // once done, call the Event "dashboard widget now"
            endpoints.clientlocation.clientcount.GET(
                currentApi,
                devAccount,
                location,
                startTime.toISOString(),
                endTime.toISOString(),
                function (err, data) {
                    // if there is an error, send the error message to the web browser
                    if (err) res.status(500).json({ error: err });
                    else {
                        // otherwise, add the values for the period of time defined by the user to the values for all the locations
                        dataNow['uniqueClients'] += data['uniqueClients'];
                        dataNow['engagedClients'] += data['engagedClients'];
                        dataNow['passersbyClients'] += data['passersbyClients'];
                        dataNow['associatedClients'] += data['associatedClients'];
                        dataNow['unassociatedClients'] += data['unassociatedClients'];
                        dataNow['newClients'] += data['newClients'];
                        dataNow['returningClients'] += data['returningClients'];
                        locNowDone++;
                        // call the last event to send back the data to the web browser (will check if all locations/periods are done)
                        end();
                    }
                });

            // if time range < 1 week, get the value for the previous week
            // once done, call the Event "dashboard widget lastWeek"
            if (endTime - startTime <= 604800000) {
                // calculate the start/end dates for the previous week
                startLastWeek = new Date(startTime);
                startLastWeek.setDate(startLastWeek.getDate() - 7);
                endLastWeek = new Date(endTime);
                endLastWeek.setDate(endLastWeek.getDate() - 7);
                endpoints.clientlocation.clientcount.GET(
                    currentApi,
                    devAccount,
                    location,
                    startLastWeek.toISOString(),
                    endLastWeek.toISOString(),
                    function (err, data) {
                        // if there is an error, send the error message to the web browser
                        if (err) res.status(500).json({ error: err });
                        else {
                            // otherwise, add the values for previous week to the values for all the locations
                            dataLastWeek['uniqueClients'] += data['uniqueClients'];
                            dataLastWeek['engagedClients'] += data['engagedClients'];
                            dataLastWeek['passersbyClients'] += data['passersbyClients'];
                            dataLastWeek['associatedClients'] += data['associatedClients'];
                            dataLastWeek['unassociatedClients'] += data['unassociatedClients'];
                            dataLastWeek['newClients'] += data['newClients'];
                            dataLastWeek['returningClients'] += data['returningClients'];
                            locWeekDone++;
                            // call the last event to send back the data to the web browser (will check if all locations/periods are done)
                            end();
                        }
                    });
                // else, indicate that all the "weeks" are done
            } else locWeekDone = locations.length;

            // if time range < 1 month, get the value for the previous week
            // once done, call the Event "dashboard widget lastMonth"
            if (endTime - startTime <= 2678400000) {
                // calculate the start/end dates for the previous month
                startLastMonth = new Date(startTime);
                startLastMonth.setMonth(startLastMonth.getMonth() - 1);
                endLastMonth = new Date(endTime);
                endLastMonth.setMonth(endLastMonth.getMonth() - 1);
                endpoints.clientlocation.clientcount.GET(
                    currentApi,
                    devAccount,
                    location,
                    startLastMonth.toISOString(),
                    endLastMonth.toISOString(),
                    function (err, data) {
                        // if there is an error, send the error message to the web browser
                        if (err) res.status(500).json({ error: err });
                        else {
                            // otherwise, add the values for previous month to the values for all the locations
                            dataLastMonth['uniqueClients'] += data['uniqueClients'];
                            dataLastMonth['engagedClients'] += data['engagedClients'];
                            dataLastMonth['passersbyClients'] += data['passersbyClients'];
                            dataLastMonth['associatedClients'] += data['associatedClients'];
                            dataLastMonth['unassociatedClients'] += data['unassociatedClients'];
                            dataLastMonth['newClients'] += data['newClients'];
                            dataLastMonth['returningClients'] += data['returningClients'];
                            locMonthDone++;
                            // call the last event to send back the data to the web browser (will check if all locations/periods are done)
                            end();
                        }
                    });
                // else, indicate that all the "months" are done
            } else locMonthDone = locations.length;

            // Get the value for the previous Year
            // once done, call the Event "dashboard widget lastYear"
            // calculate the start/end dates for the previous Year
            startLastYear = new Date(startTime);
            startLastYear.setFullYear(startLastYear.getFullYear() - 1);
            endLastYear = new Date(endTime);
            endLastYear.setFullYear(endLastYear.getFullYear() - 1);
            endpoints.clientlocation.clientcount.GET(
                currentApi,
                devAccount,
                location,
                startLastYear.toISOString(),
                endLastYear.toISOString(),
                function (err, data) {
                    // if there is an error, send the error message to the web browser
                    if (err) res.status(500).json({ error: err });
                    else {
                        // otherwise, add the values for previous year to the values for all the locations
                        dataLastYear['uniqueClients'] += data['uniqueClients'];
                        dataLastYear['engagedClients'] += data['engagedClients'];
                        dataLastYear['passersbyClients'] += data['passersbyClients'];
                        dataLastYear['associatedClients'] += data['associatedClients'];
                        dataLastYear['unassociatedClients'] += data['unassociatedClients'];
                        dataLastYear['newClients'] += data['newClients'];
                        dataLastYear['returningClients'] += data['returningClients'];
                        locYearDone++;
                        // call the last event to send back the data to the web browser (will check if all locations/periods are done)
                        end();
                    }
                });
        });
    } else res.status(400).json({ error: "missing parameters" });

    function end() {
        if (locNowDone == locations.length
            && locWeekDone == locations.length
            && locMonthDone == locations.length
            && locYearDone == locations.length) {
            // if all locations/periods are done, send back the response to the web browser
            res.status(200).json({
                dataNow: dataNow,
                dataLastWeek: dataLastWeek,
                dataLastMonth: dataLastMonth,
                dataLastYear: dataLastYear
            })
        }
    }
});

//api call to get the values for the "Best locations by" charts
router.get("/widget-top/", function (req, res, next) {
    var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];

    var startTime, endTime, locDone, topLocations, locations, buildings;
    if (req.query.startTime && req.query.endTime) {
        // retrieve the start time and end time from the POST method
        startTime = new Date(req.query.startTime);
        endTime = new Date(req.query.endTime);

        var locations = locationsFromQuery(req);

        locDone = 0;
        topLocations = {};
        // get the list of buildings
        buildings = Location.getFilteredFloorsId(req.session.locations, locations, "BUILDING");
        buildings.forEach(function (location) {
            // for each building, get the data from ACS
            endpoints.clientlocation.clientcount.GET(
                currentApi,
                devAccount,
                location,
                startTime.toISOString(),
                endTime.toISOString(),
                function (err, data) {
                    if (err) res.status(500).json({ error: err });
                    else {
                        var storefront, name;
                        // calculate the storefront conversion
                        if (data['uniqueClients'] == 0) storefront = 0;
                        else storefront = ((data['engagedClients'] / data['uniqueClients']) * 100).toFixed(0);
                        // get the location name
                        name = Location.getLocationName(req.session.locations, this.location);
                        // add each locations to the "topLocations" dictionary
                        topLocations[this.location] = {
                            name: name,
                            uniqueClients: data['uniqueClients'],
                            engagedClients: data['engagedClients'],
                            passersbyClients: data['passersbyClients'],
                            associatedClients: data['associatedClients'],
                            unassociatedClients: data['unassociatedClients'],
                            newClients: data['newClients'],
                            returningClients: data['returningClients'],
                            storefront: parseInt(storefront)
                        };
                        locDone++;
                        // if all the locations are done, will send the response back to the web browser
                        if (locDone == buildings.length) res.status(200).json({ topLocations: topLocations })

                    }
                }.bind({ location: location }));

        });
    } else res.status(400).json({ error: "missing parameters" });
});
module.exports = router;
