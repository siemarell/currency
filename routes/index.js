var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'currency' });
});

router.get('/data', require('./data.js'));

module.exports = router;
