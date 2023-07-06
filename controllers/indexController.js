// /**
//  * Contrôleur pour gérer les pages sans nécessité de compte.
//  * @controller Index
//  */

// /**
//  * Module de fonctions pour la gestion des mots de passe.
//  * @module fonctions_mdp
//  */
const fmdp = require('../public/javascripts/index/fonctions_mdp');

// /**
//  * Module de fonctions pour l'inscription des utilisateurs.
//  * @module fonctions_inscription
//  */
const fi = require('../public/javascripts/index/fonctions_inscription');

// /**
//  * Module de fonctions pour la récupération d'un événement choisi.
//  * @module recuperer_event_choisi
//  */
const re = require('../public/javascripts/index/recuperer_event_choisi');
// /**
//  * Module de fonctions pour la récupération de la liste des événements.
//  * @module recuperer_liste_events
//  */
const la = require('../public/javascripts/index/recuperer_liste_events');
// /**
//  * Module de configuration pour la base de données.
//  * @module configDB
//  */
const pool = require('../database/configDB');

// /**
//  * Module pour la manipulation des fonctions de chiffrement.
//  * @module crypto
//  */
const crypto = require('crypto');

// /**
//  * Module pour la gestion des JSON Web Tokens (JWT).
//  * @module jsonwebtoken
//  */
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

function inscriptionEleve(req, res) {
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
      codeEcole: userCodeEcole,
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

    /** Informations spécifiques à un étudiant */
    const values_etudiant = [
      userEcole,
      userNiveauEtude,
      userCodeEcole
    ];

    /** Insérer utilisateur et mdp dans la bdd */
    fi.insererUser(values, values_id, 'etudiant')
      .then((inserer) => {
        /**L'insertion dans la bdd a réussi, on passe au mdp */
        if (inserer === "true") {
          console.log('Données insérées avec succès dans la table utilisateur');
          fmdp.salageMdp(password)

            .then((hashedPassword) => {
              console.log('Mot de passe crypté avec succès');
              fi.insererMdp(hashedPassword, userPseudo);

            })
            .catch((error) => {
              console.error('Erreur lors du salage du mot de passe:', error);
              res.status(400).json({ message: 'Erreur lors du salage du mot de passe:' });

            });

          fi.insererEtudiant(values_etudiant, userPseudo)
            .then(() => {
              console.log('Etudiant inséré');
            })
            .catch((error) => {
              console.error('Erreur Inscription etudiant', error);
              res.status(400).json({ message: 'Erreur Inscription etudiant' });
            });

          console.log('Inscription finie');
          res.status(200).json({ pseudo: userPseudo, nom: userNom, prenom: userPrenom, message: 'Inscription réussie' });
        }
        else if (inserer === "pseudo") {
          console.log('Utilisateur existant avec le même pseudo');
          res.status(400).json({ champ: 'Pseudo', message: 'Pseudo existant' });
        } else if (inserer === "mail") {
          console.log('Utilisateur existant avec le même mail');
          res.status(400).json({ champ: 'email', message: 'Adresse mail existante' });
        } else if (inserer === "les2") {
          console.log('Utilisateur existant avec le même mail et pseudo');
          res.status(400).json({ champ1: 'pseudo', champ2: 'email', message: 'Adresse mail et pseudo existants' });
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
    const requeteChercher = `SELECT * FROM Utilisateur WHERE (email='${identifiant}') OR (pseudo='${identifiant}')`;

    try {
      const result = await pool.query(requeteChercher);

      /** Aucun email ou pseudo ne correspond*/
      if (result.rowCount === 0) {
        res.status(400).json({ champ: 'login', message: 'Aucun email/login ne correspond' });
      } else {
        const user = result.rows[0];
        const match = await fmdp.comparerMdp(password, user.hashmdp);

        if (match) {

          /**  Informations à insérer dans le token */
          const payload = {
            "utilisateurId": user.iduser,
            "utilisateurType": user.typeuser
          };

          /**  Générer le JWT */
          const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
          // const token = tk.creerToken(payload);

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

      re.recupererEvent(eventID, 'admin')
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
      console.log('Etudiant');
      re.recupererEvent(eventID, 'etudiant')
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((error) => {
          console.error('Une erreur s\'est produite :', error);
          res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération de l\'événement.' });
        });
    }
    /**Si non connecté ne pas envoyer les infos des ressources privées */
    else if (req.userProfile === 'aucun') {
      console.log('non connecté');
      re.recupererEvent(eventID, 'aucun')
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
    la.creerJsonEvent()
      .then((result) => {
        if(result === false){
          res.status(400).json({message: 'Aucun événement'});
        }else{
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
