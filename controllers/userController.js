/**
 * Contrôleur pour la création d'utilisateurs et d'événements en tant qu'administrateur.
 * @module Contrôleur/Admin
 */

const fi = require('../public/javascripts/index/fonctions_inscription');

const passwordModel = require('../models/passwordModel');
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

      userModel.envoyer_json_liste_user()
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

    const idUser = res.locals.userId;

    /**Vérifier que l'id existe dans la bdd, sinon 404 error */
    userModel.chercherUserID(idUser)
      .then((result) => {

        if (result.length === 0) {
          res.status(404).json({ erreur: 'Erreur lors de la vérification de l\'existence de l\'utilisateur' })
        }
      })
      .catch((error) => {

      });

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

    await body('nom')
      .matches(/^[a-zA-Z]+$/)
      .isLength({ min: 3, max: 25 })
      .not().isEmpty()
      .withMessage('Le nom doit contenir uniquement des lettres et avoir une longueur comprise entre 3 et 25 caractères.')
      .run(req);

    await body('prenom')
      .matches(/^[a-zA-Z]+$/)
      .isLength({ min: 3, max: 25 })
      .not().isEmpty()
      .withMessage('Le prenom doit contenir uniquement des lettres et avoir une longueur comprise entre 3 et 25 caractères.')
      .run(req);

    await body('pseudo')
      .matches(/^[a-zA-Z0-9!&#(~)_^%?]+$/)
      .isLength({ min: 3, max: 20 })
      .custom((value) => {
        if (value.trim() !== value) {
          throw new Error('Le nom ne doit pas contenir d\'espaces entre les lettres.');
        }
        return true;
      })
      .not().isEmpty()
      .withMessage('Le nom doit contenir uniquement des lettres et avoir une longueur comprise entre 3 et 25 caractères.')
      .run(req);

    await body('password')
      .isLength({ min: 8, max: 40 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[A-Z]/)
      .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
      .matches(/[0-9]/)
      .withMessage('Le mot de passe doit contenir au moins un chiffre')
      .matches(/[!@#$%^&*]/)
      .withMessage('Le mot de passe doit contenir au moins un caractère spécial')
      .run(req);

    await body('linkedin')
      .isLength({ max: 150 })
      .optional()
      .isURL()
      .withMessage('Le lien LinkedIn n\'est pas valide')
      .run(req);

    await body('github')
      .isLength({ max: 150 })
      .optional()
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Le lien GitHub n\'est pas valide')
      .run(req);

    await body('email')
      .isLength({ max: 60 })
      .isEmail()
      .not().isEmpty()
      .withMessage('L\'adresse email n\'est pas valide')
      .run(req);

    await body('niveauEtude')
      .isIn(['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'])
      .withMessage('Le niveau d\'études n\'est pas valide')
      .run(req);

    /**Peut etre vérfier avec la liste */
    await body('ecole')
      .isLength({ max: 70 })
      .run(req);

    await body('ville')
      .isLength({ min: 3, max: 40 })
      .run(req);

    await body('entreprise')
      .isLength({ min: 2, max: 40 })
      .run(req);

    await body('metier')
      .isLength({ min: 2, max: 40 })
      .run(req);

    await body('role_asso')
      .matches(/^[a-zA-Z]+$/)
      .isLength({ min: 2, max: 40 })
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

        etudiantModel.modifierEtudiant(idUser, valeurs, valeurs_etudiant, password)
          .then(() => {
            res.status(200).json({ message: "Etudiant modifié avec succès" });
          })
          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification de l\' étudiant' });
          });

        break;

      case 'administrateur':
        adminModel.modifierAdministrateur(idUser, valeurs, password)
          .then(() => {
            res.status(200).json({ message: "Administrateur modifié avec succès" });
          })
          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification de l\'administrateur' });
          });

        break;

      case 'gestionnaireExterne':
        gestionnaireExterneModel.modifierExterne(idUser, valeurs, userMetier, userEntreprise, password)
          .then(() => {
            res.status(200).json({ message: "Gestionnaire externe modifié avec succès" });
          })
          .catch(() => {
            res.status(400).json({ erreur: 'Echec de la modification du gestionnaire externe' });
          });

        break;

      case 'gestionnaireIA':
        gestionnaireIaModel.modifierIapau(idUser, valeurs, userRole, password)
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
