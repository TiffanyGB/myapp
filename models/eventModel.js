const pool = require('../database/configDB');


/**Liste des étudiants */
function chercherListeEvenement() {

    const users = 'SELECT * FROM Evenement';

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

/**Chercher un étudiant par son id*/

function chercherEvenement(idEvent) {

    const users = 'SELECT * FROM Evenement WHERE idEvent = $1';
    const params = [idEvent];

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


module.exports = {
    chercherEvenement,
    chercherListeEvenement
}