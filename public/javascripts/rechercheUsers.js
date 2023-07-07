const pool = require('../../database/configDB')
/*Mis*/
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


/** Mis dans le model */

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

/** Mis dans le model */

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


/** Mis dans le model */

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

/** Mis dans le model */
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

function chercherTousGestionnaireExterne() {

    const users = 'SELECT * FROM Gestionnaire_externe';
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


module.exports = {
    chercherUtilisateur,
    chercherStudent,
    chercherTableUserID,
    chercherGestionnaireIapau,
    chercherGestionnaireExterne,
    chercherTousGestionnaireExterne
}