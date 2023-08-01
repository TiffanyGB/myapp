var express = require('express');
var router = express.Router();
const gestionnaireController = require('../controllers/gestionnaireController');
const adminProfile = require('../middleware/verifProfil');
const checkAdminProfile = adminProfile.checkProfile('admin');
const tokenModel = require('../models/tokenModel');

/* Liste de tous les gestionnaires*/
router.all('/', tokenModel.verifyToken,
    checkAdminProfile,
    gestionnaireController.voirListeGestionnaires);


module.exports = router;