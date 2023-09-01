const projetModel = require('../models/projetModel');
const eventModel = require('../models/eventModel');
const regleModel = require('../models/reglesModel');
const { body, validationResult } = require('express-validator');

/**
 * Création d'un événement.
 * @async
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Cette fonction permet d'appeler la fonction de création d'événement.
 * 
 * Les données concernant celui-ci sont récupérées et vérifiées. Par exemple, les titres des règles
 * ne doivent pas être vides.
 * Si des règles et des projets sont associés, on les y rattache.
 *  
 * Accès à ce controller: Administrateurs.
 * 
 * Route: events.js
 * @returns {Object} - Message de succès ou d'erreur.

 * 
 */
async function createEvent(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: 'Access granted' });
  } else if (req.method === 'POST') {

    /* récupération des données */
    const data = req.body;

    const nom = data.nom.trim();
    const description = data.description.trim();
    const valeurs_event = [
      data.typeEvent,
      nom,
      data.inscription,
      data.debut,
      data.fin,
      description,
      data.nombreMinEquipe,
      data.nombreMaxEquipe,
      data.image
    ];


    for (let regle of data.regles) {
      await body('regles')
        .optional()
        .isArray({ min: 1 }).withMessage('Le tableau des ressources ne doit pas être vide.')
        .run(req);

      await body('regles.*.titre')
        .notEmpty().withMessage('Le nom des règles ne doit pas être vide.')
        .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit avoir une longueur comprise entre 2 et 50 caractères.')
        .run(req);

      await body('regles.*.contenu')
        .notEmpty().withMessage('La règle ne doit pas être vide.')
        .isLength({ min: 2, max: 1000 }).withMessage('Le lien doit avoir une longueur comprise entre 3 et 1000 caractères.')
        .run(req);

      regle.titre = regle.titre.trim();
      regle.contenu = regle.contenu.trim();

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errorDetected = true; // Marquer qu'une erreur a été détectée
        return res.status(400).json({ errors: errors.array() });
      }
    }

    try {
      /*Création de l'événement, idevent stocke l'id de celui-ci */
      const idevent = await eventModel.creerEvent(valeurs_event, data.regles);

      if (typeof idevent === 'number') {

        /* On associe tous les projets à l'événement */
        for (i = 0; i < data.projets.length; i++) {

          /* Vérification de l'existence */
          const projet = await projetModel.chercheridProjet(data.projets[i].idProjet);

          if (projet.length === 0) {
            return res.status(404).json({ erreur: 'L\'id ' + data.projets[i].idProjet + ' n\'existe pas dans les projets' });
          }
          await projetModel.rattacherProjetEvent(idevent, data.projets[i].idProjet);
        }
        return res.status(200).json({ message: 'Evenement créé' });
      }
      return res.status(400).json({ error: 'Erreur création' });
    } catch (error) {
      return res.status(400).json({ error: 'Erreur création' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @async
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Ce contrôleur permet d'appeler la fonction de modification d'événement.
 * 
 * L'id de l'événement est récupéré de l'url de la requête.
 * Les données sont vérifiées comme lors de la création de l'événement.
 * Des projets et des règles peuvent être rajoutés ou détachés.
 *  
 * Accès à ce controller: Administrateurs.
 * 
 * Route: events.js
 * @returns {Object} - Message de succès ou d'erreur.
 */
async function modifierEvent(req, res) {

  if (req.method === 'OPTIONS') {

    res.status(200).json({ success: 'Access granted' });
  }
  else if (req.method === 'PATCH') {

    const idevent = res.locals.idevent;

    /*Récupération des données */
    const data = req.body;

    const valeurs_event = [
      data.nom,
      data.inscription,
      data.debut,
      data.fin,
      data.description,
      data.nombreMinEquipe,
      data.nombreMaxEquipe,
      data.messageFin,
      data.image,
      idevent,
    ];

    for (let regle of data.regles) {
      await body('regles')
        .optional()
        .isArray({ min: 1 }).withMessage('Le tableau des ressources ne doit pas être vide.')
        .run(req);

      await body('regles.*.titre')
        .notEmpty().withMessage('Le nom des règles ne doit pas être vide.')
        .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit avoir une longueur comprise entre 2 et 50 caractères.')
        .run(req);

      await body('regles.*.contenu')
        .notEmpty().withMessage('La règle ne doit pas être vide.')
        .isLength({ min: 2, max: 1000 }).withMessage('Le lien doit avoir une longueur comprise entre 3 et 1000 caractères.')
        .run(req);


      regle.titre = regle.titre.trim();
      regle.contenu = regle.contenu.trim();

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errorDetected = true;
        return res.status(400).json({ errors: errors.array() });
      }
    }

    try {
      eventModel.modifierEvent(valeurs_event)

      /**Supprimer anciennes données */
      regleModel.supprimerRegles(idevent);
      projetModel.detacherProjetEvent(idevent);

      /* Ajout des projets*/
      for (i = 0; i < data.projets.length; i++) {

        const user = await projetModel.chercheridProjet(data.projets[i].idProjet);
        if (user.length === 0) {
          return res.status(404).json({ erreur: 'L\'id ' + data.projets[i].idProjet + ' n\'existe pas dans les projets' });
        }

        await projetModel.rattacherProjetEvent(idevent, data.projets[i].idProjet);
      }

      /*Ajout des règles*/
      for (let i = 0; i < data.regles.length; i++) {
        regleModel.ajouterRegle(idevent, data.regles[i].titre, data.regles[i].contenu);
      }
      return res.status(200).json({ message: "Projet modifié" });
    } catch (error) {
      return res.status(400).json({ erreur: "L'événement n'a pas pu être modifié" });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @async
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Ce contrôleur permet d'appeler la fonction de suppression d'événement.
 * 
 * L'id de l'événement est récupéré de l'url de la requête.
 *  
 * Accès à ce controller: Administrateurs.
 * 
 * Route: events.js
 * @returns {Object} - Message de succès ou d'erreur.

 */
function supprimerEvent(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'DELETE') {

    const idevent = res.locals.idevent;

    try {
      eventModel.supprimerEvent(idevent);
      return res.status(200).json({ message: "Suppression réussie" });
    } catch (error) {
      return res.status(500).json({ erreur: 'Erreur lors de la suppression de l\'événement.' });
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
 * @description Ce contrôleur permet de récupérer la liste des équipes qui 
 * participent à un événement donné.
 * 
 * L'id de l'événement est récupéré de l'url de la requête.
 *  
 * Accès à ce controller: Administrateurs.
 * 
 * Route: events.js
 * @returns {Object} -JSON de la liste des équipes ou message d'erreur si la 
 * requête échoue.
 */
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

/**
 * @async
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Ce contrôleur permet de récupérer les informations liées à un événement.
 * 
 * L'id de l'événement est récupéré de l'url de la requête.
 * La différence avec le contrôleur 'voirEvent' est que ce dernier permet à l'affichage 
 * des informations de l'événement sur la page d'accueil alors que ce contrôleur récupère
 * toutes les informations modifiables par l'administrateur (page de modification).
 *  
 * Accès à ce controller: Administrateurs.
 * 
 * Route: events.js
 * @returns {Object} -JSON des informations ou message d'erreur si la 
 * requête échoue.
 */
async function recupInfoEvent(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {

    try {
      const idevent = res.locals.idevent;
      const json = await eventModel.recup_Infos_Modif_Event(idevent);
      return res.status(200).json(json);

    } catch (error) {
      return res.status(400).json({ error: 'Erreur lors de la récupération des informations de l\'événement.' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @async
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Ce contrôleur permet de récupérer les informations liées à un événement.
 * 
 * L'id de l'événement est récupéré de l'url de la requête.
 * 
 * Le JSON des informations varient selon le profil d'utilisateur.
 *  
 * Accès à ce controller: Connectés et non connectés.
 * 
 * Route: index.js
 * @returns {Object} -JSON des informations ou message d'erreur si la 
 * requête échoue.
 */
async function voirEvent(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  } else if (req.method === 'GET') {

    const eventID = res.locals.eventID;

    let jsonRetour;

    try {
      if (req.userProfile === 'admin' || req.userProfile === 'gestionnaire') {
        jsonRetour = await eventModel.jsonEventChoisi(eventID, 'admin', req)
      }

      /**Si c'est un etudiant, afficher les infos de l'etudiant en plus, (id de l'équipe) */
      else if (req.userProfile === 'etudiant') {
        jsonRetour = await eventModel.jsonEventChoisi(eventID, 'etudiant', req)
      }

      /**Si non connecté ne pas envoyer les infos des ressources privées */
      else if (req.userProfile === 'aucun') {
        jsonRetour = await eventModel.jsonEventChoisi(eventID, 'aucun', req)
      }
      return res.status(200).json(jsonRetour);

    } catch (error) {
      return res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération de l\'événement.' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

/**
 * @async
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Ce contrôleur permet de récupérer la liste de tous les événements qui existent.
 * 
 * Le JSON des informations varient selon le profil d'utilisateur.
 *  
 * Accès à ce controller: Connectés et non connectés.
 * 
 * Route: index.js
 * 
 * @returns {Object} -JSON des informations ou message d'erreur si la 
 * requête échoue.
 */
async function voirTousEvents(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ sucess: 'Agress granted' });
  } else if (req.method === 'GET') {

    try {
      const result = await eventModel.creerJsonTousEvents();
      return res.status(200).json(result);

    } catch (error) {
      return res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des événements.' });
    }
  } else {
    return res.status(404).json('Page not found');
  }
}

module.exports = {
  createEvent,
  modifierEvent,
  supprimerEvent,
  listeEquipes,
  recupInfoEvent,
  voirEvent,
  voirTousEvents
}