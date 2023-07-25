const equipeModel = require('../models/equipeModel');
const projetModel = require('../models/projetModel');
const eventModel = require('../models/eventModel');
const etudiantModel = require('../models/etudiantModel');
const demandeModel = require('../models/demandeModel')
const { body, validationResult } = require('express-validator');


async function retournerEquipeProjet(req, res) {
  if (req.userProfile === 'admin') {
    if (req.method === 'OPTIONS') {
      res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'GET') {
      const idProjet = res.locals.projetId;

      /**Vérifier si l'id existe dans la bdd, sinon 404 error */
      projetModel.chercherProjetId(idProjet)
        .then((result) => {
          if (result.length === 0) {
            return res.status(404).json({ erreur: "L'id n'existe pas" });
          }
        });

      try {
        const equipeList = await equipeModel.jsonListeEquipeProjet(idProjet);
        res.status(200).json(equipeList);
      } catch (error) {
        res.status(400).json({ erreur: "Erreur lors de la récupération des équipes" });
      }
    }
  } else if (req.userProfile === 'etudiant') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "etudiant" });
  } else if (req.userProfile === 'gestionnaire') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "gestionnaire" });
  } else if (req.userProfile === 'aucun') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "Aucun" });
  }
}

async function creerEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    //Si admin ou gestionnaire, ne pas recuperer l'id capitaine dans le token
    const idCapitaine = req.id;

    /*Récupération données du body */
    const {
      nom,
      statut,
      description,
      idProjet,
    } = req.body;

    const infos = [
      idCapitaine,
      nom,
      description,
      statut,
      idProjet
    ]

    /* L'étudiant ne doit pas avoir d'équipe dans l'event*/

    /*Récupérer l'event de l'équipe*/
    const projet = await projetModel.chercherProjetId(idProjet);
    const idEvent = projet[0].idevent;

    const projets_event = await projetModel.recuperer_projets(idEvent);

    for (i = 0; i < projets_event.length; i++) {

      const equipes_projets = await equipeModel.listeEquipeProjet(projets_event[i].idprojet);

      for (j = 0; j < equipes_projets.length; j++) {

        let appartenir = await equipeModel.appartenirEquipe(req.id, equipes_projets[j].idequipe);
        console.log(equipes_projets[j].idequipe, projets_event[0].idprojet)

        if (appartenir.length > 0) {
          return res.status(404).json({ erreur: 'Il a déjà une équipe dans l\'evenement' });
        }
      }
    }

    /* Création de l'équipe */
    try {
      let idEquipe = await equipeModel.creerEquipe(infos);

      equipeModel.ajouterMembre(idCapitaine, idEquipe);

      return res.status(200).json({ message: 'Équipe ' + idEquipe + ' créée avec succès. Capitaine: ' + idCapitaine });

    } catch (error) {
      return res.status(400).json({ erreur: 'Erreur création équipe.' });
    }
  }
}

async function modifierEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'PATCH') {

    const idEquipe = res.locals.idEquipe;

    const {
      nom,
      statut,
      description,
      idProjet,
      lien_discussion,
      preferenceQuestionnaire
    } = req.body;


    const valeurs = [
      nom,
      description,
      statut,
      idProjet,
      lien_discussion,
      preferenceQuestionnaire,
      idEquipe
    ]

    try {
      /* Vérification de l'existence de l'id dans le verif profil*/

      equipeModel.modifierEquipe(valeurs);
      res.status(200).json({ message: "Equipe modifiée" });

    } catch {
      res.status(400).json({ error: "Modification de l'équipe" });
    }
  }
}

async function modifierGit(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'PATCH') {

    /*Récupération données du body */
    const {
      lien_github
    } = req.body;

    const idEquipe = res.locals.idEquipe;
    const idUser = req.id;

    /* Vérifier si l'équipe existe */
    const equipe = await equipeModel.chercherEquipeID(idEquipe);

    if (equipe.length === 0) {
      return res.status(404).json({ erreur: 'L\'id de l\'équipe n\'existe pas' });
    }

    /*Vérifier si l'étudiant est dans l'équipe */
    const appartenir = await equipeModel.appartenirEquipe(idUser, idEquipe);
    if (appartenir.length === 0) {
      return res.status(404).json({ erreur: 'L\'étudiant ne fait pas partie de l\'équipe' });
    }

    await body('lien_github')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ min: 0, max: 200 }).withMessage('Le message doit contenir entre 4 et 300 caracteres')
      .isURL().withMessage('Doit être un lien')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      equipeModel.modifier_git(lien_github, idEquipe);
      res.status(200).json({ message: 'Lien github modifié' })
    } catch {
      res.status(400).json({ message: 'Erreur modification lien github' })
    }

  }
}

async function supprimerEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'DELETE') {

    try {
      const idEquipe = res.locals.idEquipe;

      /* Vérification de l'existence de l'id dans le verif profil*/

      /*Suppression */
      equipeModel.supprimerEquipe(idEquipe);
      res.status(200).json({ message: "Equipe supprimée" });

    } catch {
      res.status(400).json({ error: "Suppression de l'équipe" });
    }
  }
}

