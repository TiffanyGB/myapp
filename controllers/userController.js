/**
 * Contrôleur pour la gestion des utilisateurs.
 * 
 * Ce fichier contient les controllers servant à la manipulation des
 * utilisateurs.
 * 
 * @module UserController
 * @version 1.0.0 
 * @author Tiffany GAY-BELLILE
 * 
 * @requires ../public/javascripts/json_liste/liste_utilisateurs
 * @requires ../public/javascripts/modifierGestionnaires
 * @requires ../models/userModel
 * @requires ../models/adminModel
 * @requires ../models/etudiantModel
 * @requires ../models/gestionnaireIaModel
 * @requires ../models/gestionnaireExterneModel
 * @requires express-validator
 * 
 */

const listeUser = require('../public/javascripts/json_liste/liste_utilisateurs');
const modifier = require('../public/javascripts/modifierGestionnaires');
const userModel = require('../models/userModel');
const adminModel = require('../models/adminModel');
const etudiantModel = require('../models/etudiantModel');
const gestionnaireIaModel = require('../models/gestionnaireIaModel');
const gestionnaireExterneModel = require('../models/gestionnaireExterneModel');
const { body, validationResult } = require('express-validator');


/**
 * Récupère la liste des utilisateurs et renvoie un JSON contenant les informations des utilisateurs,
 * si le profil est 'administrateur'.
 * 
 * @param {Object} req - L'objet de requête HTTP.
 * @param {Object} res - L'objet de réponse HTTP.
 * @returns {Promise} Une promesse résolue avec les informations des utilisateurs au format JSON.
 * @throws {Error} Une erreur si la récupération des utilisateurs échoue ou si le profil de l'utilisateur n'est pas valide.
 * 
 * @memberof module:Contrôleur/Admin
 */
function voirUtilisateurs(req, res) {

  /*Récupérer la liste des utilisateurs formatée au format json*/
  listeUser.envoyer_json_liste_user()
    .then((result) => {

      /**Erreur lors de la récupération d'un utilisateur */
      if (result === "erreur_user") {
        res.status(400).json({ erreur: "Erreur lors de la récupération des données côté étudiant" })

      } else {
        /**Renvoyer la liste au client */
        res.status(200).json(result);
      }
    })
    .catch((error) => {
      res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des utilisateurs.' });

    });
}

/**
 * Créer un utilisateur.
 *
 * @route POST /users
 * @group Users - Opérations liées aux utilisateurs
 * @returns {object} 200 - Un tableau contenant tous les utilisateurs.
 * @returns {Error}  500 - Erreur serveur.
 */
async function createUser(req, res) {
  if (req.method == "OPTIONS") {
    res.status(200).json({ sucess: 'Agress granted' });
  } else if (req.method === 'POST') {


    /* Récupération des données */
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

    /* Validations des données selon le type d'utilisateur */
    switch (type) {
      case 'etudiant':
        await etudiantModel.validerEtudiant(req);
        break;
      case 'gestionnaireExterne':
        await gestionnaireExterneModel.validerGestionnaireExterne(req);
        break;
      case 'gestionnaireIA':
        await gestionnaireIaModel.validerGestionnaireIA(req);
        break;
      case 'administrateur':
        break;
      default:
        return res.status(400).json({ erreur: "Le type est incorrect" });
    }

    /**Exécute la requete de validation adapté */
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    /**Insertion dans la table user */
    userModel.insererUser(valeurs_communes, password, valeurs_id, type)
      .then((insertion) => {
        /**Insertion doit contenir l'id de l'utilisateur */
        if (typeof insertion === 'number') {

          /**On insère les infos supplémentaires dans la table appropriée au type*/
          switch (type) {
            case 'etudiant':

              etudiantModel.creerEtudiant(userEcole, userNiveauEtude, insertion)
                .then(() => {

                  res.status(200).json({ message: 'Inscription réussie' });
                })
                .catch(() => {
                  /**Supprimer l'utilisateur dans la table utilisateur s'il y a un souci */
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
                  /**Supprimer l'utilisateur dans la table utilisateur s'il y a un souci */
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
                  /**Supprimer l'utilisateur dans la table utilisateur s'il y a un souci */
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
                  /**Supprimer l'utilisateur dans la table utilisateur s'il y a un souci */
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

        /**Pseudo et/ou email déjà pris */
        else if (insertion === 'les2') {
          res.status(400).json({ Existe: 'Mail et pseudo' });

        } else if (insertion === 'pseudo') {
          res.status(400).json({ Existe: 'Pseudo' });

        } else if (insertion === 'mail') {
          res.status(400).json({ Existe: 'Mail' });

        }

      }).catch(() => {
        res.status(400).json({ message: 'Erreur lors de l\'insertion de l\'utilisateur.' });
      });
  }
}

/**Modification users */
async function modifierUser(req, res) {

  if (req.method == "OPTIONS") {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'PATCH') {

    /*Si n'est pa admin, vérifier si l'id de l'url est la même que l'utilisteur qui veut modifier */
    const idUser = res.locals.userId;
    const idToken = req.id;
    const profil = req.userProfile;

    if(profil != 'admin' && idUser === idToken){
      console.log('ok')
      // return res.status(404).json({ erreur: 'Il faut être administrateur pour modifier un autre compte que le sien.' });
    }

    /**Vérifier que l'id existe dans la bdd, sinon 404 error */
    userModel.chercherUserID(idUser)
      .then((result) => {

        if (result.length === 0) {
          return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
        }
      });

    /**Récupération des données */
    const {
      nom: userNom,
      prenom: userPrenom,
      pseudo: userPseudo,
      email: userMail,
      ecole: userEcole,
      linkedin,
      github,
      ville,
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
      github,
      ville
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

    /* Vérification des données selon le type */
    switch (type) {
      case 'etudiant':
        await etudiantModel.validerEtudiant(req);
        break;
      case 'gestionnaireExterne':
        await gestionnaireExterneModel.validerGestionnaireExterne(req);
        break;
      case 'gestionnaireIA':
        await gestionnaireIaModel.validerGestionnaireIA(req);
        break;
      case 'administrateur':
        break;
      default:
        return res.status(400).json({ erreur: "Le type est incorrect" });
    }

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    /* Modification etudiant */
    switch (type) {
      case 'etudiant':
        etudiantModel.modifierEtudiant(idUser, valeurs, valeurs_etudiant, password)
          .then((resultat) => {
            /* Données existantes */
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
            /* Données existantes */
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
            /* Données existantes */
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
            /* Données existantes */
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
async function supprimerUser(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).json({ success: 'Access granted' });

  } else if (req.method === 'DELETE') {

    /**Récupérer l'id de l'utilisateur dans l'url */
    const userId = res.locals.userId;

    try {
      /*Vérifier que l'id existe dans la bdd*/
      const user = await userModel.chercherUserID(userId);
      if (user.length === 0) {
        return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
      }

      /*Supprimer l'utilisateur*/
      const result = await userModel.supprimerUser(userId, 'admini');

      if (result === 'ok') {
        return res.status(200).json({ message: "Suppression réussie" });
      }

      return res.status(400).json({ erreur: 'Echec de la suppression' });

    } catch (error) {
      return res.status(500).json({ erreur: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  }
}

module.exports = {
  createUser,
  voirUtilisateurs,
  modifierUser,
  supprimerUser
};
