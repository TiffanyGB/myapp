const projetModel = require('../models/projetModel');
const eventModel = require('../models/eventModel');


function voirListeEvents(req, res) {

  if (req.userProfile === 'admin') {
    if (req.method === 'OPTION') {
      res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'GET') {


      projetModel.listeProjetsJson()
        .then((result) => {
          if (result === 'aucun') {
            res.status(400).json({ erreur: "Erreur lors de la récupération des utilisateurs" })
          } else if (result === "erreur_student") {
            res.status(400).json({ erreur: "Erreur lors de la récupération des données côté étudiant" })
          } else {
            res.status(200).json(result);
          }
        });

    }
  } else if (req.userProfile === 'etudiant') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "etudiant" });
  } else if (req.userProfile === 'gestionnaire') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "gestionnaire" });
  } else if (req.userProfile === 'aucun') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "Aucun" });
  }
}

async function createEvent(req, res) {
  // if (req.userProfile === 'admin') {
  if (req.method === 'OPTION') {
    res.status(200).json({ success: 'Access granted' });
  } else if (req.method === 'POST') {
    const {
      typeEvent,
      nom,
      inscription,
      debut,
      fin,
      description,
      nombreMinEquipe,
      nombreMaxEquipe,
      regles
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


    try {
      const a = await eventModel.creerEvent(valeurs_event, regles);
      if (a === 'true') {
        res.status(200).json({ message: 'ok' });

      } else {
        res.status(400).json({ error: 'Failed to insert' });

      }

    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to insert' });
    }
  }
  // } else {
  //   res
  //     .status(400)
  //     .json({
  //       error:
  //         'Mauvais profil, il faut être administrateur',
  //       profil: req.userProfile
  //     });
  // }
}

//Modifier
async function modifierEvent(req, res) {

  if (req.userProfile === 'admin') {

    if (req.method === 'OPTION') {

      res.status(200).json({ success: 'Access granted' });
    }
    else if (req.method === 'PATCH') {

      const idUser = res.locals.userId;

      /**Vérifier que l'id existe dans la bdd, sinon 404 error */
      userModel.chercherUserID(idUser)
        .then((result) => {

          if (result.length === 0) {
            res.status(404).json({ erreur: 'L\'id n\'existe pas' });
          }
        });


      const {
        nom,
        inscription,
        debut,
        fin,
        description,
        image,
        nombreMinEquipe,
        nombreMaxEquipe,
        messageFin
      } = req.body;

      const valeurs_event = [
        nom,
        inscription,
        debut,
        fin,
        description,
        image,
        nombreMinEquipe,
        nombreMaxEquipe,
        messageFin
      ];

      eventModel.modifierEvent(valeurs_event)
    }
  }
}


//Supprimer
function supprimerEvent(req, res) {

}

module.exports = {
  voirListeEvents,
  createEvent,
  modifierEvent,
  supprimerEvent
}