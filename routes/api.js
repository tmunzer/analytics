var express = require('express');
var router = express.Router();
var API = require(appRoot + "/bin/aerohive/api/main");


/* GET home page. */
router.post('/clientlocation/clienttimeseries/', function(req, res, next) {
        API.clientlocation.clienttimeseries(
            req.session.vpcUrl,
            req.session.accessToken,
            req.session.ownerID,
            req.body.location,
            req.body.startTime,
            req.body.endTime,
            req.body.timeUnit,
            function(err, data){
                res.send(data);
            }
        )
})
    .post('/configuration/apLocationFolders/', function(req, res, next) {
    API.configuration.location(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, function(err, locations){
        console.log(locations);
        res.send(locations.data);
    });
});

module.exports = router;
