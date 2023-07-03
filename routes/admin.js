var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
const indexController = require('../controllers/indexController');



/**Page de création d'un nouvel utilisateur */
router.all('/creerUser', adminController.createUser);

router.all('/voirUtilisateurs', indexController.verifyToken,adminController.voirUtilisateurs);

router.all('/creerEvent', adminController.createEvent);


module.exports = router;