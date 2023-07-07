var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const eventsController = require('../controllers/eventsController');


// router.all('/creerEvent', adminController.createEvent);

router.all('/', indexController.verifyToken,eventsController.voirListeEvents);

/**Créer events */

/**Modifier */

/**supprimer */

module.exports = router;