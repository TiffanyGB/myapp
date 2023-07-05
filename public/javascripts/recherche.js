const pool = require('../../database/configDB')

/**Chercher un user dans une table selon son id*/
function chercherUserID(idUser, type) {

    const users = `SELECT * FROM ${type} WHERE id = '${idUser}'`;

    return new Promise((resolve, reject) => {
        pool.query(users)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function chercherTableUserID(idUser) {
    const users = 'SELECT * FROM Utilisateur WHERE idUser = $1';
    const params = [idUser];
  
    return new Promise((resolve, reject) => {
      pool.query(users, params)
        .then((res) => {
          resolve(res.rows);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  
  
/**Chercher tous les users dans la table user */

function chercherUtilisateur() {

    const users = `SELECT * FROM Utilisateur`;

    return new Promise((resolve, reject) => {
        pool.query(users)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}


/**Chercher un event */

module.exports = {
    chercherUtilisateur,
    chercherUserID,
    chercherTableUserID
}