const fi = require('../public/javascripts/index/fonctions_inscription');
const cu = require('../public/javascripts/admin/gestionUsers/creerUser');
const listeEvent = require('../public/javascripts/admin/gestionEvenements/voirListeEvents');
const modif = require('../public/javascripts/admin/gestionUsers/modifierUtilisateurs');
const { body, validationResult } = require('express-validator');


function voirListeEvents(req, res) {

    if (req.userProfile === 'admin') {
        if (req.method === 'OPTION') {
            res.status(200).json({ sucess: 'Agress granted' });
        }
        else if (req.method === 'GET') {


            listeEvent.listeProjetsJson()
                .then((result) => {
                    if (result === 'aucun') {
                        res.status(400).json({ erreur: "Erreur lors de la récupération des utilisateurs" })
                    } else if (result === "erreur_student") {
                        res.status(400).json({ erreur: "Erreur lors de la récupération des données côté étudiant" })
                    } else {
                        res.status(200).json(result);
                    }
                })

            // lu.envoyer_json_liste_user()
            //     .then((result) => {
            //         if (result === 'aucun') {
            //             res.status(400).json({ erreur: "Erreur lors de la récupération des utilisateurs" })
            //         } else if (result === "erreur_student") {
            //             res.status(400).json({ erreur: "Erreur lors de la récupération des données côté étudiant" })
            //         } else {
            //             res.status(200).json(result);
            //         }
            //     })
            //     .catch((error) => {
            //         console.log(error);
            //         res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des utilisateurs.' });

            //     });

        }
    } else if (req.userProfile === 'etudiant') {

        res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "etudiant" });
    } else if (req.userProfile === 'gestionnaire') {

        res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "gestionnaire" });
    } else if (req.userProfile === 'aucun') {

        res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "Aucun" });
    }
}



// function createEvent(req, res) {
//   if (req.method === 'GET') {
//     res.render('admin/creerEvent', { title: 'Créer Event' });
//   } else if (req.method === 'POST') {

//     const {
//       typeEvent,
//       nomEvent,
//       dateInscription,
//       dateDebut,
//       dateFin,
//       dateResultat,
//       regles,
//       nbEquipeMin,
//       nbEquipeMax,
//       imageEvent,

//     } = req.body;

//     const valeurs_event = [
//       typeEvent,
//       nomEvent,
//       dateInscription,
//       dateDebut,
//       dateFin,
//       dateResultat,
//       regles,
//       nbEquipeMin,
//       nbEquipeMax,
//       imageEvent
//     ]

//     const { projet, ressources } = req.body;

//     // Traiter les données et les enregistrer dans la base de données

//     // Exemple : afficher les tableaux dans la console
//     console.log('Tableau des projets :', projet);
//     console.log('Tableau des ressources :', ressources);
//     console.log('Tableau des events: ', valeurs_event);


//     // try{
//     //   ce.creerEvent(nomEvent);
//     //   //res.status(200).json({message:'Carré'});
//     // }
//     // catch{
//     //   console.log('Erreur dans la création d\'un event');
//     //   //es.status(400).json({message:'Erreur lors de la création d\'un event'});
//     // }

//     //   // .then(()=> {
//     //   //   res.status(200).json({message:'Carré'});

//     //   // })
//     //   // .catch((err)=> {
//     //   //   console.log('Erreur dans la création d\'un event');
//     //   //   res.status(400).json({message:'Erreur lors de la création d\'un event'});

//     //   // })
//   }
// }

module.exports = {
    voirListeEvents
}