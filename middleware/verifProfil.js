/**
 * Ce fichier contient les middlewares servant à la vérification du profil des utilisateurs.
 * Ces middlewares sont à placés dans les routes après le middleware de vérification
 * et de décodage du token (tokenModel/verifyToken). Les fonctions de ce fichier ont besoin de cette 
 * étape pour récupérer certains champs du token, req.userProfile et req.id. 
 * @fileoverview Middlewares de vérification de profil des utilisateurs.
 * @module VerifierProfil
 */

const gererProjet = require('../models/gererProjet');
const equipeModel = require('../models/equipeModel');

/**
 * Vérifie le type de profil de l'utilisateur avant de poursuivre.
 * 
 * Il permet de limiter l'accès de la route à un seul type de profil (admin ou étudiant).
 * Les administrateurs et les étudiants ont des pages spécifiques (les gestionnaire non).
 * On utilise cette fonction pour ces pages.
 * 
 * Utilisation: events.js, users.js, messages.js, projets.js, teams.js.
 * @function
 * @param {string} type - Le type de profil attendu ('admin', 'etudiant').
 * @returns {Promise<void>} Rien. La fonction appelle soit la fonction `next()` pour 
 * passer au middleware suivant, soit renvoie une réponse JSON avec un message d'erreur 
 * et un code d'état HTTP approprié.
 * @example
 * // Utilisation de la fonction middleware pour vérifier si l'utilisateur est un étudiant
 * app.get('/profil-etudiant', checkProfile('etudiant'), (req, res) => {
 *   res.json({ message: 'Bienvenue étudiant!' });
 * });
 */
function checkProfile(type) {
  return function (req, res, next) {
    if (req.userProfile === type) {
      next();
    } else {
      res.status(400).json({ erreur: `Mauvais profil, il faut être ${type}.` });
    }
  };
}


/**
 * Middleware qui interdit l'accès à un utilisateur non connecté.
 * 
 * Tous les autres comptes sont autorisés (administrateur, étudiant et 
 * gestionnaires(iapau et externes)).
 * 
 * Utilisation: users.js, teams.js
 * 
 * @function
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @param {Function} next - Fonction de rappel pour passer au middleware suivant.
 * @example
 * // Utilisation du middleware pour vérifier si l'utilisateur est connecté
 * app.get('/profil-connecte', interdireAucunProfil, (req, res) => {
 *   res.json({ message: 'Bienvenue utilisateur connecté!' });
 * });
 */
function interdireAucunProfil(req, res, next) {
  if (req.userProfile === 'aucun') {
    return res.status(400).json({ erreur: `Il faut avoir un compte pour accéder à cette page.` });
  } else {
    next();
  }
}


/**
 * Middleware pour vérifier les autorisations de l'utilisateur concernant une équipe.
 * Les profils autorisés sont: le capitaine de l'équipe, les administrateurs et les 
 * gestionnaires en charge du projet de l'équipe.
 * 
 * 
 * Administrateurs: Tous sont autorisés.
 * Gestionnaires (externes et iapau): Vérification de la gestion de l'équipe faite ici.
 * Etudiants: Vérification du statut de capitaine faite ici.
 * Aucun profil: Les pages appelant ce middleware requierent un compte.
 * 
 * Doit être placée après le middleware qui vérifie l'existence de l'équipe dans la base 
 * de données (middleware/verifExistanceIdRoute/verifIdEquipe). Si cette vérification n'est pas faite 
 * et que l'équipe n'existe pas, la fonction crachera si le profil est gestionnaire ou étudiant.
 * 
 * Utilisation: teams.js.
 * @async
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @param {Function} next - Fonction de rappel pour passer au middleware suivant.
 * @throws {Error} Une erreur si un problème survient dans le try.
 * @returns {Promise<void>} Rien. La fonction appelle soit la fonction `next()` pour passer 
 * au middleware suivant, soit renvoie une réponse JSON avec un message d'erreur et un code 
 * d'état HTTP approprié.
 */
async function checkACG(req, res, next) {
  try {
    /*id de l'équipe récupéré dans la route*/
    const id = res.locals.idEquipe;

    /*Chercher l'équipe dans la bdd*/
    const equipe = await equipeModel.chercherEquipeID(id);

    switch (req.userProfile) {
      case 'admin':
        next();
        break;
      case 'gestionnaire':
        /*Vérifier la gestion du projet */
        const gerer_ia = await gererProjet.chercherGestionnaireIA(id, req.id);
        const gerer_ext = await gererProjet.chercherGestionnaireExtID(id, req.id);

        if (gerer_ia.length > 0 || gerer_ext.length > 0) {
          next();
        } else {
          return res.status(400).json({ erreur: `Mauvais profil, il faut gérer l'événement.` });
        }
        break;
      case 'etudiant':
        if (equipe[0].idcapitaine === req.id) {
          next();
        } else {
          return res.status(400).json({ erreur: `Mauvais profil, il faut être capitaine.` });
        }
        break;
      default:
        return res.status(400).json({ erreur: `Mauvais profil, il faut être admin, capitaine ou gestionnaire du projet.` });
    }
  } catch (error) {
    return res.status(500).json({ erreur: 'Erreur interne du serveur.' });
  }
}


