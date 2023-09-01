/**
 * Contrôleur pour la gestion des utilisateurs.
 * 
 * Ce fichier contient les controllers servant à la manipulation des
 * utilisateurs.
 * 
 * @module Gestion_des_utilisateurs
 * @version 1.0.0 
 * @author Tiffany GAY-BELLILE
 * 
 * @requires ../public/javascripts/json_liste/liste_utilisateurs
 * @requires ../models/userModel
 * @requires ../models/etudiantModel
 * @requires ../models/gestionnaireIaModel
 * @requires ../models/gestionnaireExterneModel
 * @requires express-validator
 * 
 */

const gestionnaires = require('../models/gestionnaireModel');
const userModel = require('../models/userModel');
const etudiantModel = require('../models/etudiantModel');
const gestionnaireIaModel = require('../models/gestionnaireIaModel');
const gestionnaireExterneModel = require('../models/gestionnaireExterneModel');
const { validationResult } = require('express-validator');
const aDeplacer = require('../models/aDeplacer')
/**
 * @async
 * @function
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Ce contrôleur permet d'appeler la fonction qui
 * récupère la liste de tous les utilisateurs.
 *  
 * Accès à ce controller: Administrateurs.
 * 
 * Route: users.js
 * @returns {Object} - Message d'erreur ou JSON avec la liste.
 */
async function voirUtilisateurs(req, res) {

  /*Récupérer la liste des utilisateurs formatée au format json*/
  try {
    const result = await aDeplacer.envoyer_json_liste_user();
    if (result === "erreur_user") {
      return res.status(400).json({ erreur: "Erreur lors de la récupération des données côté étudiant" })
    } else {
      return res.status(200).json(result);
    }
  } catch {
    return res.status(500).json({ error: `Une erreur s\'est produite lors de la récupération des utilisateurs: ${error.message}` });

  }
}

/**
 * @async
 * @function
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Ce contrôleur permet de créer un nouvel utilisateur.
 *  
 * Si l'adresse mail ou le pseudo sont déjà pris, une erreur est renvoyée.
 * Accès à ce controller: Administrateurs.
 * 
 * Route: users.js
 * @returns {Object} - Message de succès ou d'erreur.
 */
