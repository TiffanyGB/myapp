/**
 * @fileoverview Ce fichier contient le router pour la gestion des utilisateurs ie
 * - Création,
 * - Suppression
 * - Modification,
 * - Voir la liste des utilisateurs.
 * Ces routes ne sont accesibles que par l'administrateur.
 * 
 * @module UserRouter

 * @version 1.0.0
 * @author	Tiffany GAY-BELLILE
 */

/**
 * Router pour les utilisateurs.
 * Gère les routes liées aux utilisateurs, telles que /users, /users/:id, etc.
 * @namespace UserRouter
 * @see {@link module:UserController}
 * @see {@link module:UserModel}
 */

var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const indexController = require('../controllers/indexController');
const userModel = require('../models/userModel');
const adminProfile = require('../middleware/verifProfil');
const checkAdminProfile = adminProfile.checkProfile('admin');
const validationDonnees = require('../middleware/validationDonnees');


/**
 * @route GET /users
 * @description Endpoint pour voir la liste des utilisateurs
 * @access Seuls les administrateurs peuvent utiliser cette route.
 * @authentication Requiert un token JWT valide dans l'en-tête Authorization.
 */
router.get('/',
  indexController.verifyToken,
  checkAdminProfile,
  userController.voirUtilisateurs);

/**
 * @route ALL /users/create
 * @description Endpoint pour créer un nouvel utilisateur.
 * @access Seuls les administrateurs peuvent utiliser cette route.
 * @authentication Requiert un token JWT valide dans l'en-tête Authorization.
 */
router.all(
  '/create',
  userModel.validateUser,
  indexController.verifyToken,
  checkAdminProfile,
  validationDonnees.validatePasswordCreation,
  userController.createUser,

);

/**
 * @route ALL /users/edit/:id
 * @description Endpoint pour modifier un utilisateur.
 * @access Seuls les administrateurs peuvent utiliser cette route.
 * @authentication Requiert un token JWT valide dans l'en-tête Authorization.
 */
router.all('/edit/:id', (req, res, next) => {
  res.locals.userId = req.params.id;
  next();
}, indexController.verifyToken,
/**Tous les users */
  validationDonnees.validatePasswordModif,
  userController.modifierUser);


/**
 * @route GET /users/delete/:id
 * @description Endpoint pour supprimer un utilisateur.
 * @access Seuls les administrateurs peuvent utiliser cette route.
 * @authentication Requiert un token JWT valide dans l'en-tête Authorization.
 */
router.all('/delete/:id', (req, res, next) => {
  res.locals.userId = req.params.id;
  next();
}, indexController.verifyToken,
  checkAdminProfile,
  userController.supprimerUser);

module.exports = router;