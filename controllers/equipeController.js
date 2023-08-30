/** 
 * @fileoverview Controller de l'inscription
 * @module Equipe
 * 
 * @version 1.0.0 
 * @author Tiffany GAY-BELLILE
 * @requires ../../models/equipeModel
 * @requires ../../models/projetModel
 * @requires ../../models/projetModel
 * @requires ../../models/eventModel
 * @requires jsonwebtoken
 */

const equipeModel = require('../models/equipeModel');
const projetModel = require('../models/projetModel');
const demandeModel = require('../models/demandeModel')
const { body, validationResult } = require('express-validator');
const { creerDossier, creerUtilisateur, creerRepertoire } = require('./gitlab3');
const eventModel = require('../models/eventModel');
const { validateUserId } = require('../verifications/verifierDonnéesGénérales');


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

async function creerEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idCapitaine = req.id;

    /*Récupération données du body */
    const userData = req.body;

    const infos = [
      idCapitaine,
      userData.nom,
      userData.description,
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

      // /*Création du dossier de l'équipe dans le répertoire annexe*/
      // creerDossier(idEquipe, event_nom);

      // /*Création de l'utilisateur lié au repo de l'équipe */
      // const valeurs = await creerUtilisateur(userData.nom);
      // console.log(valeurs)

      // equipeModel.insererAccesEquipeGit(valeurs[1], valeurs[0], idEquipe);
      // /*Création du repo de l'équipe */
      // creerRepertoire(idEquipe, valeurs[2])

      return res.status(200).json(idEquipe);
    } catch (error) {
      return res.status(400).json({ erreur: 'Erreur création équipe.' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

async function modifierEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'PATCH') {

    const idEquipe = res.locals.idEquipe;

    const userData = req.body;

    const valeurs = [
      userData.nom,
      userData.description,
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
      return res.status(200).json({ message: "Capitaine promu" });

    } catch {
      return res.status(400).json({ error: "Erreur promotion" });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

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
/* Voir le profil, d'une équipe et pour la modif
Si c'est un etudiant lambda ou gestionnaire, voir le minimum
si un membre de l'équipe voir un peu plus
si capitaine/gestionnaire de l'équipe ou admin voir tout */
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

async function demandeEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idUser = req.id;
    let idEquipe = res.locals.idEquipe;

    const {
      message
    } = req.body;

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

async function voirMesEquipes(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {
    try {
      const jsonInfos = await equipeModel.jsonMesEquipes(req.id);
      return res.status(200).json(jsonInfos);

    } catch (error) {
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