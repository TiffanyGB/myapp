// /**
//  * Contrôleur pour gérer les pages sans nécessité de compte.
//  * @controller Index
//  */

const passwordModel = require('../models/passwordModel');
const eventModel = require('../models/eventModel');
const userModel = require('../models/userModel');
const etudiantModel = require('../models/etudiantModel');

const { body, validationResult } = require('express-validator');
const fi = require('../public/javascripts/index/fonctions_inscription');
const pool = require('../database/configDB');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};
const secretKey = generateSecretKey();

// Middleware de vérification du token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.userProfile = 'aucun';
    return next();
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide ou expiré.' });
    }

    if (decoded.utilisateurType === 'administrateur') {

      req.userProfile = 'admin';

    } else if (decoded.utilisateurType === 'etudiant') {

      req.userProfile = 'etudiant';

    } else if ((decoded.utilisateurType === 'gestionnaireIA') || (decoded.utilisateurType === 'gestionnaireExterne')) {
      console.log(decoded.utilisateurType);
      req.userProfile = 'gestionnaire';
    }
    req.decodedToken = decoded;

    next();
  });
}

/**
 * Inscription d'un élève.
 * @route POST /utilisateurs/connexion
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @returns {object} La réponse JSON indiquant le succès ou l'échec de l'inscription.
 * @throws {Error} Si le cryptage du mot de passe a échoué.
 * @throws {Error}Si l'étudiant n'a pas pu être inséré (table étudiant).
 * @throws {Error}Si l'insertion de l'utilisateur a échoué (table Utilisateur).
 * @throws {Error}Si un pseudo ou un email identique existe.
 * @description Cette fonction permet à un utilisateur de se créer un compte étudiant.
 * @headers
 *    {string} Authorization - Token d'authentification JWT.
 */

async function inscriptionEleve(req, res) {
  if (req.method === 'POST') {

    /**Données du formulaire d'inscription */
    const {
      nom: userNom,
      prenom: userPrenom,
      pseudo: userPseudo,
      email: userMail,
      linkedin: userLinkedin,
      github: userGitHub,
      ville: userVille,
      ecole: userEcole,
      niveauEtude: userNiveauEtude,
      password
    } = req.body;

    /** Informations spécifique à un utilisateur */
    const values = [
      userNom,
      userPrenom,
      userPseudo,
      userMail,
      userLinkedin,
      userGitHub,
      userVille,
    ];

    /** Pour retrouver l'id de l'utilisateur inséré, pour inséré un etudiant du même id */
    const values_id = [
      userPseudo,
      userMail,
    ];

    userModel.insererUser(values, password, values_id, 'etudiant')
      .then((insertion) => {
        if (typeof insertion === 'number') {
          etudiantModel.creerEtudiant(userEcole, userNiveauEtude, insertion)
            .then(() => {

              /**  Informations à insérer dans le token */
              const payload = {
                "utilisateurId": insertion,
                "utilisateurType": 'etudiant'
              };

              /**  Générer le JWT */
              const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });

              res.status(200).json({ token: token, id: insertion, prenom: userPrenom, nom: userNom, pseudo: userPseudo, role: 'etudiant' });
            })
            .catch(() => {
              /**Supprimer l'utilisateur */
              userModel.supprimerUser(insertion, 'etudiant')
              res.status(400).json({ erreur: "erreur", Détails: "Utilisateur supprimé de la table utilisateur" });
            });

        } else if (insertion === 'les2') {
          res.status(400).json({ Existe: 'Mail et pseudo' });

        } else if (insertion === 'pseudo') {
          res.status(400).json({ Existe: 'Pseudo' });

        } else if (insertion === 'mail') {
          res.status(400).json({ Existe: 'Mail' });

        }
      })
      .catch((error) => {
        console.error('Erreur lors de l\'insertion de l\'utilisateur:', error);
        res.status(400).json({ message: 'Erreur lors de l\'insertion de l\'utilisateur.' });
      });

  }
}

/**
 * Connexion d'un utilisateur.
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @returns {object} Un JSON contenant le token généré, les informations de l'utilisateur suivantes:
 * id, nom, prénom, pseudo, rôle (Etudiant, gestionnaire externe, gestionnaire IA Pau, administrateur)
 * @throws {Error}Erreur lors de la requete qui recherche un utilisateur ayant le même identifiant.
 * @description Cette fonction permet à un utilisateur de se connecter à son compte avec un login/email et un mot de passe.
 * @headers
 *    {string} Authorization - Token d'authentification JWT.
 */
