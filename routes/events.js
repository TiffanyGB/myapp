var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
const indexController = require('../controllers/indexController');
const eventsController = require('../controllers/eventsController');


// router.all('/creerEvent', adminController.createEvent);

router.all('/', indexController.verifyToken,eventsController.voirListeEvents);


module.exports = router;