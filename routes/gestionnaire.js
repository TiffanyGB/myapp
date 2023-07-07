var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const gestionnaireController = require('../controllers/gestionnaireController');

/* Liste de tous les gestionnaires*/
router.all('/', indexController.verifyToken, gestionnaireController.voirListeGestionnaires);


module.exports = router;