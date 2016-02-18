var express = require('express');
var router = express.Router();

var API = require(appRoot + "/bin/aerohive/api/main");
var Device = require(appRoot + "/bin/aerohive/models/device");
var Location = require(appRoot + "/bin/aerohive/models/location");

/*================================================================
 ROUTES
 ================================================================*/
/*================================================================
 DASHBOARD
 ================================================================*/
router.get('/location/', function (req, res, next) {
        res.render('compare', {
            title: 'Analytics',
            current_page: 'compare',
            compare_page: 'location'
    });
}).get('/period/', function (req, res, next) {
    res.render('compare', {
        title: 'Analytics',
        current_page: 'compare',
        compare_page: 'period'
    });
});

module.exports = router;
