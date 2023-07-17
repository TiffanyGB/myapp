const projetModel = require('../models/projetModel');
const eventModel = require('../models/eventModel');
const regleModel = require('../models/reglesModel');


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
  if (req.userProfile === 'admin') {
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
        regles,
        projets
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
        const idevent = await eventModel.creerEvent(valeurs_event, regles);

        if (typeof idevent === 'number') {



          for (i = 0; i < projets.length; i++) {

            const user = await projetModel.chercherProjetId(projets[i].idProjet);
            if (user.length === 0) {
              return res.status(404).json({ erreur: 'L\'id ' + projets[i].idProjet + ' n\'existe pas dans les projets' });
            }

            await projetModel.rattacherProjetEvent(idevent, projets[i].idProjet);
          }

          res.status(200).json({ message: 'ok' });
        } else {

          res.status(400).json({ error: 'Failed to insert' });
        }

      } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to insert' });
      }
    }
  } else {
    res
      .status(400)
      .json({
        error:
          'Mauvais profil, il faut être administrateur',
        profil: req.userProfile
      });
  }
}

async function modifierEvent(req, res) {

  // if (req.userProfile === 'admin') {

  if (req.method === 'OPTION') {

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

      for (i = 0; i < projets.length; i++) {

        const user = await projetModel.chercherProjetId(projets[i].idProjet);
        if (user.length === 0) {
          return res.status(404).json({ erreur: 'L\'id ' + projets[i].idProjet + ' n\'existe pas dans les projets' });
        }

        await projetModel.rattacherProjetEvent(idevent, projets[i].idProjet);
      }

      for (let i = 0; i < regles.length; i++) {
        await regleModel.ajouterRegle(idevent, regles[i].titre, regles[i].contenu);
    }

      return res.status(200).json({ message: "Projet modifié" });

    } catch (error) {
      console.error("Erreur lors de la modification de l'événement", error);
      return res.status(400).json({ erreur: "L'événement n'a pas pu être modifié" });
    }



    // for (i = 0; i < motClefs.length; i++) {
    //     let motValeurs = [motClefs[i], projetId];
    //     motModel.insererMot(motValeurs);
    // }



  }
  // } else if (req.userProfile === 'etudiant') {

  //   res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "etudiant" });
  // } else if (req.userProfile === 'gestionnaire') {

  //   res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "gestionnaire" });
  // } else if (req.userProfile === 'aucun') {

  //   res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "Aucun" });
  // }
}

async function supprimerEvent(req, res) {
  if (req.userProfile === 'admin') {
    if (req.method === 'OPTION') {
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
  } else if (req.userProfile === 'etudiant') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "etudiant" });
  } else if (req.userProfile === 'gestionnaire') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "gestionnaire" });
  } else if (req.userProfile === 'aucun') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "Aucun" });
  }
}

module.exports = {
  voirListeEvents,
  createEvent,
  modifierEvent,
  supprimerEvent
}