const pool = require('../database/configDB');


/**Liste des gestionnaires ia pau */
function chercherListeGestionnaireIapau(idUser) {

    const users = 'SELECT * FROM Gestionnaire_iapau WHERE id_g_iapau = $1';
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


/**Chercher un gestionnaire ia pau par son id*/
function chercherGestionnaireIapau(idUser) {

    const users = 'SELECT * FROM Gestionnaire_iapau WHERE id_g_iapau = $1';
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


/**Créer un gestionnaire ia pau */

/**Modifier un gestionnaire ia pau */

/**Supprimer un gestionnaire ia pau */

/**Valider les données */



module.exports = {
    chercherGestionnaireIapau,
    chercherListeGestionnaireIapau
}