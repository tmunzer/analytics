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
        res.render('performance', {
            title: 'Analytics',
            current_page: 'performance'
        });
    }
}).get('/:vpcUrl/:ownerID/:accessToken', function (req, res, next) {
    res.render('performance', {
        title: 'Analytics',
        current_page: 'performance'
    });
}).get('/', function(req, res, next){
    if (req.session.vpcUrl && req.session.ownerID && req.session.accessToken){
        res.render('performance', {
            title: 'Analytics',
            current_page: 'performance'
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
                    series = result.data['times'];
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