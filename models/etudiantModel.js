const pool = require('../database/configDB');


/**Liste des étudiants */
function chercherListeStudents() {

    const users = 'SELECT * FROM Etudiant';

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

function chercherStudent(idUser) {

    const users = 'SELECT * FROM Etudiant WHERE idEtudiant = $1';
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

/**Créer un étudiant */

/**Modifier un étudiant */

/**Supprimer un étudiant */

/**Valider les données */

module.exports = {
    chercherStudent
}