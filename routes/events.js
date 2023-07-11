var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const eventsController = require('../controllers/eventsController');


router.all('/', indexController.verifyToken,eventsController.voirListeEvents);

/**Créer events */
router.all('/creerEvent', indexController.verifyToken, eventsController.createEvent);

/**Modifier */

/**supprimer */

module.exports = router;