/**
 * Middleware pour vérifier les autorisations de l'utilisateur concernant une équipe.
 * Les profils autorisés sont: les membres de l'équipe, les administrateurs et les 
 * gestionnaires en charge du projet de l'équipe.
 * 
 * Administrateurs: Tous sont autorisés.
 * Gestionnaires (externes et iapau): Vérification de la gestion de l'équipe faite ici.
 * Etudiants: Vérification du statut de capitaine faite ici.
 * Aucun profil: Les pages appelant ce middleware requierent un compte.
 * 
 * Doit être placée après le middleware qui vérifie l'existence de l'équipe dans la base 
 * de données (middleware/verifExistanceIdRoute/verifIdEquipe). Si cette vérification n'est pas faite 
 * et que l'équipe n'existe pas, la fonction crachera si le profil est gestionnaire ou étudiant.
 * 
 * Utilisation: message.js.
 * @async
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @param {Function} next - Fonction de rappel pour passer au middleware suivant.
 * @throws {Error} Une erreur si un problème survient dans le try.
 * @returns {Promise<void>} Rien. La fonction appelle soit la fonction `next()` pour passer 
 * au middleware suivant, soit renvoie une réponse JSON avec un message d'erreur et un code 
 * d'état HTTP approprié.
 */
async function checkAGEtudiantEquipe(req, res, next) {
  /*id de l'équipe récupéré dans la route*/
  const id = res.locals.idEquipe;

  try {
    /*Chercher l'équipe dans la bdd*/
    const equipe = await equipeModel.chercherEquipeID(id);

    switch (req.userProfile) {
      case 'admin':
        next();
        break;
      case 'gestionnaire':
        /*Vérifier la gestion du projet */
        const gerer_ia = await gererProjet.chercherGestionnaireIA(equipe.idprojet, req.id);
        const gerer_ext = await gererProjet.chercherGestionnaireExtID(equipe.idprojet, req.id);

        if (gerer_ia.length > 0 || gerer_ext.length > 0) {
          next();
        } else {
          return res.status(400).json({ erreur: `Mauvais profil, il faut gérer le projet.` });
        }
        break;
      case 'etudiant':
        /*Vérifier si l'étudiant est dans l'équipe ou non */
        const appartient = await equipeModel.appartenirEquipe(req.id, id);
        if (appartient.length > 0) {
          next();
        } else {
          return res.status(400).json({ erreur: `Il faut faire partie de l'équipe ` + id + ` pour envoyer des messages.` });
        }
        break;
      default:
        return res.status(400).json({ erreur: `Mauvais profil, il faut être admin, gestionnaire du projet ou faire partie de l'équipe.` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erreur: 'Erreur interne du serveur.' });
  }
}



/**
 * Middleware pour vérifier les autorisations de l'utilisateur.
 * Les profils autorisés sont: les administrateurs et les gestionnaires en charge du projet.
 * 
 * Administrateurs: Tous sont autorisés.
 * Gestionnaires (externes et iapau): Vérification de la gestion du projet faite ici.
 * Etudiants et non connectés: Accès rejeté.
 * 
 * Doit être placée après le middleware qui vérifie l'existence du projet dans la base 
 * de données (middleware/verifExistanceIdRoute/verifIdProjet). Si cette vérification n'est pas faite 
 * et que le projet n'existe pas, la fonction crachera si le profil est gestionnaire.
 * 
 * Utilisation: projet.js.
 * @async
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @param {Function} next - Fonction de rappel pour passer au middleware suivant.
 * @throws {Error} Une erreur si un problème survient dans le try.
 * @returns {Promise<void>} Rien. La fonction appelle soit la fonction `next()` pour passer 
 * au middleware suivant, soit renvoie une réponse JSON avec un message d'erreur et un code 
 * d'état HTTP approprié.
 */
async function checkAG(req, res, next) {
  let id = res.locals.idProjet;

  if(id === undefined){
    id = res.locals.idEquipe;
  }

  try {
    if (req.userProfile === 'admin') {
      next();
    } else if (req.userProfile === 'gestionnaire') {
      const gerer_ia = await gererProjet.chercherGestionnaireIA(id, req.id);
      const gerer_ext = await gererProjet.chercherGestionnaireExtID(id, req.id);

      if (gerer_ia.length > 0 || gerer_ext.length > 0) {
        next();
      } else {
        return res.status(400).json({ erreur: `Mauvais profil, il faut gérer le projet.` });
      }
    } else {
      return res.status(400).json({ erreur: `Mauvais profil, il faut être admin ou gestionnaire du projet.` });
    }
  } catch (error) {
    return res.status(500).json({ erreur: 'Erreur interne du serveur.' });
  }
}


/**
 * Middleware pour vérifier les autorisations de l'utilisateur.
 * Les profils autorisés sont: les administrateurs et les gestionnaires.
 * 
 * Administrateurs: Tous sont autorisés.
 * Gestionnaires (externes et iapau): Tous sont autorisés.
 * Etudiants et non connectés: Accès rejeté.
 * 
 * 
 * Utilisation: projet.js.
 * @async
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @param {Function} next - Fonction de rappel pour passer au middleware suivant.
 * @throws {Error} Une erreur si la recherche de l'équipe échoue.
 * @returns {Promise<void>} Rien. La fonction appelle soit la fonction `next()` pour passer 
 * au middleware suivant, soit renvoie une réponse JSON avec un message d'erreur et un code 
 * d'état HTTP approprié.
 */
async function checkATousGestionnaires(req, res, next) {

  if (req.userProfile === 'admin' || req.userProfile === 'gestionnaire') {
    next();
  } else {
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin ou gestionnaire` });
  }
}


module.exports = { checkProfile, checkACG, interdireAucunProfil, checkAGEtudiantEquipe, checkAG, checkATousGestionnaires };