async function promouvoir(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    try {

      const idEquipe = res.locals.idEquipe;

      const {
        idUser
      } = req.body;

      /* La verif de l'existence de l'équipe fait dans la verif de profil (middleware) */

      /*Vérifier si l'étudiant est dans l'équipe */
      const appartenir = await equipeModel.appartenirEquipe(idUser, idEquipe);
      if (appartenir.length === 0) {
        return res.status(404).json({ erreur: 'L\'étudiant ne fait pas partie de l\'équipe' });
      }

      /*Le capitaine ne peut pas se promouvoir lui-même */
      const equipe = await equipeModel.chercherEquipeID(idEquipe);
      if (idUser === equipe[0].idcapitaine) {
        return res.status(404).json({ erreur: 'Le capitaine ne peut pas se supprimer lui-même.' });
      }

      equipeModel.promouvoir(idEquipe, idUser);
      res.status(200).json({ message: "Capitaine promu" });

    } catch {
      res.status(400).json({ error: "Erreur promotion" });
    }
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

    try {
      /* Vérification de l'existence de l'id dans le verif profil*/

      /*Vérifier si l'étudiant est dans l'équipe */
      const appartenir = await equipeModel.appartenirEquipe(idUser, idEquipe);
      if (appartenir.length === 0) {
        return res.status(404).json({ erreur: 'L\'étudiant ne fait pas partie de l\'équipe' });
      }

      const equipe = await equipeModel.chercherEquipeID(idEquipe);
      if (idUser === equipe[0].idcapitaine) {
        return res.status(404).json({ erreur: 'Le capitaine ne peut pas se supprimer lui-même.' });
      }

      equipeModel.supprimerUnMembre(idUser, idEquipe);
      res.status(200).json({ message: "Membre supprimé" });

    } catch {
      res.status(400).json({ error: "Erreur suppression" });
    }
  }
}
/* Voir le profil, d'une équipe et pour la modif
Si c'est un etudiant lambda ou gestionnaire, voir le minimum
si un membre de l'équipe voir un peu plus
si capitaine/gestionnaire de l'équipe ou admin voir tout */
async function getInfosEquipe(req, res) {

  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {


    const idEquipe = res.locals.idEquipe;

    /*La vérification de l'id de l'équipe se fait dans le veif profil */

    const jsonRetour = await equipeModel.jsonInformationsEquipe(idEquipe, req);

    res.status(200).json(jsonRetour);
  }
}


async function listeOuvertes(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {

    try {
      const equipesOuvertes = await equipeModel.jsonEquipesOuvertes();
      res.status(200).json(equipesOuvertes);

    } catch {
      res.status(400).json({ error: 'Erreur lors de la récupération' });
    }
  }
}

async function quitterEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'DELETE') {

    const idUser = req.id;
    const idEquipe = res.locals.idEquipe;

    /* Vérifier l'id de l'équipe */
    const equipe = await equipeModel.chercherEquipeID(idEquipe);
    if (equipe.length === 0) {
      return res.status(404).json({ erreur: 'L\'id de l\'équipe n\'existe pas' });
    }

    /*Doit appartenir à l'équipe */
    const appartenir = await equipeModel.appartenirEquipe(idUser, idEquipe);
    if (appartenir.length === 0) {
      return res.status(404).json({ erreur: 'L\'étudiant n\'appartient pas à l\'équipe' });
    }

    /*Ne doit pas être capitaine */
    if (equipe[0].idcapitaine === idUser) {
      return res.status(404).json({ erreur: 'Le capitaine ne peut pas quitter son équipe' });
    }

    try {
      equipeModel.quitterEquipe(idEquipe, idUser);
      res.status(200).json({ message: "Equipe quittée" });

    } catch {
      res.status(400).json({ error: 'N\'a pas pu quitter.' });
    }
  }
}

