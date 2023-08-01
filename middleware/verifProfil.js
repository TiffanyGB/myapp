const gererProjet = require('../models/gererProjet');
const equipeModel = require('../models/equipeModel');

//Toutes les fonctions ici doivent être placée après le verif token car en 
// ont besoin: req.id et req.userProfile.



/**
 * Vérifie le type de profil de l'utilisateur avant de poursuivre.
 * 
 * Il permet de limiter l'accès de la route à un seul type de profil (admin ou étudiant).
 * Les administrateurs et les étudiants ont des pages spécifiques (les gestionnaire non).
 * On utilise cette fonction pour ces pages.
 * 
 * Utilisée dans: events.js, users.js, messages.js, projets.js, teams.js.
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
    /* admin, gestionnaire, etudiant */
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
 * Tous les autres comptes sont autorisés (administrateur, étudiant et gestionnaires(iapau et externes)).
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
async function interdireAucunProfil(req, res, next) {
  if (req.userProfile === 'aucun') {
    return res.status(400).json({ erreur: `Il faut avoir un compte.` });
  } else {
    next();
  }
}


/**
 * Middleware pour vérifier les autorisations de l'utilisateur concernant une équipe.
 * Les profils autorisés sont: le capitaine de l'équipe, les administrateurs et les 
 * gestionnaires en charge du projetn de l'équipe.
 * 
 * 
 * Administrateurs: Tous sont autorisés.
 * Gestionnaires (externes et iapau): Vérification de la gestion de l'équipe faite ici.
 * Etudiants: Vérification du statut de capitaine faite ici.
 * Aucun profil: Les pages appelant ce middleware requiert un compte.
 * 
 * Doit être placée après le middleware qui vérifie l'existence de l'équipe dans la base 
 * de données (middleware/verifExistanceIdRoute). Si cette vérification n'est pas faite 
 * et que l'équipe n'existe pas, la fonction crachera si le profil est gestionnaire ou étudiant.
 * 
 * Middleware utilisé dans la route: teams.js.
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
async function checkACG(req, res, next) {
  const id = res.locals.idEquipe;

  const equipe = await equipeModel.chercherEquipeID(id);

  if (req.userProfile === 'admin') {
    next();
  } else if (req.userProfile === 'gestionnaire') {
    const gerer_ia = await gererProjet.chercherGestionnaireIA(id, req.id);
    const gerer_ext = await gererProjet.chercherGestionnaireExtID(id, req.id);

    if (gerer_ia.length > 0 || gerer_ext.length > 0) {
      next();
    } else {
      return res.status(400).json({ erreur: `Mauvais profil, il faut gérer l'événement.` });
    }
  } else if (req.userProfile === 'etudiant') {
    if (equipe[0].idcapitaine === req.id) {
      next();
    } else {
      return res.status(400).json({ erreur: `Mauvais profil, il faut être capitaine.` });
    }
  } else {
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin, capitaine ou gestionnaire du projet.` });
  }
}



/*ASG --> Admin, etudiant(doit être dans l'équipe), gestionnaire  en charge de l'équipe*/
async function checkAEG(req, res, next) {
  const id = res.locals.idEquipe;

  /*Vérifier que l'id de l'équipe existe */
  const equipe = await equipeModel.chercherEquipeID(id);

  if (equipe.length === 0) {
    return res.status(404).json({ erreur: 'L\'id de l\'équipe n\'existe pas' });
  }

  if (req.userProfile === 'admin') {
    next();
  } else if (req.userProfile === 'gestionnaire') {
    const gerer_ia = await gererProjet.chercherGestionnaireIA(equipe.idprojet, req.id);
    const gerer_ext = await gererProjet.chercherGestionnaireExtID(equipe.idprojet, req.id);

    if (gerer_ia.length > 0 || gerer_ext.length > 0) {
      next();
    } else {
      return res.status(400).json({ erreur: `Mauvais profil, il faut gérer le projet.` });
    }
  } else if (req.userProfile === 'etudiant') {
    const appartient = await equipeModel.appartenirEquipe(req.id, id);
    if (appartient.length > 0) {
      next();
    } else {
      return res.status(400).json({ erreur: `Il faut faire partie de l'équipe ` + id + ` pour envoyer des messages.` });
    }
  } else {
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin, gestionnaire du projet ou faire partie de l'équipe.` });
  }
}

async function checkAEG2222(req, res, next) {
  const id = res.locals.projetId;

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
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin, gestionnaire du projet ou faire partie de l'équipe.` });
  }
}

/*Que l'admin et le gestionnaire du projet */
async function checkAG(req, res, next) {
  const id = res.locals.idProjet;

  /*Vérifier que l'id de l'équipe existe */
  const equipe = await equipeModel.chercherEquipeID(id);

  if (equipe.length === 0) {
    return res.status(404).json({ erreur: 'L\'id de l\'équipe n\'existe pas' });
  }

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
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin, gestionnaire du projet ou faire partie de l'équipe.` });
  }
}

async function checkATousGestionnaires(req, res, next) {

  if (req.userProfile === 'admin' || req.userProfile === 'gestionnaire') {
    next();
  } else {
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin ou gestionnaire` });
  }
}




module.exports = { checkProfile, checkACG, interdireAucunProfil, checkAEG, checkAG, checkATousGestionnaires, checkAEG2222 };