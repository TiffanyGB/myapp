const pool = require('../database/configDB');


/**Liste des étudiants */
function chercherListeGestionnairesExt() {

    const users = 'SELECT * FROM Gestionnaire_externe';

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

function chercherGestionnaireExtID(IdUser) {

    const users = 'SELECT * FROM Gestionnaire_externe WHERE id_g_externe = $1';
    const params = [IdUser];

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
    chercherListeGestionnairesExt,
    chercherGestionnaireExtID
}