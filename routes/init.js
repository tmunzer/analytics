var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var errorcode;
  if (req.query.hasOwnProperty('errorcode')) errorcode = req.query["errorcode"];
  res.render('init', { title: 'Express' , errorcode: errorcode});
});

module.exports = router;