async function demandeEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idUser = req.id;
    const idEquipe = res.locals.idEquipe;

    const {
      message
    } = req.body;

    const valeurs = [
      idUser,
      idEquipe,
      message
    ]

    await body('message')
      .isLength({ min: 0, max: 200 })
      .withMessage('Le message doit contenir entre 0 et 200 caracteres')
      .run(req);


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    /*Vérif existence équipe */
    const equipe = await equipeModel.chercherEquipeID(idEquipe);
    if (equipe.length === 0) {
      return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
    }

    /* L'étudiant ne doit pas avoir d'équipe dans l'event*/

    /*Récupérer l'event de l'équipe*/
    const idProjet = equipe[0].idprojet;
    const projet = await projetModel.chercherProjetId(idProjet);
    const idEvent = projet[0].idevent;

    const projets_event = await projetModel.recuperer_projets(idEvent);

    for (i = 0; i < projets_event.length; i++) {

      const equipes_projets = await equipeModel.listeEquipeProjet(projets_event[i].idprojet);

      for (j = 0; j < equipes_projets.length; j++) {

        let appartenir = await equipeModel.appartenirEquipe(idUser, equipes_projets[j].idequipe);
        console.log(equipes_projets[j].idequipe, projets_event[0].idprojet)

        if (appartenir.length > 0) {
          return res.status(404).json({ erreur: 'Il a déjà une équipe dans l\'evenement' });
        }
      }
    }

    /* Vérifier si une demande a déjà été envoyée */
    const envoyee = await equipeModel.demandeDejaEnvoyee(idUser, idEquipe);
    if (envoyee.length > 0) {
      return res.status(404).json({ erreur: 'Une demande a déjà été envoyée' });
    }

    try {
      equipeModel.envoyerDemande(valeurs);
      res.status(200).json({ message: "Message envoyé" });

    } catch {
      res.status(400).json({ error: 'Erreur lors de l\'envoi du message.' });
    }
  }
}

async function accepterDemande(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idEquipe = res.locals.idEquipe;

    const {
      id: idUser
    } = req.body;


    /*Vérif existence équipe */
    const equipe = await equipeModel.chercherEquipeID(idEquipe);
    if (equipe.length === 0) {
      return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
    }

    /* L'étudiant ne doit pas avoir d'équipe dans l'event*/

    /*Récupérer l'event de l'équipe*/
    const projet = await projetModel.chercherProjetId(idProjet);
    const idEvent = projet[0].idevent;

    const projets_event = await projetModel.recuperer_projets(idEvent);

    for (i = 0; i < projets_event.length; i++) {

      const equipes_projets = await equipeModel.listeEquipeProjet(projets_event[i].idprojet);

      for (j = 0; j < equipes_projets.length; j++) {

        let appartenir = await equipeModel.appartenirEquipe(req.id, equipes_projets[j].idequipe);
        console.log(equipes_projets[j].idequipe, projets_event[0].idprojet)

        if (appartenir.length > 0) {
          return res.status(404).json({ erreur: 'Il a déjà une équipe dans l\'evenement' });
        }
      }
    }

    /* Vérifier si l'étudiant a bien envoyé une demande */
    const envoyee = await equipeModel.demandeDejaEnvoyee(idUser, idEquipe);
    if (envoyee.length === 0) {
      return res.status(404).json({ erreur: 'Aucune demande provenant de cet id' });
    }

    /* Supprimer les demandes de l'étudiant des autres equipes */
    try {
      demandeModel.supprimerDemandes(idUser);
    } catch {
      return res.status(404).json({ erreur: 'Erreur lors de la suppression des anciennes demandes de l\'étudiant' });
    }

    try {
      equipeModel.ajouterMembre(idUser, idEquipe);
      res.status(200).json({ message: "Etudiant accepté" });

    } catch {
      res.status(400).json({ error: 'Erreur lors de l\'acceptation de l\'étudiant.' });
    }
  }
}

async function declinerDemande(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idEquipe = res.locals.idEquipe;

    const {
      id: idUser
    } = req.body;


    /*Vérif existence équipe */
    const equipe = await equipeModel.chercherEquipeID(idEquipe);
    if (equipe.length === 0) {
      return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
    }

    /* Vérifier si l'étudiant a bien envoyé une demande */
    const envoyee = await equipeModel.demandeDejaEnvoyee(idUser, idEquipe);
    if (envoyee.length === 0) {
      return res.status(404).json({ erreur: 'Aucune demande provenant de cet id' });
    }

    try {
      demandeModel.declinerDemande(idUser, idEquipe);
      res.status(200).json({ message: "Demande rejetée" });

    } catch {
      res.status(400).json({ error: 'Erreur lors du rejet de la demande.' });
    }
  }
}

async function voirMesEquipes(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {

    try{
      const jsonInfos = await equipeModel.jsonMesEquipes(req.id);
      res.status(200).json(jsonInfos);

    }catch{
      res.status(400).json({erreur: "Erreur lors de la récupération des données."});
    }
  }
}




/* Admin, inutile je crois, peut etre à supprimer plus tard */
// async function informationsEquipeAdmin(req, res) {
//   if (req.method === 'OPTIONS') {
//     res.status(200).json({ sucess: 'Agress granted' });
//   } else if (req.method === 'GET') {
//     const idEquipe = res.locals.idEquipe;

//     try {

//       const equipeInfos = await equipeModel.chercherEquipeID(idEquipe);

//       if (equipeInfos.length === 0) {
//         return res.status(404).json({ erreur: "L'id de l'équipe n'existe pas" });
//       } else {

//         const equipeList = await equipeModel.jsonInfosEquipe(idEquipe);
//         res.status(200).json(equipeList);
//       }
//     } catch (error) {

//       res.status(500).json({ erreur: "Erreur lors de la récupération de l'équipe" });
//     }
//   }
// }


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
  modifierGit,
  voirMesEquipes
}