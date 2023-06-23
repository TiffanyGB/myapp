var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/admin/liste', function(req, res, next) {
  res.send('/admin/liste');
});



module.exports = router;