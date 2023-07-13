var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const eventsController = require('../controllers/eventsController');

/**Créer events */
router.all('/creerEvent', indexController.verifyToken, eventsController.createEvent);



/**Modifier */
router.all('/edit/:id', indexController.verifyToken, eventsController.modifierEvent);

/**supprimer */
router.all('/delete/:id', indexController.verifyToken, eventsController.supprimerEvent);

module.exports = router;