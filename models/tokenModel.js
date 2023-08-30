/**
 * @fileoverview Fonctions liées aux token.
 * @module Token
 */

const pool = require('../database/configDB');
const jwt = require('jsonwebtoken');
const env = require('../environnement.json');

/** 
 * @constant
 * @type {string}
 * @description Clé secrète des token, est regénée à chaque redémarrage du serveur.
*/
const secretKey = env.backend.secretKey;


/**
 * Middleware qui vérifie la validité d'un JSON Web Token (JWT) et extrait les informations de 
 * profil de l'utilisateur.
 * 
 * @function
 * @async
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - Fonction de rappel pour passer au middleware suivant.
 * @returns {Promise<void>} Rien. La fonction appelle soit la fonction `next()` pour passer au middleware suivant,
 * soit renvoie une réponse JSON avec un message d'erreur et un code d'état HTTP approprié.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.userProfile = 'aucun';
    return next();
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide ou expiré.' });
    }

    if (decoded.utilisateurType === 'administrateur') {

      req.userProfile = 'admin';

    } else if (decoded.utilisateurType === 'etudiant') {

      req.userProfile = 'etudiant';

    } else if ((decoded.utilisateurType === 'gestionnaireIA') || (decoded.utilisateurType === 'gestionnaireExterne')) {
      console.log(decoded.utilisateurType);
      req.userProfile = 'gestionnaire';
    }
    req.decodedToken = decoded;
    req.id = decoded.utilisateurId;

    next();
  });
}

module.exports = {verifyToken, secretKey }
