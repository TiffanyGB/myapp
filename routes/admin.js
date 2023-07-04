var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
const indexController = require('../controllers/indexController');


/** Voir les utilisateurs */
router.all('/', indexController.verifyToken,adminController.voirUtilisateurs);

/**Page de création d'un nouvel utilisateur */
router.all('/create', indexController.verifyToken, adminController.createUser);

router.all('/edit/:id', indexController.verifyToken, adminController.modifierUser);

router.all('/delete/:id', indexController.verifyToken);


// router.all('/creerEvent', adminController.createEvent);


module.exports = router;