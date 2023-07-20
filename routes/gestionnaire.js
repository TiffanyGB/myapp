var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const gestionnaireController = require('../controllers/gestionnaireController');
const adminProfile = require('../middleware/verifProfil');
const checkAdminProfile = adminProfile.checkProfile('admin');

/* Liste de tous les gestionnaires*/
router.all('/', indexController.verifyToken,
    checkAdminProfile,
    gestionnaireController.voirListeGestionnaires);


module.exports = router;