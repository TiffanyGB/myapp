const pool = require('../database/configDB');
const userModel = require('./userModel');

/**Chercher un admin par son id*/
function chercherAdminID(idUser) {
    const users = 'SELECT * FROM Admini WHERE idAdmin = $1';

    return new Promise((resolve, reject) => {
        pool.query(users, [idUser])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**
 * Création d'un administrateur
 * @async
 * @param {Array} values_user - Les valeurs des champs utilisateur.
 * @param {Array} values_id - Les valeurs des champs identifiant (pseudo et email).
 * @returns {string} - Résultat de la création de l'administrateur.
 * - 'true' si l'administrateur a été créé avec succès.
 * - 'erreur' en cas d'échec de l'insertion dans la table admin.
 * - 'les2' si à la fois le pseudo et l'email existent déjà.
 * - 'pseudo' si le pseudo existe déjà.
 * - 'mail' si l'email existe déjà.
 */
async function creerAdmin(id) {
    const requet = `INSERT INTO Admini (idAdmin) VALUES ($1)`;

    try {
        pool.query(requet, [id]);
    }
    catch (error) {
        throw error;
    }
}


/**Modifier un admin */
async function modifierAdministrateur(idUser, valeurs, password) {

    try {
        userModel.modifierUser(idUser, valeurs, password);
    } catch (error) {
        throw error;
    }
}


module.exports = {
    creerAdmin,
    chercherAdminID,
    chercherListeAdmins,
    modifierAdministrateur
}