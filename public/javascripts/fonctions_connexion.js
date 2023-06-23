const bcrypt = require('bcrypt');
const pool = require('../../database/configDB');




function verifExistence(values) {
    const verifExistence = `SELECT * FROM UTILISATEUR WHERE (pseudo = $1) OR (email = $2)`;

    return new Promise((resolve, reject) => {
        pool.query(verifExistence, values)
        .then((result) => {
            if (result.rows.length > 0) {
              console.log('Utilisateur existant avec le même pseudo ou email');
            resolve(false);
            } else {
            resolve(true);
            }
        })
        .catch((error) => {
            console.error('Erreur lors de l\'insertion des données côté utilisateur:', error);
            reject(error);
        });
    });
}

async function insererUser(values, values2) {
    const insertUser = `
      INSERT INTO Utilisateur (nom, prenom, pseudo, email, lien_linkedin, lien_github, ville, date_inscription, typeUser)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, 'etudiant')`;
  
    try {
      const nonExiste = await verifExistence(values2);
  
      if (nonExiste) {
        return new Promise((resolve, reject) => {
          pool.query(insertUser, values)
            .then(() => {
              console.log('Données insérées avec succès dans la table utilisateur');
              resolve(true);
            })
            .catch((error) => {
              console.error('Erreur lors de l\'insertion des données côté utilisateur:', error);
              reject(error);
            });
        });
      } else {
        console.log('Utilisateur pris');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'insertion des données côté utilisateur:', error);
      throw error;
    }
  }
  
function insererMdp(mdp, pseudo) {

    const inserer = `UPDATE utilisateur
    SET hashMdp = '${mdp}'
    WHERE pseudo='${pseudo}'`;

    pool.query(inserer)
    .then(() =>
        console.log('Mot de passe inséré avec succès')
    
    )
    .catch((error) => {
    console.error('Erreur lors de l\'insertion du mot de passe:', error);
    });
}

  
function chercherUser(pseudo) {
    const user = `SELECT idUser FROM utilisateur WHERE pseudo = '${pseudo}'`;
    
    return new Promise((resolve, reject) => {
        pool.query(user)
        .then((result) => {
            if (result.rows.length > 0) {
            console.log('Utilisateur trouvé');
            resolve(result.rows[0].iduser);
            } else {
            reject(new Error('Utilisateur non trouvé'));
            }
        })
        .catch((error) => {
            reject(error);
        });
    });
    }

  module.exports = {
    insererUser,
    insererMdp,
  };
  


