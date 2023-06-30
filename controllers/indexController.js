const fi = require('../public/javascripts/index/fonctions_inscription');
const fmdp = require('../public/javascripts/index/fonctions_mdp');
const re = require('../public/javascripts/index/recuperer_event');
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

      console.log("admin");
      req.userProfile = 'admin';

    } else if (decoded.utilisateurType === 'etudiant') {

      console.log("etudiant");
      req.userProfile = 'etudiant';

    } else if ((decoded.utilisateurType === 'gestionnaireIA') || (decoded.utilisateurType === 'gestionnaireExterne')){
      console.log(decoded.utilisateurType);
      req.userProfile = 'gestionnaire';
    }
      req.decodedToken = decoded;

    next();
  });
}

function inscriptionEleve(req, res) {
  if (req.method === 'GET') {
    res.render('inscription', { title: 'Inscription' });
  } else if (req.method === 'POST') {

    /**Données du formulaire */
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

    /**A insérer dans la bdd */
    const values = [
      userNom,
      userPrenom,
      userPseudo,
      userMail,
      userLinkedin,
      userGitHub,
      userVille,
    ];

    const values_id = [
      userPseudo,
      userMail,
    ];

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

async function connexion(req, res) {

  if (req.method === 'GET') {
    res.render('connexion', { title: 'Connexion' });
  } else if (req.method === 'POST') {

    const identifiant = req.body.identifiant;
    const password = req.body.password;
    const requeteChercher = `SELECT * FROM Utilisateur WHERE (email='${identifiant}') OR (pseudo='${identifiant}')`;

    try {
      const result = await pool.query(requeteChercher);

      // Aucun email ou login ne correspond
      if (result.rowCount === 0) {
        res.status(400).json({ champ: 'login', message: 'Aucun email/login ne correspond' });
      } else {
        const user = result.rows[0];
        const match = await fmdp.comparerMdp(password, user.hashmdp);

        if (match) {

          /**  Générer le JWT */
          const payload = {
            "utilisateurId": user.iduser,
            "utilisateurType": user.typeuser
          };

          /**  Générer le JWT */
          const token = jwt.sign(payload, secretKey, { expiresIn: '50d' });

          res.status(200).json({ token: token, id: user.iduser, prenom: user.prenom, nom: user.nom, pseudo: user.pseudo, role: user.typeuser }); // Envoyer le JWT dans la réponse JSON
          // res.set('Authorization', `Bearer ${token}`);

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

function voirEvent(req, res) {
  if (req.method === 'GET') {

    /**Si c'est un admin, afficher les infos de l'admin */
    if (req.userProfile === 'admin' || req.userProfile === 'gestionnaire') {
      console.log('admin');

      re.recupererEvent(1, 'admin')
        .then((result) => {
          res.status(200).json(result);
        })

        .catch((error) => {
          console.error('Une erreur s\'est produite :', error);
          res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des événements.' });
        });
    }
    /**Si c'est un etudiant, afficher les infos de l'etudiant en plus, (equipe) */
    else if (req.userProfile === 'etudiant') {
      console.log('Etudiant');
      re.recupererEvent(1, 'etudiant')
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((error) => {
          console.error('Une erreur s\'est produite :', error);
          res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des événements.' });
        });
    }
    /**Si non connecté ne pas envoyer les infos des ressources privées */
    else if (req.userProfile === 'aucun') {
      console.log('non connecté');
      re.recupererEvent(1, 'aucun')
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((error) => {
          console.error('Une erreur s\'est produite :', error);
          res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des événements.' });
        });
    }

  }

}

module.exports = {
  inscriptionEleve,
  connexion,
  voirEvent,
  verifyToken
};
