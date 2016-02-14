var express = require('express');
var router = express.Router();

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
        res.render('dashboard', {title: 'Analytics'});
    }
}).get('/:vpcUrl/:ownerID/:accessToken', function (req, res, next) {
    res.render('dashboard', {title: 'Analytics'});
});

module.exports = router;
