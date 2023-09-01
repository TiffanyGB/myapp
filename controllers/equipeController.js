/** 
 * @fileoverview Controller de l'inscription
 * @module Equipe
 * 
 * @version 1.0.0 
 * @author Tiffany GAY-BELLILE
 * @requires ../../models/equipeModel
 * @requires ../../models/projetModel
 * @requires ../../models/projetModel
 * @requires ../../models/eventModel-
 * @requires jsonwebtoken
 */

const equipeModel = require('../models/equipeModel');
const projetModel = require('../models/projetModel');
const demandeModel = require('../models/demandeModel')
const { body, validationResult } = require('express-validator');
const { creerDossier, creerUtilisateur, copieDuTemplate, recupererIDTemplate } = require('./gitlabController');
const eventModel = require('../models/eventModel');
const { validateUserId } = require('../verifications/verifierDonnéesGénérales');

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur permet de récupérer la liste des équipes participant à un projet.
 * 
 * L'id du projet est directement récupéré depuis l'url de la route.
 * 
 * Accès à ce controller: Gestionnaires du projet et les administrateurs.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - Retourne un objet JSON contenant l'ensemble des équipes du projet.
 * Si la requête échoue, code d'erreur 400 et message d'erreur.
*/
async function retournerEquipeProjet(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {
    const idProjet = res.locals.idProjet;

    try {
      const equipeListe = await equipeModel.jsonListeEquipeProjet(idProjet);
      return res.status(200).json(equipeListe);
    } catch (error) {
      return res.status(400).json({ erreur: "Erreur lors de la récupération des équipes" });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur permet à un étudiant de créer une équipe pour participer à un 
 * événement s'il en n'a pas encore. L'id de cet événement est récupéré grâce
 * à l'id du projet présent dans l'url.
 * 
 * Une vérification est faite pour s'assurer qu'il est sans équipe dans celui-ci. 
 * Si c'est le cas, l'équipe est créée et il est capitaine de celle-ci. Toutes ses demandes
 * faites à d'autres équipes sont supprimées.
 * 
 * Partie Gitlab: 3 choses sont créées. - Un répertoire gitlab afin que l'équipe puisse push son code dessus. 
 * -Un dossier annexe fin d'y récupérer les résultats d'analyse de code.
 * -Un compte Gitlab associé au premier repo. Les identifiants (email et mot de passe) sont insérées dans 
 * la base de données afin de les fournir à l'équipe pour qu'elle puisse accéder à son espace.
 * 
 * Accès à ce controller: Etudiant.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - Retourne l'id de la nouvelle équipe.
 * Si la requête échoue, code d'erreur 400 et message d'erreur.
*/
async function creerEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idCapitaine = req.id;

    /*Récupération données du body */
    const userData = req.body;

    /*ENlever les espaces au début et à la fin */
    let nom = userData.nom.trim();
    let description = userData.description.trim();

    const infos = [
      idCapitaine,
      nom,
      description,
      userData.statut,
      userData.idProjet
    ]

    try {
      /* L'étudiant ne doit pas avoir d'équipe dans l'event*/

      /*Récupérer l'event de l'équipe*/
      const projet = await projetModel.chercheridProjet(userData.idProjet);
      if (projet.length === 0) {
        return res.status(400).json({ erreur: 'L\'id du projet n\'existe pas.' })
      }

      const idEvent = projet[0].idevent;

      const aUneEquipe = await equipeModel.aUneEquipeDansEvent(idCapitaine, idEvent);

      if (aUneEquipe != -1) {
        return res.status(400).json({ erreur: 'Vous avez déjà une équipe dans cet évènement' });
      }

      let idEquipe = await equipeModel.creerEquipe(infos);
      equipeModel.ajouterMembre(idCapitaine, idEquipe);

      /* Supprimer les demandes de l'étudiant des autres equipes */
      demandeModel.supprimerDemandes(idCapitaine);

      const event_nom = (await eventModel.chercherEvenement(idEvent))[0].nom;

      /*Gitlab*/

      /*Création du dossier de l'équipe dans le répertoire annexe*/
      creerDossier(idEquipe, event_nom);

      /*Création de l'utilisateur lié au repo de l'équipe */
      const valeurs = await creerUtilisateur(userData.nom);

      equipeModel.insererAccesEquipeGit(valeurs[1], valeurs[0], idEquipe);
      /*Création du repo de l'équipe */
      const idTemplate = await recupererIDTemplate(projet[0].template);
      await copieDuTemplate(idTemplate,idEquipe, valeurs[3]);

      return res.status(200).json(idEquipe);
    } catch (error) {
      return res.status(400).json({ erreur: 'Erreur création équipe.' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur appelle la fonction de modification d'équipe.

 * Accès à ce controller: Capitaine de l'équipe (étudiant), gestionnaires du projet de l'équipe et 
 * tous les administrateurs.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - Retourne un message de succès ou d'échec de la requête.
*/
async function modifierEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'PATCH') {

    const idEquipe = res.locals.idEquipe;

    const userData = req.body;

    /*Supression des espaces au début et à la fin */
    let nom = userData.nom.trim();
    let description = userData.description.trim();

    const valeurs = [
      nom,
      description,
      userData.statut,
      userData.idProjet,
      userData.lien_discussion,
      userData.preferenceQuestionnaire,
      userData.github,
      idEquipe
    ]

    /*Récupérer l'event de l'équipe*/
    const projet = await projetModel.chercheridProjet(userData.idProjet);
    if (projet.length === 0) {
      return res.status(400).json({ erreur: 'L\'id du projet n\'existe pas.' })
    }

    try {
      equipeModel.modifierEquipe(valeurs);
      return res.status(200).json({ message: "Equipe modifiée" });
    } catch (error) {
      return res.status(400).json({ error: "Modification de l'équipe" });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur appelle la fonction de suppression d'équipe.
 * L'id de l'équipe est récupéré dans l'url de la requête.
 * Accès à ce controller: Capitaine de l'équipe (étudiant), gestionnaires du projet de l'équipe et 
 * tous les administrateurs.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - Retourne un message de succès ou d'échec de la requête.
*/
async function supprimerEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'DELETE') {

    try {
      const idEquipe = res.locals.idEquipe;

      /*Suppression */
      equipeModel.supprimerEquipe(idEquipe);
      return res.status(200).json({ message: "Equipe supprimée" });

    } catch {
      return res.status(400).json({ error: "Suppression de l'équipe" });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur appelle la fonction de promotion d'un membre de l'équipe au statut de capitaine.
 * L'id de l'équipe est récupéré dans l'url de la requête.
 * L'ancien capitaine est destitué. Celui-ci ne peut pas se promouvoir lui-même.
 * 
 * Une vérification est faite pour s'assurer que l'utilisateur à promouvoir fait partie de l'équipe.
 * Accès à ce controller: Capitaine de l'équipe (étudiant), gestionnaires du projet de l'équipe et 
 * tous les administrateurs.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - Retourne un message de succès ou d'échec de la requête.
*/
async function promouvoir(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    try {
      const idEquipe = res.locals.idEquipe;

      const {
        idUser
      } = req.body;

      /*L'id doit être un nombre naturel */
      await validateUserId(idUser, req, res);

      /*Vérifier si l'étudiant est dans l'équipe */
      const appartenir = await equipeModel.appartenirEquipe(idUser, idEquipe);
      if (appartenir.length == 0) {
        return res.status(400).json({ erreur: 'L\'étudiant ne fait pas partie de l\'équipe' });
      }

      /*Le capitaine ne peut pas se promouvoir lui-même */
      const equipe = await equipeModel.chercherEquipeID(idEquipe);
      if (idUser == equipe[0].idcapitaine) {
        return res.status(404).json({ erreur: 'Le capitaine ne peut pas se promouvoir lui-même.' });
      }

      equipeModel.promouvoir(idEquipe, idUser);
      return res.status(200).json({ message: "Membre promu" });

    } catch {
      return res.status(400).json({ error: "Erreur promotion" });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur appelle la fonction de suppression d'un membre de l'équipe.
 * L'id de l'équipe est récupéré dans l'url de la requête.
 * L'id de l'utilisateur à éjecté se trouve dans le body de la requête.
 * Une vérification est faite pour s'assurer que l'utilisateur à supprimer fait partie de l'équipe.
 * Accès à ce controller: Capitaine de l'équipe (étudiant), gestionnaires du projet de l'équipe et 
 * tous les administrateurs.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - Retourne un message de succès ou d'échec de la requête.
*/
async function supprimerMembre(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'DELETE') {

    const idEquipe = res.locals.idEquipe;

    const {
      idUser
    } = req.body;

    await validateUserId(idUser, req, res);

    try {
      /*Vérifier si l'étudiant est dans l'équipe */
      const appartenir = await equipeModel.appartenirEquipe(idUser, idEquipe);
      if (appartenir.length === 0) {
        return res.status(400).json({ erreur: 'L\'étudiant ne fait pas partie de l\'équipe' });
      }

      const equipe = await equipeModel.chercherEquipeID(idEquipe);
      if (idUser == equipe[0].idcapitaine) {
        return res.status(404).json({ erreur: 'Le capitaine ne peut pas se supprimer lui-même.' });
      }

      equipeModel.supprimerUnMembre(idUser, idEquipe);
      return res.status(200).json({ message: "Membre supprimé" });

    } catch {
      return res.status(400).json({ error: "Erreur suppression" });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur permet de récupérer toutes les informations d'une équipe
 * selon le profil de l'utilisateur qui veut consulter celle-ci.
 * 
 * L'id de l'équipe est récupéré dans l'url de la requête.
 * 
 * Accès à ce controller: Tous les utilisateurs ayant un compte.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - JSON contenant les informations de l'équipe ou un message d'erreur.
*/
async function getInfosEquipe(req, res) {

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {

    const idEquipe = res.locals.idEquipe;

    const jsonRetour = await equipeModel.jsonInformationsEquipe(idEquipe, req);

    return res.status(200).json(jsonRetour);
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur permet de récupérer la liste des équipes ouvertes à de nouveaux 
 * membres dans un événements.
 * 
 * Accès à ce controller: Etudiants.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - JSON contenant la liste des équipes ouvertes ou un message d'erreur.
*/
async function listeOuvertes(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {

    const idEvent = res.locals.idEvent;

    try {
      const equipesOuvertes = await equipeModel.jsonEquipesOuvertes(idEvent, req);
      return res.status(200).json(equipesOuvertes);

    } catch {
      return res.status(400).json({ error: 'Erreur lors de la récupération' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur appelle la fonction qui permet à un étudiant de quitter
 * une équipe dont il fait partie.
 * 
 * Le capitaine de celle-ci ne peut pas la quitter. 
 * Une vérification est faite pour s'assurer que l'étudiant fait partie de l'équipe
 * et qu'il nest pas capitaine.
 *
 * Accès à ce controller: Etudiants.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - Message de succès ou d'erreur.
*/
async function quitterEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  } else if (req.method === 'DELETE') {

    const idUser = req.id;
    const idEquipe = res.locals.idEquipe;

    /*Doit appartenir à l'équipe */
    const appartenir = await equipeModel.appartenirEquipe(idUser, idEquipe);
    if (appartenir.length === 0) {
      return res.status(404).json({ erreur: 'L\'étudiant n\'appartient pas à l\'équipe' });
    }
    const equipe = await equipeModel.chercherEquipeID(idEquipe);

    /*Ne doit pas être capitaine */
    if (equipe[0].idcapitaine == idUser) {
      return res.status(404).json({ erreur: 'Le capitaine ne peut pas quitter son équipe' });
    }

    try {
      equipeModel.quitterEquipe(idEquipe, idUser);
      return res.status(200).json({ message: "Equipe quittée" });

    } catch (error) {
      return res.status(400).json({ error: 'N\'a pas pu quitter.' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur permet à un étudiant d'envoyer une demande d'admission
 * à une équipe.
 * 
 * Une vérification est faite pour s'assurer que l'étudiant n'a aucune équipe dans
 * l'événement ou qu'il n'a pas encore  envoyé de message à cette équipe. Si oui, un message 
 * d'erreur est renvoyé. Sinon, la demande est transmise.
 *
 * Accès à ce controller: Etudiants.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - Message de succès ou d'erreur.
*/
async function demandeEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idUser = req.id;
    let idEquipe = res.locals.idEquipe;

    const data = req.body;
    const message = data.message.trim();

    const valeurs = [
      idUser,
      idEquipe,
      message
    ]

    const equipe = await equipeModel.chercherEquipeID(idEquipe);

    /*Vérifier que l'équipe est ouverte */
    if (equipe[0].statut_recrutement === 'fermé') {
      return res.status(404).json({ erreur: 'L\'équipe est fermée' });
    }

    /* L'étudiant ne doit pas avoir d'équipe dans l'event*/

    /*Récupérer l'event de l'équipe*/
    const idProjet = equipe[0].idprojet;
    const projet = await projetModel.chercheridProjet(idProjet);
    const idEvent = projet[0].idevent;

    const aUneEquipe = await equipeModel.aUneEquipeDansEvent(idUser, idEvent);

    if (aUneEquipe != -1) {
      return res.status(404).json({ erreur: 'Vous avez déjà une équipe dans cet évènement' });
    }

    /* Vérifier si une demande a déjà été envoyée */
    const envoyee = await demandeModel.demandeDejaEnvoyee(idUser, idEquipe);
    if (envoyee.length > 0) {
      return res.status(404).json({ erreur: 'Une demande a déjà été envoyée' });
    }

    await body('message')
      .isLength({ min: 0, max: 1200 })
      .withMessage('Le message doit contenir entre 0 et 1200 caracteres')
      .run(req);


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errorDetected = true;
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      demandeModel.envoyerDemande(valeurs);
      return res.status(200).json({ message: "Message envoyé" });

    } catch (error) {
      return res.status(400).json({ error: 'Erreur lors de l\'envoi du message.' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur permet d'accepter une demande d'admission.
 * 
 * Une vérification est faite pour s'assurer que l'étudiant: -n'a aucune équipe dans
 * l'événement, -a bien envoyé une demande. Si oui, un message d'erreur est renvoyé. 
 * Sinon, il est ajouté et toutes ses anciennes demandes dans les autres équipes
 * de l'événement sont effacées.
 *
 * Accès à ce controller: Gestionnaires du projet de l'équipe, capitaine et les administrateurs.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - Message de succès ou d'erreur.
*/
async function accepterDemande(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idEquipe = res.locals.idEquipe;
    const idUser = req.body.id;

    await validateUserId(idUser, req, res);

    const equipe = await equipeModel.chercherEquipeID(idEquipe);

    /* L'étudiant ne doit pas avoir d'équipe dans l'event*/

    /*Récupérer l'event de l'équipe*/
    const idProjet = equipe[0].idprojet;
    const projet = await projetModel.chercheridProjet(idProjet);
    const idEvent = projet[0].idevent;

    const aUneEquipe = await equipeModel.aUneEquipeDansEvent(idUser, idEvent);

    if (aUneEquipe != -1) {
      return res.status(200).json({ erreur: 'L\'utilisateur a déjà rejoint une équipe' });
    }

    /* Vérifier si l'étudiant a bien envoyé une demande */
    const envoyee = await demandeModel.demandeDejaEnvoyee(idUser, idEquipe);
    if (envoyee.length === 0) {
      return res.status(400).json({ erreur: 'Aucune demande provenant de cet utilisateur' });
    }

    /*Si l'équipe est au complet, on ne peut pas accepeter de demande*/
    const nb_max_event = (await eventModel.chercherEvenement(idEvent))[0].nombre_max_equipe;
    const nb_membres = (await equipeModel.ListeMembre(idEquipe)).length;

    if (nb_max_event == nb_membres) {
      return res.status(400).json({ error: 'L\'équipe est déjà complète' });
    }

    try {
      equipeModel.ajouterMembre(idUser, idEquipe);

      /* Supprimer les demandes de l'étudiant des autres equipes */
      demandeModel.supprimerDemandes(idUser);

      /*Si l'équipe devient complète, se ferme */
      if ((nb_membres + 1) === nb_max_event) {
        equipeModel.fermerEquipe(idEquipe);
      }
      return res.status(200).json({ message: "Etudiant accepté" });

    } catch (error){
      return res.status(400).json({ error: 'Erreur lors de l\'acceptation de l\'étudiant.' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur permet d'accepter une demande d'admission.
 * 
 * Une vérification est faite pour s'assurer que l'étudiant a bien envoyé une demande. 
 * Si oui, un message d'erreur est renvoyé. 
 * Sinon, il est ajouté et toutes ses anciennes demandes dans les autres équipes
 * de l'événement sont effacées.
 *
 * Accès à ce controller: Gestionnaires du projet de l'équipe, capitaine et les administrateurs.
 * 
 * Route: teams.js
 * 
 * @returns {Object} - Message de succès ou d'erreur.
*/
async function declinerDemande(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idEquipe = res.locals.idEquipe;
    const idUser = req.body.id;

    await validateUserId(idUser, req, res);

    /* Vérifier si l'étudiant a bien envoyé une demande */
    const envoyee = await demandeModel.demandeDejaEnvoyee(idUser, idEquipe);
    if (envoyee.length === 0) {
      return res.status(404).json({ erreur: 'Aucune demande provenant de cet utilisateur' });
    }

    try {
      demandeModel.declinerDemande(idUser, idEquipe);
      return res.status(200).json({ message: "Demande rejetée" });

    } catch (error){
      return res.status(400).json({ error: 'Erreur lors du rejet de la demande.' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @description  Ce contrôleur permet de récupérer la liste des équipes d'un étudiant.

 * Accès à ce controller :Etudiant.
 * 
 * Route: teams.js
 * 
 * @returns {Object} -JSON de la liste des équipes sinon message d'erreur.
*/
async function voirMesEquipes(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {
    try {
      const jsonInfos = await equipeModel.jsonMesEquipes(req.id);
      return res.status(200).json(jsonInfos);

    } catch (error) {
      console.log(error)
      return res.status(400).json({ erreur: "Erreur lors de la récupération des données." });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

module.exports = {
  retournerEquipeProjet,
  creerEquipe,
  supprimerEquipe,
  modifierEquipe,
  getInfosEquipe,
  listeOuvertes,
  promouvoir,
  supprimerMembre,
  quitterEquipe,
  demandeEquipe,
  accepterDemande,
  declinerDemande,
  voirMesEquipes,
}