async function createUser(req, res) {
  if (req.method == "OPTIONS") {
    res.status(200).json({ sucess: 'Agress granted' });
  } else if (req.method === 'POST') {

    /* Récupération des données */
    let userData = req.body;

    userData.nom = userData.nom.trim();
    userData.prenom = userData.prenom.trim();
    userData.ville = userData.ville.trim();
    userData.entreprise = userData.entreprise.trim();
    userData.metier = userData.metier.trim();
    userData.role_asso = userData.role_asso.trim();

    const valeurs_communes = [
      userData.nom,
      userData.prenom,
      userData.pseudo,
      userData.email,
      userData.linkedin,
      userData.github,
      userData.ville,
    ]

    const valeurs_id = [
      userData.pseudo,
      userData.email
    ]

    switch (userData.type) {
      case 'etudiant':
        await etudiantModel.validerEtudiant(req);
        break;
      case 'gestionnaireExterne':
        await gestionnaireExterneModel.validerGestionnaireExterne(req);
        break;
      case 'gestionnaireIA':
        await gestionnaireIaModel.validerGestionnaireIA(req);
        break;
      case 'administrateur':
        break;
      default:
        return res.status(400).json({ erreur: "Le type est incorrect" });
    }

    //TODO: Voir si je peux le mettre dans une fonction
    //Appel du validateur de express validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errorDetected = true;
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      /*Insertion dans la table utilisateur, on récupère l'id de l'utilisateur */
      const idUser = await userModel.insererUser(valeurs_communes, userData.password, valeurs_id);

      if (typeof idUser === 'number') {
        /**On insère les infos supplémentaires dans la table appropriée au type*/
        switch (userData.type) {
          case 'etudiant':
            etudiantModel.creerEtudiant(userData.ecole, userData.niveau_etude, idUser);
            break;
          case 'gestionnaireExterne':
            gestionnaireExterneModel.creerGestionnaireExterne(idUser, userData.entreprise, userData.metier);
            break;
          case 'gestionnaireIA':
            gestionnaireIaModel.creerGestionnaireIA(idUser, userData.role_asso);
            break;
        }
        return res.status(200).json({ message: 'Inscription réussie' });
      }
      /**Pseudo et/ou email déjà pris */
      else if (idUser === 'les2') {
        return res.status(400).json({ error: 'Mail et pseudo déjà pris.' });

      } else if (idUser === 'pseudo') {
        return res.status(400).json({ error: 'Le pseudo est déjà pris.' });

      } else if (idUser === 'mail') {
        return res.status(400).json({ error: 'L\'adresse mail est déjà prise.' });
      }

    } catch (error) {
      /*On supprime l'utilisateur de la table "utilisateur" s'il a été inséré et 
      qu'il n'a pas pu être inséré dans la table de son role*/
      // const user = await userModel.chercherUserID(idUser);
      // if (user.length > 0) {
      //   userModel.supprimerUser(idUser);
      // }
      return res.status(400).json({ message: `Erreur lors de l\'insertion de l\'utilisateur: ${error.message}` });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @async
 * @function
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Ce contrôleur permet de mofidier utilisateur.
 *  
 * Si l'adresse mail ou le pseudo sont déjà pris par un autre utilisateur, une erreur est renvoyée.
 * Accès à ce controller: Administrateurs.
 * 
 * Route: users.js
 * @returns {Object} - Message de succès ou d'erreur.
*/
async function modifierUser(req, res) {

  if (req.method == "OPTIONS") {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'PATCH') {

    /*Si n'est pas admin, vérifier si l'id de l'url est la même que l'utilisteur qui veut modifier */
    const idUser = res.locals.userId;
    const profil = req.userProfile;

    /**Récupération des données */
    let userData = req.body;

    userData.nom = userData.nom.trim();
    userData.prenom = userData.prenom.trim();
    userData.ville = userData.ville.trim();
    userData.entreprise = userData.entreprise.trim();
    userData.metier = userData.metier.trim();
    userData.role_asso = userData.role_asso.trim();
    
    const valeurs = [
      userData.nom,
      userData.prenom,
      userData.pseudo,
      userData.email,
      userData.linkedin,
      userData.github,
      userData.ville,
    ];

    const valeurs_etudiant = [
      userData.ecole,
      userData.niveau_etude
    ]

    let type = await aDeplacer.chercherType(idUser);

    try {
      let resultMessage = '';
      let errors;

      switch (type) {
        case 'etudiant':
          await etudiantModel.validerEtudiant(req);

          errors = validationResult(req);
          if (!errors.isEmpty()) {
            errorDetected = true;
            return res.status(400).json({ errors: errors.array() });
          }

          resultMessage = await etudiantModel.modifierEtudiant(idUser, valeurs, valeurs_etudiant, userData.password);
          break;
        case 'gestionnaireExterne':
          await gestionnaireExterneModel.validerGestionnaireExterne(req);

          errors = validationResult(req);
          if (!errors.isEmpty()) {
            errorDetected = true;
            return res.status(400).json({ errors: errors.array() });
          }

          resultMessage = await gestionnaires.modifierExterne(idUser, valeurs, userData.metier, userData.entreprise, userData.password);
          break;
        case 'gestionnaireIA':
          await gestionnaireIaModel.validerGestionnaireIA(req);

          errors = validationResult(req);
          if (!errors.isEmpty()) {
            errorDetected = true;
            return res.status(400).json({ errors: errors.array() });
          }

          resultMessage = await gestionnaires.modifierIapau(idUser, valeurs, userData.role_asso, userData.password);
          break;
        case 'administrateur':
          resultMessage = await userModel.modifierUser(idUser, valeurs, userData.password);
          break;
        default:
          return res.status(400).json({ erreur: 'Le type est incorrect' });
      }

      if (resultMessage === 'les2') {
        return res.status(400).json({ erreur: 'Pseudo et email déjà pris' });
      } else if (resultMessage === 'pseudo') {
        return res.status(400).json({ erreur: 'Pseudo déjà pris' });
      } else if (resultMessage === 'mail') {
        return res.status(400).json({ erreur: 'Email déjà pris' });
      } else {
        return res.status(200).json({ message: `${type} modifié avec succès` });
      }
    } catch (error) {
      return res.status(400).json({ erreur: `Echec de la modification de ${profil}: ${error.message}` });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @async
 * @function
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Ce contrôleur permet de supprimer un utilisateur.
 *  
 * Son identidiant est récuépré dans la requête.
 * Route: users.js
 * @returns {Object} - Message de succès ou d'erreur.
*/
async function supprimerUser(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).json({ success: 'Access granted' });

  } else if (req.method === 'DELETE') {

    /**Récupérer l'id de l'utilisateur à supprimer dans l'url */
    const userId = res.locals.userId;

    /*L'administrateur ne peut pas se supprimer lui même */
    if (userId == req.id) {
      return res.status(400).json({ error: 'L\'administrateur ne peut pas se supprimer lui-même' });
    }

    try {
      /*Supprimer l'utilisateur*/
      userModel.supprimerUser(userId);
      return res.status(200).json({ message: "Suppression réussie" });
    } catch (error) {
      return res.status(500).json({ erreur: `Erreur lors de la suppression de l\'utilisateur: ${error.message}` });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

module.exports = {
  createUser,
  voirUtilisateurs,
  modifierUser,
  supprimerUser,
};
