const pool = require('../database/configDB');
const fi = require('../public/javascripts/index/fonctions_inscription');
const userModel = require('./userModel');


/**Liste des étudiants */
function chercherListeGestionnairesExt() {

    const users = `SELECT * FROM Gestionnaire_externe`;

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

/**Chercher un gestionnaire externe par son id*/

function chercherGestionnaireExtID(IdUser) {

    const users = `SELECT * FROM Gestionnaire_externe WHERE id_g_externe = $1`;
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

/**
 * Crée un nouveau gestionnaire externe.
 * @async
 * @param {Array} values_user - Les valeurs des champs utilisateur.
 * @param {Array} values_id - Les valeurs des champs identifiant (pseudo et email).
 * @param {string} entreprise - L'entreprise du gestionnaire externe.
 * @param {string} metier - Le métier du gestionnaire externe.
 * @returns {string} - Résultat de la création du gestionnaire externe.
 * - 'true' si le gestionnaire externe a été créé avec succès.
 * - 'erreur' en cas d'échec de l'insertion dans la table gestionnaire externe.
 * - 'les2' si à la fois le pseudo et l'email existent déjà.
 * - 'pseudo' si le pseudo existe déjà.
 * - 'mail' si l'email existe déjà.
 */
async function creerGestionnaireExterne(values_user, values_id, entreprise, metier) {

    try {
        const libre = await fi.verifExistence(values_id);
        if(!libre){
            const existeP = await fi.existePseudo(values_id[0]);
            const existeM = await fi.existeMail(values_id[1]);
    
      
            if(existeM && existeP){
              return "les2";
            }
            else if (existeP) {
              return "pseudo";
            }else if (existeM) {
              return "mail";
            }
        }else{

            const inserer = await fi.insererUser(values_user, values_id, 'gestionnaireExterne');
            if (inserer) {
                console.log('GestionnaireExterne inséré dans la table utilisateur');
                try {
                    const idUser = await fi.chercherUser(values_id[0]);
                    const requet = `INSERT INTO Gestionnaire_externe (id_g_externe, entreprise, metier) VALUES ('${idUser}', '${entreprise}', '${metier}')`;
                    await pool.query(requet);
                    return 'true';
                }
                catch (error) {
                    console.error('Erreur lors de l\'insertion des données côté gestionnaire externe :', error);
                    throw error;
                }
            } else {
                console.log('Insertion dans la table gestionnaire externe échouée');
            }
        }
    } catch (err) {
        console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
    }
}

/**Modifier */
async function modifierExterne(idUser, valeurs, metier, entreprise, password) {

    try {
        userModel.modifierUser(idUser, valeurs, password)
            .then(() => {

                const student = `UPDATE Gestionnaire_externe
            SET entreprise = '${entreprise}',
            metier = '${metier}' 
            WHERE id_g_externe = ${idUser}`;

                console.log()
                try {
                    pool.query(student);
                    console.log("reussi");
                }
                catch (error) {
                    console.error("Erreur lors de la mise à jour du gestionnaire externe", error);
                }

            })
            .catch((error) => {
                console.error("Erreur lors de la mise à jour u gestionnaire externe", error);
            });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du gestionnaire externe", error);
        throw error;
    }
}


module.exports = {
    chercherListeGestionnairesExt,
    chercherGestionnaireExtID,
    creerGestionnaireExterne,
    modifierExterne
}