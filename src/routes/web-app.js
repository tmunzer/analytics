var express = require('express');
var router = express.Router();

router.get("/", function (req, res) {
    if (req.session.xapi) {
        var currentApi = req.session.xapi.owners[req.session.xapi.ownerIndex];
        res.render('web-app', {
            title: 'Analytics',
            server: currentApi.vpcUrl,
            ownerId: currentApi.ownerId,
            accessToken: currentApi.accessToken
        });
    } else res.redirect("/");
})


module.exports = router;