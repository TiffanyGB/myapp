/**
 * Contrôleur pour la création d'utilisateurs et d'événements en tant qu'administrateur.
 * @module Contrôleur/Admin
 */

const listeUser = require('../public/javascripts/json_liste/liste_utilisateurs');
const modifier = require('../public/javascripts/modifierGestionnaires');
const userModel = require('../models/userModel');
const adminModel = require('../models/adminModel');
const etudiantModel = require('../models/etudiantModel');
const gestionnaireIaModel = require('../models/gestionnaireIaModel');
const gestionnaireExterneModel = require('../models/gestionnaireExterneModel');

const { body, validationResult } = require('express-validator');


/**Voir les users */
function voirUtilisateurs(req, res) {

  if (req.userProfile === 'admin') {
    if (req.method === 'GET') {

      listeUser.envoyer_json_liste_user()
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

    await body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[A-Z]/)
      .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
      .matches(/[0-9]/)
      .withMessage('Le mot de passe doit contenir au moins un chiffre')
      .matches(/[!@#$%^&*]/)
      .withMessage('Le mot de passe doit contenir au moins un caractère spécial')
      .run(req);

    await body('email')
      .isEmail()
      .withMessage('L\'adresse email n\'est pas valide')
      .run(req);

    await body('niveau_etude')
      .isIn(['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'])
      .withMessage('Le niveau d\'études n\'est pas valide')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

    userModel.insererUser(valeurs_communes, password, valeurs_id, type)
      .then((insertion) => {
        if (typeof insertion === 'number') {

          switch (type) {

            case 'etudiant':
              etudiantModel.creerEtudiant(userEcole, userNiveauEtude, insertion)
                .then(() => {

                  res.status(200).json({ message: 'Inscription réussie' });
                })
                .catch(() => {
                  /**Supprimer l'utilisateur */
                  userModel.supprimerUser(insertion, 'etudiant')
                  res.status(400).json({ erreur: "erreur", Détails: "Utilisateur supprimé de la table utilisateur" });
                });


              break;

            case 'administrateur':
              adminModel.creerAdmin(insertion)
                .then(() => {
                  res.status(200).json({ message: 'Inscription Admin réussie' });
                })
                .catch(() => {
                  /**Supprimer l'utilisateur */
                  userModel.supprimerUser(insertion, 'Admini')
                  res.status(400).json({ erreur: "erreur", Détails: "Utilisateur supprimé de la table utilisateur" });
                });

              break;

            case 'gestionnaireExterne':
              gestionnaireExterneModel.creerGestionnaireExterne(insertion, userEntreprise, userMetier)
                .then(() => {
                  res.status(200).json({ message: 'Inscription réussie' });
                })
                .catch(() => {
                  /**Supprimer l'utilisateur */
                  userModel.supprimerUser(insertion, 'Gestionnaire_externe')
                  res.status(400).json({ erreur: "erreur", Détails: "Utilisateur supprimé de la table utilisateur" });
                });

              break;

            case 'gestionnaireIA':
              gestionnaireIaModel.creerGestionnaireIA(insertion, userRole)
                .then(() => {
                  res.status(200).json({ message: 'Inscription réussie' });
                })
                .catch(() => {
                  /**Supprimer l'utilisateur */
                  userModel.supprimerUser(insertion, 'Gestionnaire_iapau')
                  res.status(400).json({ erreur: "erreur", Détails: "Utilisateur supprimé de la table utilisateur" });
                });

              break;

            default:
              userModel.supprimerUserID(insertion);
              res.status(400).json({ message: 'Le type est incorrect.' });

              break;
          }
        }
        else if (insertion === 'les2') {
          res.status(400).json({ Existe: 'Mail et pseudo' });

        } else if (insertion === 'pseudo') {
          res.status(400).json({ Existe: 'Pseudo' });

        } else if (insertion === 'mail') {
          res.status(400).json({ Existe: 'Mail' });

        }

      }).catch(() => {

        userModel.supprimerUserID(insertion);
        res.status(400).json({ message: 'Erreur lors de l\'insertion de l\'utilisateur.' });
      });
  }
}

/**Modification users */
async function modifierUser(req, res) {

  if (req.method == "OPTIONS") {
    res.status(200).json({ sucess: 'Agress granted' });
  }

  else if (req.method === 'GET') {
    if (req.userProfile != 'admin') {
      res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur" });
    }
  }

  else if (req.method === 'PATCH') {
    if (req.userProfile != 'admin') {
      res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur" });
    }

    const idUser = res.locals.userId;

    /**Vérifier que l'id existe dans la bdd, sinon 404 error */
    userModel.chercherUserID(idUser)
      .then((result) => {

        if (result.length === 0) {
          res.status(404).json({ erreur: 'L\'id n\'existe pas' });
        }
      });

    const {
      nom: userNom,
      prenom: userPrenom,
      pseudo: userPseudo,
      email: userMail,
      ecole: userEcole,
      linkedin,
      github,
      codeEcole: userCodeEcole,
      niveau_etude: userNiveauEtude,
      entreprise: userEntreprise,
      metier: userMetier,
      role_asso: userRole,
      password,
    } = req.body;

    const valeurs = [
      userNom,
      userPrenom,
      userPseudo,
      userMail,
      linkedin,
      github
    ]

    const valeurs_etudiant = [
      userCodeEcole,
      userEcole,
      userNiveauEtude
    ]

    /**Trouver le type de l'user */
    let type;

    await etudiantModel.chercherStudent(idUser)
      .then((result) => {

        if (result.length > 0) {
          type = 'etudiant';
        }
      });

    await gestionnaireExterneModel.chercherGestionnaireExtID(idUser)
      .then((result) => {

        if (result.length > 0) {
          type = 'gestionnaireExterne';
        }
      });

    await gestionnaireIaModel.chercherGestionnaireIapau(idUser)
      .then((result) => {

        if (result.length > 0) {
          type = 'gestionnaireIA';
        }
      });

    await adminModel.chercherAdminID(idUser)
      .then((result) => {

        if (result.length > 0) {
          type = 'admin';
        }
      });

    switch (type) {
      case 'etudiant':
        etudiantModel.modifierEtudiant(idUser, valeurs, valeurs_etudiant, password)
          .then((resultat) => {
            if (resultat === 'les2') {
              res.status(400).json({ erreur: 'Pseudo et email déjà pris' });

            } else if (resultat === 'pseudo') {
              res.status(400).json({ erreur: 'Pseudo déjà pris' });
            }
            else if (resultat === 'mail') {
              res.status(400).json({ erreur: 'Email déjà pris' });
            } else {
              res.status(200).json({ message: "Etudiant modifié avec succès" });
            }
          })
          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification de l\' étudiant' });
          });
        break;
      case 'gestionnaireExterne':
        modifier.modifierExterne(idUser, valeurs, userMetier, userEntreprise, password)
          .then((resultat) => {
            if (resultat === 'les2') {
              res.status(400).json({ erreur: 'Pseudo et email déjà pris' });

            } else if (resultat === 'pseudo') {
              res.status(400).json({ erreur: 'Pseudo déjà pris' });
            }
            else if (resultat === 'mail') {
              res.status(400).json({ erreur: 'Email déjà pris' });
            } else {
              res.status(200).json({ message: "Gestionnaire externe modifié avec succès" });
            }
          })

          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification du gestionnaire' });
          });
        break;

      case 'gestionnaireIA':
        modifier.modifierIapau(idUser, valeurs, userRole, password)
          .then((resultat) => {
            if (resultat === 'les2') {
              res.status(400).json({ erreur: 'Pseudo et email déjà pris' });

            } else if (resultat === 'pseudo') {
              res.status(400).json({ erreur: 'Pseudo déjà pris' });
            }
            else if (resultat === 'mail') {
              res.status(400).json({ erreur: 'Email déjà pris' });
            } else {
              res.status(200).json({ message: "Gestionnaire IA modifié avec succès" });
            }
          })
          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification du gestionnaire' });
          });
        break;

      case 'admin':
        userModel.modifierUser(idUser, valeurs, password)
          .then((result) => {
            if (result === 'les2') {
              res.status(400).json({ erreur: 'Pseudo et email déjà pris' });

            } else if (result === 'pseudo') {
              res.status(400).json({ erreur: 'Pseudo déjà pris' });
            }
            else if (result === 'mail') {
              res.status(400).json({ erreur: 'Email déjà pris' });
            } else {
              res.status(200).json({ message: "Administrateur modifié avec succès" });

            }
          })
          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification de l\' Administrateur' });
          });
        break;
    }
  }

}

/**Suppression */
function supprimerUser(req, res) {
  if (req.method == "OPTIONS") {
    res.status(200).json({ success: 'Access granted' });
  } else if (req.method === 'GET') {
    if (req.userProfile != 'admin') {
      res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur" });
    }
  } else if (req.method === 'DELETE') {
    const userId = res.locals.userId;

    userModel.supprimerUser(userId, 'admini')
      .then((result) => {
        if (result === 'ok')
          res.status(200).json({ message: "Suppression réussie" });
      })
      .catch(() => {
        res.status(400).json({ erreur: 'Echec de la suppression' });
      });
  }
}

module.exports = {
  createUser,
  voirUtilisateurs,
  modifierUser,
  supprimerUser
};
