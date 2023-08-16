/**
 * @fileoverview Fonctions liées aux token.
 * @module Token
 */

const pool = require('../database/configDB');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


/** 
 * @constant
 * @type {string}
 * @description Clé secrète des token, est regénée à chaque redémarrage du serveur.
*/
const secretKey = crypto.randomBytes(64).toString('hex');


/**
 * Stocke un JWT (JSON Web Token) dans la base de données avec la clé secrète correspondante.
 * 
 * On conserve les token dans la bdd car une clé secrete est générée à chaque redémarrage du serveur.
 * Ceci rend l'utilisation des anciens token inutilisables.
 * 
 * On stocke donc les token avec leur clé afin qu'ils soient exploitables.
 * 
 * @function
 * @param {string} jwt - Le JSON Web Token à stocker.
 * @param {string} cle - La clé secrète associée au JWT.
 * @throws {Error} Une erreur si le stockage du JWT échoue.
 */
function stockerJWT(jwt, cle) {

  const stocker = `INSERT INTO jwt
    (token, cleScrete) VALUES ($1, $2)`;

  try {
    pool.query(stocker, [jwt, cle]);
  } catch (error) {
    throw (error);
  }
}

/**
 * Supprime un JWT (JSON Web Token) dans la base de données avec la clé secrète correspondante.
 *  
 * @function
 * @param {string} jwt - Le JSON Web Token à stocker.
 * @throws {Error} Une erreur si le stockage du JWT échoue.
 */
function supprimerJWT(jwt) {

  const stocker = `DELETE FROM jwt 
  WHERE token = $1`;

  try {
    pool.query(stocker, [jwt]);
  } catch (error) {
    throw (error);
  }
}

/**
 * Cherche un JWT (JSON Web Token) dans la base de données.
 * 
 * @function
 * @async
 * @param {string} jwt - Le JSON Web Token à rechercher.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau d'objets correspondant aux enregistrements trouvés.
 * @throws {Error} Une erreur si la recherche du JWT échoue.
 */
async function chercherToken(jwt) {

  const chercher = `SELECT * FROM jwt 
    WHERE token = $1`;

  try {
    return new Promise((resolve) => {
      pool.query(chercher, [jwt])
        .then((res) => {
          resolve(res.rows);
        })
    })
  } catch (error) {
    throw (error)
  }
}

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
async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.userProfile = 'aucun';
    return next();
  }

  try {
    const tokenBdd = await chercherToken(token);

    if (tokenBdd.length > 0) {

      jwt.verify(tokenBdd[0].token, tokenBdd[0].clescrete, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Token invalide ou expiré.' });
        }

        switch (decoded.utilisateurType) {
          case 'administrateur':
            req.userProfile = 'admin';
            break;
          case 'etudiant':
            req.userProfile = 'etudiant';
            break;
          case 'gestionnaireExterne':
          case 'gestionnaireIA':

            req.userProfile = 'gestionnaire';
            break;
          default:
            req.userProfile = 'aucun';
        }

        req.decodedToken = decoded;
        req.id = decoded.utilisateurId;

        next();
      });
    } else {
      return res.status(403).json({ message: 'Token invalide ou expiré.' });
    }
  } catch {
    return res.status(403).json({ message: 'Problème au niveau du token.' });
  }
}

module.exports = { stockerJWT, chercherToken, verifyToken, supprimerJWT, secretKey }