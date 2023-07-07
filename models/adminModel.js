const pool = require('../database/configDB');


/**Liste des admins */
function chercherListeAdmins() {
    const users = 'SELECT * FROM Admini';

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


/**Chercher un admin par son id*/
function chercherAdminID(idUser) {
    const users = 'SELECT * FROM Admini WHERE idAdmin = $1';
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

/**Créer un admin */

/**Modifier un admin */

/**Supprimer un admin */


/**Valider les données */