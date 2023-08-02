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
      regles,
      projets, oui
    } = req.body;

    const valeurs_event = [
      typeEvent,
      nom,
      inscription,
      debut,
      fin,
      description,
      nombreMinEquipe,
      nombreMaxEquipe
    ];

    /*Vérifier données des règles */
    for (const regle of req.body.regles) {
      await body(regle.titre)
        .notEmpty().withMessage('Le titre ne doit pas être vide.')
        .isLength({ min: 2, max: 50 }).withMessage('Le titre doit avoir une longueur comprise entre 2 et 50 caractères.')
        .run(req);

      await body(regle.contenu)
        .notEmpty().withMessage('La règle ne doit pas être vide.')
        .isLength({ min: 2, max: 1000 }).withMessage('La règle doit avoir une longueur comprise entre 3 et 1000 caractères.')
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
          const user = await projetModel.chercherProjetId(projets[i].idProjet);

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

    /**Vérifier que l'id existe dans la bdd, sinon 404 error */
    eventModel.chercherEvenement(idevent)
      .then((result) => {

        if (result.length === 0) {
          res.status(404).json({ erreur: 'L\'id n\'existe pas' });
        }
      });

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
      regles
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
      idevent

    ];

    try {
      eventModel.modifierEvent(valeurs_event)

      /**Supprimer anciennes données */
      regleModel.supprimerRegles(idevent);
      projetModel.detacherProjetEvent(idevent);

      /* Ajout des projets*/
      for (i = 0; i < projets.length; i++) {

        const user = await projetModel.chercherProjetId(projets[i].idProjet);
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
      // Vérifier que l'id existe dans la bdd, sinon 404 error
      const user = await eventModel.chercherEvenement(idevent);
      if (user.length === 0) {
        return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
      }

      const result = await eventModel.supprimerEvent(idevent);
      if (result === 'ok') {
        return res.status(200).json({ message: "Suppression réussie" });
      } else {
        return res.status(400).json({ erreur: 'Echec de la suppression' });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur", error);
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
      const existe = await eventModel.chercherEvenement(idevent);
      // Vérifier que l'id existe dans la bdd, sinon 404 error
      if (existe === 0) {
        return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
      }
      res.status(200).json(event)

    }
    catch {
      return res.status(404).json({ erreur: 'Erreur lors de la récupération des informations' });
    }
  }
}

/**Probleme pofil, requete infinie */
async function recupInfoEvent(req, res) {
  if (req.userProfile === 'admin') {
    if (req.method === 'OPTIONS') {
      res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'GET') {

      const idevent = res.locals.idevent;

      const a = await eventModel.recup_Infos_Modif_Event(idevent);


      res.status(200).json(a);

    }
  }
}

module.exports = {
  createEvent,
  modifierEvent,
  supprimerEvent,
  listeEquipes,
  recupInfoEvent
}