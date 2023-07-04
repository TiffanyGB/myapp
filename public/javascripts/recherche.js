const pool = require('../../database/configDB')

/**Chercher un user dans une table selon son id*/
function chercherUserID(idUser, type) {

    const users = `SELECT * FROM ${type} WHERE idEtudiant = '${idUser}'`;

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

/**Chercher un user dans la table user */

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
    chercherUserID
}