const pool = require('../../database/configDB')



/** Table: USER */
/**Identifié par : RIEN */
/**Renvoie: TOUS */

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

/** Table: USER */
/**Identifié par : ID */
/**Renvoie: UN SEUL */

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

/** Table: ETUDIANT */
/**Identifié par : ID */
/**Renvoie: UN SEUL */
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


/** Table: GESTIONNAIRE IA PAU */
/**Identifié par : ID */
/**Renvoie: UN SEUL */
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

/** Table: GESTIONNAIRE EXTERNE */
/**Identifié par : ID */
/**Renvoie: UN SEUL */
function chercherGestionnaireExterne(idUser) {

    const users = 'SELECT * FROM Gestionnaire_externe WHERE id_g_externe = $1';
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

/**Chercher un user dans une table selon son id*/
// function chercherUserID(idUser, type) {

//     const users = `SELECT * FROM ${type} WHERE id = '${idUser}'`;

//     return new Promise((resolve, reject) => {
//         pool.query(users)
//             .then((res) => {
//                 resolve(res.rows);
//             })
//             .catch((error) => {
//                 reject(error);
//             });
//     });
// }











/**Chercher un event */

module.exports = {
    chercherUtilisateur,
    chercherStudent,
    chercherTableUserID,
    chercherGestionnaireIapau,
    chercherGestionnaireExterne
}