const fi = require('../public/javascripts/fonctions_inscription');
const cu = require('../public/javascripts/creerUser');
const fmdp = require('../public/javascripts/fonctions_mdp');

async function createUser(req, res) {
  if (req.method === 'GET') {
    res.render('admin/creerUser', { title: 'Créer user' });
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

      switch(type){
        case 'administrateur':
          cu.creerAdmin(valeurs_communes, valeurs_id)
            .then(()=>{
              fmdp.salageMdp(password)
                .then((hashedPassword) => {
                  console.log('Mot de passe crypté avec succès');
                  fi.insererMdp(hashedPassword, userPseudo);
                  res.status(200).json({message:'Inscription réussie'});
      
                })
                .catch((error) => {
                  console.error('Erreur lors du salage du mot de passe (Création admin)', error);
                  res.status(400).json({message:'Erreur lors du salage du mot de passe (Création admin)'});
      
                });
            })
            .catch((error) => {
              console.error('Erreur lors de la création de l\'admin', error);
              res.status(400).json({message:'Erreur lors de la création de l\'admin'});
            });
  
          break;
  
        case 'etudiant': 
          fi.insererUser(valeurs_communes, valeurs_id, 'etudiant')
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
      
                fi.insererEtudiant(valeurs_etudiant, userPseudo)
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
          break;
  
        case 'gestionnaire_iapau':
          cu.creerGestionnaireIA(valeurs_communes, valeurs_id, userRole)
            .then(()=>{
              fmdp.salageMdp(password)
                .then((hashedPassword) => {
                  console.log('Mot de passe crypté avec succès');
                  fi.insererMdp(hashedPassword, userPseudo);
                  res.status(200).json({message:'Inscription réussie'});
  
                })
                .catch((error) => {
                  console.error('Erreur lors du salage du mot de passe (Création admin)', error);
                  res.status(400).json({message:'Erreur lors du salage du mot de passe (Création admin)'});
  
                });
            })
            .catch((error) => {
              console.error('Erreur lors de la création de l\'admin', error);
              res.status(400).json({message:'Erreur lors de la création de l\'admin'});
            });
  
          break;
  
        case 'gestionnaire_externe':
           cu.creerGestionnaireExterne(valeurs_communes, valeurs_id, userEntreprise, userMetier)
           .then(()=>{
            fmdp.salageMdp(password)
              .then((hashedPassword) => {
                console.log('Mot de passe crypté avec succès');
                fi.insererMdp(hashedPassword, userPseudo);
                res.status(200).json({message:'Inscription réussie'});
    
              })
              .catch((error) => {
                console.error('Erreur lors du salage du mot de passe (Création admin)', error);
                res.status(400).json({message:'Erreur lors du salage du mot de passe (Création admin)'});
    
              });
          })
          .catch((error) => {
            console.error('Erreur lors de la création de l\'admin', error);
            res.status(400).json({message:'Erreur lors de la création de l\'admin'});
          });
  
          break;
  
        default: 
          break;
      }
  }
}

module.exports = {
  createUser,
};
