const pool = require('../../../database/configDB');
const userModel = require('../../../models/userModel');
const verifExistenceController = require('../../../controllers/Auth/verificationExistenceController');


/**Apparemment pas besoin, essayer sans */

async function insererUser(values, values2, type) {

  const insertUser = `
    INSERT INTO Utilisateur (nom, prenom, pseudo, email, lien_linkedin, lien_github, ville, date_inscription, typeUser)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, '${type}')`;

  try {
    const nonExiste = await verifExistenceController.verifExistence(values2);

    if (nonExiste) {
      return new Promise((resolve, reject) => {
        pool.query(insertUser, values)
          .then(() => {
            resolve("true");
          })
          .catch((error) => {
            console.error('Fichier "' + __filename + '" fonction: "' + arguments.callee.name + ':\nErreur lors de l\'insertion des données côté utilisateur:', error);
            reject(error);
          });
      });
    } 
    else {
      const existeP = await verifExistenceController.existePseudo(values2[0]);
      const existeM = await verifExistenceController.existeMail(values2[1]);

      if(existeM && existeP){
        return "les2";
      }
      else if (existeP) {
        return "pseudo";
      }else if (existeM) {
        return "mail";
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données côté utilisateur:', error);
    throw error;
  }
}

/**Je pense que sert à rien */
function insererMdp(mdp, pseudo) {

  const inserer = `UPDATE utilisateur
      SET hashMdp = '${mdp}'
      WHERE pseudo='${pseudo}'`;

  pool.query(inserer)
    .catch((error) => {
      console.error('Fichier "' + __filename + '" fonction: "' + arguments.callee.name + ':\nErreur lors de l\'insertion du mot de passe:', error);
    });
}

async function insererEtudiant(values, pseudo) {

  try {
    const idUser = await userModel.chercherUserPseudo(pseudo);

    const requet = `INSERT INTO etudiant (idEtudiant, ecole, niveau_etude, code_postale_ecole)
      VALUES ('${idUser}', $1, $2, $3)`;

    return new Promise((resolve, reject) => {
      pool.query(requet, values)
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          console.error('Fichier "' + __filename + '" fonction: "' + arguments.callee.name + ':\nErreur lors de l\'insertion des données côté etudiant (requete sql)', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Fichier "' + __filename + '" fonction: "' + arguments.callee.name + ':\nErreur lors de l\'insertion des données côté etudiant (requete sql).', error);
    throw error;
  }
}

module.exports = {
  insererUser,
  insererMdp,
  insererEtudiant,

};



