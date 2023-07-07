/**Route pour les utilisateurs */

var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const indexController = require('../controllers/indexController');


/** Voir les utilisateurs */
router.all('/', indexController.verifyToken,userController.voirUtilisateurs);

/**Page de création d'un nouvel utilisateur */
router.all('/create', indexController.verifyToken, userController.createUser);

/**Modifier un utilisateur */
router.all('/edit/:id', (req, res, next) => {
    res.locals.userId = req.params.id;
    next();
  }, indexController.verifyToken, userController.modifierUser);

  
/**Supprimer un utilisateur */
router.all('/delete/:id', (req, res, next) => {
    res.locals.userId = req.params.id;
    next();
  }, indexController.verifyToken, userController.supprimerUser);
  
module.exports = router;