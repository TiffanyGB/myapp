const pool = require('../database/configDB');
const userModel = require('./userModel');


/**Liste des gestionnaires ia pau */
function chercherListeGestionnaireIapau() {

    const users = `SELECT * FROM Gestionnaire_iapau`;

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


/**Chercher un gestionnaire ia pau par son id*/
function chercherGestionnaireIapau(idUser) {

    const users = `SELECT * FROM Gestionnaire_iapau WHERE id_g_iapau = $1`;
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
/**
 * Crée un nouveau gestionnaire IA.
 * @async
 * @param {Array} values_user - Les valeurs des champs utilisateur.
 * @param {Array} values_id - Les valeurs des champs identifiant (pseudo et email).
 * @param {string} role - Le rôle du gestionnaire IA au sein de l'association.
 * @returns {string} - Résultat de la création du gestionnaire IA.
 * - 'true' si le gestionnaire IA a été créé avec succès.
 * - 'erreur' en cas d'échec de l'insertion dans la table gestionnaire ia.
 * - 'les2' si à la fois le pseudo et l'email existent déjà.
 * - 'pseudo' si le pseudo existe déjà.
 * - 'mail' si l'email existe déjà.
 */
async function creerGestionnaireIA(id, role_asso) {

    const valeurs_ges = [role_asso];
    const requet = `INSERT INTO Gestionnaire_iapau (id_g_iapau, role_asso) VALUES ('${id}', $1)`;

    try {
        return new Promise((resolve, reject) => {
            pool.query(requet, valeurs_ges)
                .then(() => {
                    resolve('true');
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des données côté etudiant :', error);
        throw error;
    }

}

/**Modifier un gestionnaire ia pau */
async function modifierIapau(idUser, valeurs, role_asso, password) {
    // try {
    //     userModel.modifierUser(idUser, valeurs, password)
    //         .then(() => {

    //             const student = `UPDATE Gestionnaire_iapau
    //             SET role_asso = '${role_asso}'
    //             WHERE id_g_iapau = ${idUser}`;

    //             console.log()
    //             try {
    //                 pool.query(student);
    //                 console.log("reussi");
    //             }
    //             catch (error) {
    //                 console.error("Erreur lors de la mise à jour du gestionnaire iapau", error);
    //             }

    //         })
    //         .catch((error) => {
    //             console.error("Erreur lors de la mise à jour du gestionnaire iapau", error);
    //         });

    // } catch (error) {
    //     console.error("Erreur lors de la mise à jour du gestionnaire iapau", error);
    //     throw error;
    // }
}


/**Supprimer un gestionnaire ia pau */

/**Valider les données */



module.exports = {
    chercherGestionnaireIapau,
    chercherListeGestionnaireIapau,
    creerGestionnaireIA,
    modifierIapau
}