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
          image,
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
          image,
          nombreMinEquipe,
          nombreMaxEquipe
        ];
  
        const valeurs_regles = [regles];
  
        try {
          const a = await eventModel.creerEvent(valeurs_event);
          if(a === 'true'){
            res.status(200).json({ message: 'ok' });

          }else{
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
  

module.exports = {
    voirListeEvents,
    createEvent
}