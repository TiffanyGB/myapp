const projetModel = require('../models/projetModel');
const eventModel = require('../models/eventModel');
const regleModel = require('../models/reglesModel');
const { body, validationResult } = require('express-validator');

async function createEvent(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ success: 'Access granted' });
  } else if (req.method === 'POST') {

    /* récupération des données */
    const {
      typeEvent,
      nom,
      inscription,
      debut,
      fin,
      description,
      nombreMinEquipe,
      nombreMaxEquipe,
      image,
      regles,
      projets,
    } = req.body;

    const valeurs_event = [
      typeEvent,
      nom,
      inscription,
      debut,
      fin,
      description,
      nombreMinEquipe,
      nombreMaxEquipe,
      image
    ];

    for (const regle of regles) {
      await body('regles')
        .optional()
        .isArray({ min: 1 }).withMessage('Le tableau des ressources ne doit pas être vide.')
        .run(req);

      await body('regles.*.titre')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit avoir une longueur comprise entre 2 et 50 caractères.')
        .run(req);

      await body('regles.*.contenu')
        .notEmpty().withMessage('La règle ne doit pas être vide.')
        .isLength({ min: 2, max: 1000 }).withMessage('Le lien doit avoir une longueur comprise entre 3 et 1000 caractères.')
        .run(req);

      // Exécute la requête de validation adaptée
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    }


    try {

      const idevent = await eventModel.creerEvent(valeurs_event, regles);

      /* l'id de l'event doit être un nombre, sinon erreur */
      if (typeof idevent === 'number') {

        /* Pour tous les projets, on les associe à l'événement */
        for (i = 0; i < projets.length; i++) {

          /* Vérification de l'existence */
          const user = await projetModel.chercheridProjet(projets[i].idProjet);

          if (user.length === 0) {
            return res.status(404).json({ erreur: 'L\'id ' + projets[i].idProjet + ' n\'existe pas dans les projets' });
          }
          await projetModel.rattacherProjetEvent(idevent, projets[i].idProjet);
        }
        return res.status(200).json({ message: 'Evenement créé' });
      }
      return res.status(400).json({ error: 'Failed to insert' });
    } catch (error) {
      return res.status(400).json({ error: 'Failed to insert' });
    }
  }
}

async function modifierEvent(req, res) {

  if (req.method === 'OPTIONS') {

    res.status(200).json({ success: 'Access granted' });
  }
  else if (req.method === 'PATCH') {

    const idevent = res.locals.idevent;

    /*Récupération des données */
    const {
      nom,
      inscription,
      debut,
      fin,
      description,
      nombreMinEquipe,
      nombreMaxEquipe,
      messageFin,
      projets,
      regles,
      image
    } = req.body;

    const valeurs_event = [
      nom,
      inscription,
      debut,
      fin,
      description,
      nombreMinEquipe,
      nombreMaxEquipe,
      messageFin,
      image,
      idevent, 
    ];

    try {
      eventModel.modifierEvent(valeurs_event)

      /**Supprimer anciennes données */
      regleModel.supprimerRegles(idevent);
      projetModel.detacherProjetEvent(idevent);

      /* Ajout des projets*/
      for (i = 0; i < projets.length; i++) {

        const user = await projetModel.chercheridProjet(projets[i].idProjet);
        if (user.length === 0) {
          return res.status(404).json({ erreur: 'L\'id ' + projets[i].idProjet + ' n\'existe pas dans les projets' });
        }

        await projetModel.rattacherProjetEvent(idevent, projets[i].idProjet);
      }

      /*Ajout des règles*/
      for (let i = 0; i < regles.length; i++) {
        await regleModel.ajouterRegle(idevent, regles[i].titre, regles[i].contenu);
      }
      return res.status(200).json({ message: "Projet modifié" });
    } catch (error) {
      return res.status(400).json({ erreur: "L'événement n'a pas pu être modifié" });
    }
  }
}

async function supprimerEvent(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'DELETE') {

    const idevent = res.locals.idevent;

    try {

      const result = await eventModel.supprimerEvent(idevent);
      if (result === 'ok') {
        return res.status(200).json({ message: "Suppression réussie" });
      } else {
        return res.status(400).json({ erreur: 'Echec de la suppression' });
      }
    } catch (error) {
      return res.status(500).json({ erreur: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  }
}

async function listeEquipes(req, res) {

  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {

    const idevent = res.locals.idevent;

    try {
      const event = await eventModel.jsonlisteEquipeEvent(idevent);
      return res.status(200).json(event)

    }
    catch {
      return res.status(404).json({ erreur: 'Erreur lors de la récupération des informations' });
    }
  }
}

async function recupInfoEvent(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {

    const idevent = res.locals.idevent;

    const json = await eventModel.recup_Infos_Modif_Event(idevent);


    res.status(200).json(json);

  }
}

module.exports = {
  createEvent,
  modifierEvent,
  supprimerEvent,
  listeEquipes,
  recupInfoEvent
}