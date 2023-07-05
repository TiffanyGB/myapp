/**
 * Contrôleur pour la création d'utilisateurs et d'événements en tant qu'administrateur.
 * @module Contrôleur/Admin
 */

const fi = require('../public/javascripts/index/fonctions_inscription');
const cu = require('../public/javascripts/admin/gestionUsers/creerUser');
const ce = require('../public/javascripts/admin/gestionEvenements/creerEvent');
const fmdp = require('../public/javascripts/index/fonctions_mdp');
const lu = require('../public/javascripts/admin/gestionUsers/voirListeUsers');
const modif = require('../public/javascripts/admin/gestionUsers/modifierUtilisateurs');

/**Voir les users */
function voirUtilisateurs(req, res) {

  if (req.userProfile === 'admin') {
    if (req.method === 'GET') {

      lu.envoyer_json_liste_user()
        .then((result) => {
          if (result === 'aucun') {
            res.status(400).json({ erreur: "Erreur lors de la récupération des utilisateurs" })
          } else if (result === "erreur_student") {
            res.status(400).json({ erreur: "Erreur lors de la récupération des données côté étudiant" })
          } else {
            res.status(200).json(result);
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des utilisateurs.' });

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

/**Création users */
async function createUser(req, res) {
  if (req.method == "OPTIONS") {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {
    if (req.userProfile != 'admin') {
      res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur" });
    }

  } else if (req.method === 'POST') {

    const {
      type: type,
      nom: userNom,
      prenom: userPrenom,
      pseudo: userPseudo,
      email: userMail,
      linkedin: userLinkedin,
      github: userGitHub,
      ville: userVille,
      ecole: userEcole,
      codeEcole: userCodeEcole,
      niveau_etude: userNiveauEtude,
      password,
      entreprise: userEntreprise,
      metier: userMetier,
      role_asso: userRole
    } = req.body;

    const valeurs_communes = [
      userNom,
      userPrenom,
      userPseudo,
      userMail,
      userLinkedin,
      userGitHub,
      userVille,
    ]

    const valeurs_id = [
      userPseudo,
      userMail
    ]

    const valeurs_etudiant = [
      userEcole,
      userCodeEcole,
      userNiveauEtude
    ]

    switch (type) {
      case 'administrateur':
        cu.creerAdmin(valeurs_communes, valeurs_id)
          .then((result) => {
            if (result === 'true') {
              fmdp.salageMdp(password)
                .then((hashedPassword) => {
                  console.log('Mot de passe crypté avec succès');
                  fi.insererMdp(hashedPassword, userPseudo);
                  res.status(200).json({ message: 'Inscription réussie' });
                })
                .catch((error) => {
                  console.error('Erreur lors du salage du mot de passe (Création admin)', error);
                  res.status(400).json({ message: 'Erreur lors du salage du mot de passe (Création admin)' });
                });
            } else if (result === 'les2') {
              console.error('Pseudo et email pris');
              res.status(400).json({ message: 'Pseudo et email pris' });
            } else if (result === 'pseudo') {

              console.error('Pseudo pris');
              res.status(400).json({ message: 'Pseudo pris' });
            } else if (result === 'mail') {

              console.error('Email pris');
              res.status(400).json({ message: 'Email pris' });

            } else {
              console.error('Erreur lors de la création de l\'admin');
              res.status(400).json({ message: 'Erreur lors de la création de l\'admin' });
            }

          });

        break;

      case 'etudiant':
        cu.creerEtudiant(valeurs_communes, valeurs_id, userEcole, userCodeEcole, userNiveauEtude)
          .then((result) => {
            if (result === 'true') {
              fmdp.salageMdp(password)
                .then((hashedPassword) => {
                  console.log('Mot de passe crypté avec succès');
                  fi.insererMdp(hashedPassword, userPseudo);
                  res.status(200).json({ message: 'Inscription réussie' });
                })
                .catch((error) => {
                  console.error('Erreur lors du salage du mot de passe (Création admin)', error);
                  res.status(400).json({ message: 'Erreur lors du salage du mot de passe (Création admin)' });
                });
            } else if (result === 'les2') {
              console.error('Pseudo et email pris');
              res.status(400).json({ message: 'Pseudo et email pris' });
            } else if (result === 'pseudo') {

              console.error('Pseudo pris');
              res.status(400).json({ message: 'Pseudo pris' });
            } else if (result === 'mail') {

              console.error('Email pris');
              res.status(400).json({ message: 'Email pris' });

            } else {
              console.error('Erreur lors de la création de l\'admin');
              res.status(400).json({ message: 'Erreur lors de la création de l\'admin' });
            }

          });

        break;

      case 'gestionnaire_iapau':
        cu.creerGestionnaireIA(valeurs_communes, valeurs_id, userRole)
          .then((result) => {
            if (result === 'true') {
              fmdp.salageMdp(password)
                .then((hashedPassword) => {
                  console.log('Mot de passe crypté avec succès');
                  fi.insererMdp(hashedPassword, userPseudo);
                  res.status(200).json({ message: 'Inscription réussie' });
                })
                .catch((error) => {
                  console.error('Erreur lors du salage du mot de passe (Création admin)', error);
                  res.status(400).json({ message: 'Erreur lors du salage du mot de passe (Création admin)' });
                });
            } else if (result === 'les2') {
              console.error('Pseudo et email pris');
              res.status(400).json({ message: 'Pseudo et email pris' });
            } else if (result === 'pseudo') {

              console.error('Pseudo pris');
              res.status(400).json({ message: 'Pseudo pris' });
            } else if (result === 'mail') {

              console.error('Email pris');
              res.status(400).json({ message: 'Email pris' });

            } else {
              console.error('Erreur lors de la création de l\'admin');
              res.status(400).json({ message: 'Erreur lors de la création de l\'admin' });
            }

          });

        break;

      case 'gestionnaire_externe':
        cu.creerGestionnaireExterne(valeurs_communes, valeurs_id, userEntreprise, userMetier)
          .then((result) => {
            if (result === 'true') {
              fmdp.salageMdp(password)
                .then((hashedPassword) => {
                  console.log('Mot de passe crypté avec succès');
                  fi.insererMdp(hashedPassword, userPseudo);
                  res.status(200).json({ message: 'Inscription réussie' });
                })
                .catch((error) => {
                  console.error('Erreur lors du salage du mot de passe (Création admin)', error);
                  res.status(400).json({ message: 'Erreur lors du salage du mot de passe (Création admin)' });
                });
            } else if (result === 'les2') {
              console.error('Pseudo et email pris');
              res.status(400).json({ message: 'Pseudo et email pris' });
            } else if (result === 'pseudo') {

              console.error('Pseudo pris');
              res.status(400).json({ message: 'Pseudo pris' });
            } else if (result === 'mail') {

              console.error('Email pris');
              res.status(400).json({ message: 'Email pris' });

            } else {
              console.error('Erreur lors de la création de l\'admin');
              res.status(400).json({ message: 'Erreur lors de la création de l\'admin' });
            }

          });

      default:
        break;
    }
  }
}

/**Modification users */
function modifierUser(req, res) {

  if (req.method == "OPTIONS") {
    res.status(200).json({ sucess: 'Agress granted' });
  }

  else if (req.method === 'GET') {
    if (req.userProfile != 'admin') {
      res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur" });
    }
  }

  else if (req.method === 'PATCH') {

    const idUser = res.locals.userId;

    const {
      type: type,
      nom: userNom,
      prenom: userPrenom,
      pseudo: userPseudo,
      email: userMail,
      ecole: userEcole,
      codeEcole: userCodeEcole,
      niveau_etude: userNiveauEtude,
      entreprise: userEntreprise,
      metier: userMetier,
      role_asso: userRole,
      password,
    } = req.body;

    const valeurs = [
      type,
      userNom,
      userPrenom,
      userPseudo,
      userMail
    ]

    const valeurs_etudiant = [
      userCodeEcole,
      userEcole,
      userNiveauEtude
    ]

    switch (type) {
      case 'etudiant':

        modif.modifierEtudiant(idUser, valeurs, valeurs_etudiant)
          .then(() => {
            res.status(200).json({ message: "Etudiant modifié avec succès" });
          })
          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification de l\' étudiant' });
          });

        break;

      case 'administrateur':
        modif.modifierAdministrateur(idUser, valeurs)
          .then(() => {
            res.status(200).json({ message: "Administrateur modifié avec succès" });
          })
          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification de l\'administrateur' });
          });

        break;

      case 'gestionnaire_externe':
        modif.modifierExterne(idUser, valeurs, userMetier, userEntreprise)
          .then(() => {
            res.status(200).json({ message: "Gestionnaire externe modifié avec succès" });
          })
          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification du gestionnaire externe' });
          });

        break;
        
      case 'gestionnaire_iapau':
        modif.modifierIapau(idUser, valeurs, userRole)
          .then(() => {
            res.status(200).json({ message: "Gestionnaire iapau modifié avec succès" });
          })
          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification du gestionnaire iapau' });
          });

        break;
    }
  }
}


function supprimerUser(req, res) {
  if (req.method == "OPTIONS") {
    res.status(200).json({ success: 'Access granted' });
  } else if (req.method === 'GET') {
    if (req.userProfile != 'admin') {
      res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur" });
    }
  } else if (req.method === 'DELETE') {
    const userId = res.locals.userId;

    modif.supprimerUser(userId, 'admini')
      .then((result) => {
        if (result === 'ok')
          res.status(200).json({ message: "Suppression réussie" });
      })
      .catch(() => {
        res.status(400).json({ erreur: 'Echec de la suppression' });
      });
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
  createUser,
  // createEvent,
  voirUtilisateurs,
  modifierUser,
  supprimerUser
};
