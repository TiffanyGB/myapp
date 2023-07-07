const pool = require('../database/configDB');
const fi = require('../public/javascripts/index/fonctions_inscription');
const userModel = require('./userModel');


/**Valider les données */


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
async function creerAdmin(values_user, values_id) {
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
            const inserer = await fi.insererUser(values_user, values_id, 'administrateur');
            if (inserer) {
                console.log('Admin inséré dans la table utilisateur');
                try {
                    const idUser = await fi.chercherUser(values_id[0]);
                    const requet = `INSERT INTO admini (idadmin) VALUES ('${idUser}')`;
                    await pool.query(requet);
                    return 'true';
                } catch (error) {
                    console.error('Erreur lors de l\'insertion des données côté admin :', error);
                    throw error;
                }
            } else {
                console.log('Insertion dans la table admin échouée');
                return 'erreur';
            }
        }

    } catch (err) {
        console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
    }
}


/**Modifier un admin */
async function modifierAdministrateur(idUser, valeurs, password) {

    try {
        userModel.modifierUser(idUser, valeurs, password);

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'admin", error);
        throw error;
    }
}



module.exports = {
    creerAdmin,
    chercherAdminID,
    chercherListeAdmins,
    modifierAdministrateur
}