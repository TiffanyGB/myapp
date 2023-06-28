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
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.sendStatus(401); // Unauthorized si aucun token n'est fourni
    }
  
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden si le token est invalide
      }
      req.user = user; // Ajoute les informations de l'utilisateur décodées à l'objet `req`
      next(); // Passe à la prochaine étape de traitement de la requête
    });
};

function inscriptionEleve(req, res){      
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
          if (inserer) {
            console.log('Données insérées avec succès dans la table utilisateur');
            fmdp.salageMdp(password)
              
              .then((hashedPassword) => {
                console.log('Mot de passe crypté avec succès');
                fi.insererMdp(hashedPassword, userPseudo);
    
              })
              .catch((error) => {
                console.error('Erreur lors du salage du mot de passe:', error);
                res.status(400).json({message:'Erreur lors du salage du mot de passe:'});
    
              });
    
              fi.insererEtudiant(values_etudiant, userPseudo)
              .then(() => {
                console.log('Etudiant inséré');
              })
              .catch((error) => {
                console.error('Erreur Inscription etudiant', error);
                res.status(400).json({message:'Erreur Inscription etudiant'});
              });
    
              console.log('Inscription finie');
              res.status(200).json({message:'Inscription réussie'});
          }
          else{
            console.log('Utilisateur existant avec le même pseudo ou email');
            res.status(400).json({message:'Pseudo ou email existant'});
          }
        })
        .catch((error) => {
          console.error('Erreur lors de l\'insertion de l\'utilisateur:', error);
          res.status(400).json({message: 'Erreur lors de l\'insertion de l\'utilisateur.'});
        });
    
      }
}

async function connexion(req, res){

    if (req.method === 'GET') {
        res.render('connexion', { title: 'Connexion' });
      } else if (req.method === 'POST') {

        
    
        const idPseudo = req.body.pseudo;
        const idMail = req.body.email;
        const password = req.body.password;
        const requeteChercher = `SELECT * FROM Utilisateur WHERE (email='${idMail}') OR (pseudo='${idPseudo}')`;
    
        console.log(idPseudo);
        try {
          const result = await pool.query(requeteChercher);
    
          // Aucun email ou login ne correspond
          if (result.rowCount === 0) {
            res.status(400).json({message:'Aucun email/login ne correspond'});
          } else {
            const user = result.rows[0];
            const match = await fmdp.comparerMdp(password, user.hashmdp);
          
            if (match) {
              
              console.log('Connexion de ' + user.prenom);
              const payload = {
                utilisateurId: user.id,
                utilisateurType: user.type
              };
    
              /**  Générer le JWT */
              const token = jwt.sign(payload, secretKey, { expiresIn: '180h' });
    
              res.status(200).json({ token: token, idUser: user.iduser, role: user.typeuser}); // Envoyer le JWT dans la réponse JSON
              // res.set('Authorization', `Bearer ${token}`);
              // res.redirect('/liste');
    
            } else {
              res.status(400).json({message: 'Le mot de passe est incorrect'});
            }
          }
        } catch (error) {
          console.error('Erreur lors de l\'exécution de la requête:', error);
          res.status(400).json('Erreur lors de l\'exécution de la requête');
        }
      }
}

function voirEvent(req, res){
  if (req.method === 'GET') {
    res.render('voir_event', { title: 'Voir Events' });
  } else if (req.method === 'POST') {
    re.recupererEvent(1)
    .then((count) => {
      console.log('AAAA', count);
    })
    .catch((error) => {
      console.error('Une erreur s\'est produite :', error);
    });
  }
}

// function voirEvent(req, res) {
//   if (req.method === 'GET') {
//     // Récupérer le token du header Authorization
//     const token = req.headers.authorization;

//     if (!token) {
//       // Le token n'est pas fourni, renvoyer une réponse d'erreur ou rediriger vers la page de connexion
//       return res.status(401).json({ message: 'Authentification requise.' });
//     }

//     try {
//       // Vérifier et décoder le token
//       const decoded = jwt.verify(token, secretKey);

//       // Le token est valide, vous pouvez accéder aux informations de l'utilisateur à partir de decoded
//       const userId = decoded.userId;

//       // Charger les informations spécifiques à l'utilisateur dans la page ou effectuer d'autres opérations nécessaires

//       // Renvoyer une réponse réussie
//       return res.render('voir_event', { title: 'Voir Events' });
//     } catch (error) {
//       // Le token est invalide ou expiré, renvoyer une réponse d'erreur
//       return res.status(401).json({ message: 'Token invalide.' });
//     }
//   } else if (req.method === 'POST') {
//     // Récupérer le token du header Authorization
//     const token = req.headers.authorization;

//     if (!token) {
//       // Le token n'est pas fourni, renvoyer une réponse d'erreur ou rediriger vers la page de connexion
//       return res.status(401).json({ message: 'Authentification requise (post).' });
//     }

//     try {
//       // Vérifier et décoder le token
//       const decoded = jwt.verify(token, secretKey);

//       // Le token est valide, vous pouvez accéder aux informations de l'utilisateur à partir de decoded
//       const userId = decoded.userId;

//       // Traiter les données de la requête POST et effectuer d'autres opérations nécessaires

//       // Renvoyer une réponse réussie
//       return res.status(200).json({ message: 'Opération réussie.' });
//     } catch (error) {
//       // Le token est invalide ou expiré, renvoyer une réponse d'erreur
//       return res.status(401).json({ message: 'Token invalide.' });
//     }
//   }
// }


module.exports = {
    inscriptionEleve,
    connexion,
    voirEvent
  };
  