var express = require('express');
var router = express.Router();
var OAuth = require(appRoot + "/bin/aerohive/api/oauth");
var ApiConf = require(appRoot + "/bin/aerohive/config");
var Error = require(appRoot + '/routes/error');

router.get('/reg', function (req, res) {
    if (req.query.hasOwnProperty('error')) {
        Error.render(req.query.error, "conf", req, res);
    } else if (req.query.hasOwnProperty("authCode")) {
        var authCode = req.query.authCode;
        OAuth.getPermanentToken(authCode, ApiConf.redirectUrl, ApiConf.secret, ApiConf.clientId, function(data){
            if (data.hasOwnProperty("error")) Error.render(data.error, "conf", req, res);
            else if (data.hasOwnProperty("data")) {
                for (var owner in data.data) {
                    req.session.ownerID = data.data[owner].ownerId;
                    req.session.vpcUrl = data.data[owner].vpcUrl.replace("https://", "");
                    req.session.accessToken = data.data[owner].accessToken;
                }
                console.log(req.session);
                res.redirect('/web-app/');
            }
        });
    } else Error.render("Unknown error", "conf", req, res);
});

module.exports = router;