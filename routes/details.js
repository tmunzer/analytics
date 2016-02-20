var express = require('express');
var router = express.Router();

var API = require(appRoot + "/bin/aerohive/api/main");
var Device = require(appRoot + "/bin/aerohive/models/device");
var Location = require(appRoot + "/bin/aerohive/models/location");
/*================================================================
 PARAMETERS
 ================================================================*/

/*================================================================
 ROUTES
 ================================================================*/
/*================================================================
 DASHBOARD
 ================================================================*/
router.get('/', function(req, res, next){
    if (req.session.vpcUrl && req.session.ownerID && req.session.accessToken){
        res.render('details', {
            title: 'Analytics',
            current_page: 'details'
        });
    } else res.redirect("/");
});


/*================================================================
 API
 ================================================================*/

router.post('/api/init/', function (req, res, next) {
    API.configuration.location(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, function (err, locations) {
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
router.post('/api/clienttimeseries/', function(req, res, next) {
    var startTime, endTime, timeUnit, locDone, location, locations, series, timeseries;
    series = [];
    timeseries = [];
    locDone = 0;

    startTime = new Date(req.body['startTime']);
    endTime = new Date(req.body['endTime']);
    if (endTime - startTime <= 172800000) {
        timeUnit = "FiveMinutes";
    } else if (endTime - startTime <= 2678400000) {
        timeUnit = "OneHour";
    } else {
        timeUnit = "OneDay";
    }

    if (req.body.hasOwnProperty("locations")) {
        locations = JSON.parse(req.body['locations']);
        if (locations.length == 0) locations = [req.session.locations.id];
    } else locations = [req.session.locations.id];

    for (var i = 0; i < locations.length; i++) {
        location = locations[i];
        API.clientlocation.clienttimeseries(
            req.session.vpcUrl,
            req.session.accessToken,
            req.session.ownerID,
            location,
            startTime.toISOString(),
            endTime.toISOString(),
            timeUnit,
            function (err, result) {
                if (err) res.json({error: err});
                else {
                    series = result['times'];
                    for (var i in series) {
                        if (timeseries.hasOwnProperty(i)) {
                            timeseries[i]["uniqueClients"] += series[i]['uniqueClients'];
                            timeseries[i]["engagedClients"] += series[i]['engagedClients'];
                            timeseries[i]["passersbyClients"] += series[i]['passersbyClients'];
                            timeseries[i]["associatedClients"] += series[i]['associatedClients'];
                            timeseries[i]["unassociatedClients"] += series[i]['unassociatedClients'];
                        } else timeseries[i] = series[i];
                    }
                }
                locDone ++;
                if (locDone == locations.length){
                    res.send({error: null, data: timeseries});
                }
            }
        )
    }
});

module.exports = router;