async function connexion(req, res) {
  if (req.method === 'POST') {

    const identifiant = req.body.identifiant;
    const password = req.body.password;

    await body('identifiant')
      .matches(/^[a-zA-Z0-9!&#(~)_^%?]+$/)
      .isLength({ min: 3, max: 60 })
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
      .not().isEmpty()
      .matches(/[A-Z]/)
      .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
      .matches(/[0-9]/)
      .withMessage('Le mot de passe doit contenir au moins un chiffre')
      .matches(/[!@#$%^&*]/)
      .withMessage('Le mot de passe doit contenir au moins un caractère spécial')
      .run(req);


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const requeteChercher = `SELECT * FROM Utilisateur WHERE (email='${identifiant}') OR (pseudo='${identifiant}')`;

    try {
      const result = await pool.query(requeteChercher);

      /** Aucun email ou pseudo ne correspond*/
      if (result.rowCount === 0) {
        res.status(400).json({ champ: 'login', message: 'Aucun email/login ne correspond' });
      } else {
        const user = result.rows[0];
        const match = await passwordModel.comparerMdp(password, user.hashmdp);

        if (match) {

          /**  Informations à insérer dans le token */
          const payload = {
            "utilisateurId": user.iduser,
            "utilisateurType": user.typeuser
          };

          /**  Générer le JWT */
          const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });

          res.status(200).json({ token: token, id: user.iduser, prenom: user.prenom, nom: user.nom, pseudo: user.pseudo, role: user.typeuser });
        } else {
          res.status(400).json({ champ: 'mot de passe', message: 'Le mot de passe est incorrect' });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête:', error);
      res.status(400).json('Erreur lors de l\'exécution de la requête');
    }
  }
}

/**
 * Voir un événement spécifique.
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @returns {object} Un JSON contenant les informations de l'événement nécessaires pour l'affichage
 * @throws {Error}Erreur lors de la récupération des informations de l'événement.
 * @description Cette fonction permet à un utilisateur voir les informations d'un événement selon son statut ie 
 * gestionnaire (IA ou externe), administrateur, étudiant, non connecté.
 * Informations en plus pour un étudiant: Numéro équipe (si existe).
 * Informations en moins pour un non connecté: Ressources privées d'un projet.
 */
function voirEvent(req, res) {
  if (req.method === 'GET') {

    const eventID = res.locals.eventID;
    /**Si c'est un admin, afficher les infos de l'admin */
    if (req.userProfile === 'admin' || req.userProfile === 'gestionnaire') {

      eventModel.jsonEventChoisi(eventID, 'admin')
        .then((result) => {
          res.status(200).json(result);
        })

        .catch((error) => {
          console.error('Une erreur s\'est produite :', error);
          res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération de l\'événement.' });
        });
    }
    /**Si c'est un etudiant, afficher les infos de l'etudiant en plus, (equipe) */
    else if (req.userProfile === 'etudiant') {
      eventModel.jsonEventChoisi(eventID, 'etudiant')
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((error) => {
          res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération de l\'événement.' });
        });
    }
    /**Si non connecté ne pas envoyer les infos des ressources privées */
    else if (req.userProfile === 'aucun') {
      console.log('non connecté');
      eventModel.jsonEventChoisi(eventID, 'aucun')
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((error) => {
          console.error('Une erreur s\'est produite :', error);
          res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération de l\'événement.' });
        });
    }
  }
}

/**
 * Voir la liste des événements (anciens et actuels).
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @returns {object} Un JSON contenant les informations des événements ie:
 * Titre, image, date début, fin, statut(en cours, inscription, fini), gain.
 * @throws {Error}Erreur lors de la requete qui récupère tous les événements de la bdd.
 * @description Cette fonction permet d'envoyer au client les informations à afficher pour tous les événements.
 */
function voirTousEvents(req, res) {
  if (req.method === 'GET') {
    eventModel.creerJsonTousEvents()
      .then((result) => {
        if (result === false) {
          res.status(400).json({ message: 'Aucun événement' });
        } else {
          res.status(200).json(result);
        }
      })
      .catch((error) => {
        console.error('Une erreur s\'est produite :', error);
        res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des événements.' });
      });
  }
}

module.exports = {
  inscriptionEleve,
  connexion,
  voirEvent,
  voirTousEvents,
  verifyToken
};
