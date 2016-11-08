var express = require('express');
var router = express.Router();
var OAuth = require("../bin/aerohive/api/oauth");
var ApiConf = require("./../config").devAccount;
var Error = require('../routes/error');

router.get('/reg', function (req, res) {
    if (req.query.hasOwnProperty('error')) {
        Error.render(req.query.error, "conf", req, res);
    } else if (req.query.hasOwnProperty("authCode")) {
        var authCode = req.query.authCode;
        OAuth.getPermanentToken(authCode, ApiConf.redirectUrl, ApiConf.clientSecret, ApiConf.clientID, function (data) {
            if (data.hasOwnProperty("error")) Error.render(data.error, "conf", req, res);
            else if (data.hasOwnProperty("data")) {
                req.session.xapi = {
                    owners: [],
                    ownerIndex: 0,
                    rejectUnauthorized: true,
                    current: function(){
                        return this.owners[this.ownerIndex];
                    }
                };
                for (var owner in data.data) {
                    req.session.xapi.owners.push({
                        vhmId: data.data[owner].vhmId,
                        ownerId: data.data[owner].ownerId,
                        vpcUrl: data.data[owner].vpcUrl.replace("https://", ""),
                        accessToken: data.data[owner].accessToken
                    })
                }
                res.redirect('/dashboard/');
            }
        });
    } else Error.render("Unknown error", "conf", req, res);
});

module.exports = router;