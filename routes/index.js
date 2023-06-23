var express = require('express');
var router = express.Router();
const pool = require('../database/configDB');
const fc = require('../public/javascripts/fonctions_inscription');
const fmdp = require('../public/javascripts/fonctions_mdp');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { error } = require('console');


const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};
const secretKey = generateSecretKey();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Accueil' });
});

/** Inscription */
router.all('/inscription', function(req, res) {
  if (req.method === 'GET') {
    res.render('inscription', { title: 'Inscription' });
  } else if (req.method === 'POST') {

    /**Données du formulaire */
    const userNom = req.body.nom;
    const userPrenom = req.body.prenom;
    const userPseudo = req.body.pseudo;
    const userMail = req.body.email;
    const userLinkedin = req.body.linkedin;
    const userGitHub = req.body.github;
    const userVille = req.body.ville;
    const userEcole = req.body.ecole;
    const userCodeEcole = req.body.codeEcole;
    const userNiveauEtude = req.body.niveau_etude;
    const password = req.body.password;

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

    const values2 = [
      userPseudo,
      userMail,
    ];

    const values3 = [
      userEcole,
      userNiveauEtude,
      userCodeEcole
    ];

    /** Insérer utilisateur et mdp dans la bdd */
    fc.insererUser(values, values2)
    .then((inserer) => {
      /**L'insertion dans la bdd a réussi, on passe au mdp */
      if (inserer === true) {
        fmdp.salageMdp(password)

          .then((hashedPassword) => {
            console.log('Mot de passe crypté avec succès');
            fc.insererMdp(hashedPassword, userPseudo);

          })
          .catch((error) => {
            console.error('Erreur lors du salage du mot de passe:', error);
            res.status(400).json({message:'Erreur lors du salage du mot de passe:'});

          });

          fc.insererEtudiant(values3, userPseudo)
          .then(() => {
            console.log('Etudiant inséré');
          })
          .catch((error) => {
            console.error('Erreur Inscription etudiant', error);
            res.status(400).json({message:'Erreur Inscription etudiant'});
          });

          res.status(200).json({message:'Inscription finie et réussie'});
      }
    })
    .catch((error) => {
      console.error('Erreur lors de l\'insertion de l\'utilisateur:', error);
      res.status(400).json({message: 'Erreur lors de l\'insertion de l\'utilisateur.'});
    });

  }
});

/** Connexion */
router.all('/connexion', async function(req, res) {
  if (req.method === 'GET') {
    res.render('connexion', { title: 'Connexion' });
  } else if (req.method === 'POST') {

    const idConnexion = req.body.idConnexion;
    const password = req.body.password;
    const requeteChercher = `SELECT * FROM Utilisateur WHERE (email='${idConnexion}') OR (pseudo='${idConnexion}')`;

    try {
      const result = await pool.query(requeteChercher);

      // Aucun email ou login ne correspond
      if (result.rowCount === 0) {
        res.status(400).send('La connexion a échoué');
      } else {
        const user = result.rows[0];
        const match = await fmdp.comparerMdp(password, user.hashmdp);
        
        console.log("Les mdp sont identiques " + match);

        if (match) {
          
          console.log('Connexion de ' + user.prenom);
          const payload = {
            utilisateurId: user.id,
            utilisateurType: user.type
          };

          // Générer le JWT
          console.log("SECRET " + secretKey);

          const token = jwt.sign(payload, secretKey, { expiresIn: '180h' });

          res.status(200).json({ token: token }); // Envoyer le JWT dans la réponse JSON

        } else {
          res.status(400).send('Le mot de passe est incorrect');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête:', error);
      res.status(400).send('Erreur lors de l\'exécution de la requête');
    }
  }
});


router.get('/admin/liste', function(req, res) {
  res.render('admin/liste', { title: 'Liste' });
});


/*Liste des utilisateurs*/
router.get('/liste', (req, res) => {
  pool.query('SELECT * FROM Utilisateur', (err, result) => {
    if (!err) {
      const users = result.rows;
      console.log(users)
      res.render('liste', { users });
    } else {
      console.log(err.message);
    }
  });
});

module.exports = router;