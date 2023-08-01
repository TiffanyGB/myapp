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
const userModel = require('../models/userModel');
const tokenModel = require('../models/tokenModel');
const profil = require('../middleware/verifProfil');
const checkAdminProfile = profil.checkProfile('admin');
const validationDonnees = require('../middleware/validationDonnees');
const aucunProfil = profil.interdireAucunProfil;
const { verifIdNombre } = require('../verifications/verifierDonnéesGénérales');

/**
 * @route GET /users
 * @description Endpoint pour voir la liste des utilisateurs
 * @access Seuls les administrateurs peuvent utiliser cette route.
 * @authentication Requiert un token JWT valide dans l'en-tête Authorization.
 */
router.get('/',
  tokenModel.verifyToken,
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
  tokenModel.verifyToken,
  checkAdminProfile,
  userModel.validateUser,
  validationDonnees.validatePasswordCreation,
  userController.createUser,

);

/**
 * @route ALL /users/edit/:id
 * @description Endpoint pour modifier un utilisateur.
 * @access Seuls ceux avec un compte.
 * @authentication Requiert un token JWT valide dans l'en-tête Authorization.
 */
router.all('/edit/:id', (req, res, next) => {
  res.locals.userId = req.params.id;

  try {
    if (verifIdNombre(res.locals.userId, res) === -1) {
      return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
    }
  } catch {
    return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
  }
  next();
}, tokenModel.verifyToken,
  aucunProfil,
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

  try {
    if (verifIdNombre(res.locals.userId, res) === -1) {
      return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
    }
  } catch {
    return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
  }

  next();
}, tokenModel.verifyToken,
  checkAdminProfile,
  userController.supprimerUser);

module.exports = router;