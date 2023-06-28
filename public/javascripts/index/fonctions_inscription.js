const bcrypt = require('bcrypt');
const pool = require('../../../database/configDB');


function verifExistence(values) {
  const verifExistence = `SELECT * FROM UTILISATEUR WHERE (pseudo = $1) OR (email = $2)`;

  return new Promise((resolve, reject) => {
    pool.query(verifExistence, values)
      .then((result) => {
        if (result.rows.length > 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((error) => {
        console.error('Fichier "' + __filename + '" fonction: "'+ arguments.callee.name +':\nErreur lors de l\'insertion des données côté utilisateur:', error);
        reject(error);
      });
  });
}

async function insererUser(values, values2, type) {

  const insertUser = `
    INSERT INTO Utilisateur (nom, prenom, pseudo, email, lien_linkedin, lien_github, ville, date_inscription, typeUser)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, '${type}')`;

  try {
    const nonExiste = await verifExistence(values2);

    if (nonExiste) {
      return new Promise((resolve, reject) => {
        pool.query(insertUser, values)
          .then(() => {
            resolve(true);
          })
          .catch((error) => {
            console.error('Fichier "' + __filename + '" fonction: "'+ arguments.callee.name +':\nErreur lors de l\'insertion des données côté utilisateur:', error);
            reject(error);
          });
      });
    } else {
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
    .catch((error) => {
    console.error('Fichier "' + __filename + '" fonction: "'+ arguments.callee.name +':\nErreur lors de l\'insertion du mot de passe:', error);
    });
}

async function insererEtudiant(values, pseudo){

  try{
    const idUser = await chercherUser(pseudo);
    
    const requet = `INSERT INTO etudiant (idEtudiant, ecole, niveau_etude, code_postale_ecole)
    VALUES ('${idUser}', $1, $2, $3)`;

    return new Promise((resolve, reject) => {
      pool.query(requet, values)
      .then(()=> {
        resolve(true);  
      })
      .catch((error) => {
        console.error('Fichier "' + __filename + '" fonction: "'+ arguments.callee.name +':\nErreur lors de l\'insertion des données côté etudiant (requete sql)', error);
        reject(error);
      });
    });
  } catch (error){
    console.error('Fichier "' + __filename + '" fonction: "'+ arguments.callee.name +':\nErreur lors de l\'insertion des données côté etudiant (requete sql).', error);
    throw error;
  }
}

function chercherUser(pseudo) {
    const user = `SELECT idUser FROM utilisateur WHERE pseudo = '${pseudo}'`;
    
    return new Promise((resolve, reject) => {
        pool.query(user)
        .then((result) => {
            if (result.rows.length > 0) {
            resolve(result.rows[0].iduser);
            } else {
            reject(new Error('Utilisateur non trouvé: erreur dans le fichier "' + __filename + '" dans "'  + arguments.callee.name + '"'));
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
    insererEtudiant,
    chercherUser
  };
  


