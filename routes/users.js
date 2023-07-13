/**Route pour les utilisateurs */

var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const etudiantModel = require('../models/etudiantModel');
const indexController = require('../controllers/indexController');
const userModel = require('../models/userModel');
const gestionnaireExterneModel = require('../models/gestionnaireExterneModel');
const gestionnaireIAModel = require('../models/gestionnaireIaModel');


/** Voir les utilisateurs */
router.all('/', indexController.verifyToken,userController.voirUtilisateurs);

/**Page de création d'un nouvel utilisateur */
router.all(
  '/create',
  userModel.validateUser, 
  indexController.verifyToken,
  userController.createUser
);


/**Modifier un utilisateur */
router.all('/edit/:id', (req, res, next) => {
    res.locals.userId = req.params.id;
    next();
  }, indexController.verifyToken, userModel.validateUserModif, userController.modifierUser);

  
/**Supprimer un utilisateur */
router.all('/delete/:id', (req, res, next) => {
    res.locals.userId = req.params.id;
    next();
  }, indexController.verifyToken, userController.supprimerUser);
  
module.exports = router;