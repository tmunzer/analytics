var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var errorcode;
  if (req.query.hasOwnProperty('errorcode')) errorcode = req.query["errorcode"];
  res.render('init', { title: 'Analytics' , errorcode: errorcode});
});
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
    res.redirect('/dashboard/');
  }
});
module.exports = router;
