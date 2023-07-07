const pool = require('../database/configDB');
const userModel = require('./userModel');
const fi = require('../public/javascripts/index/fonctions_inscription');


/**Valider les données */


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
/**
 * Crée un nouvel étudiant.
 * @async
 * @param {Array} values_user - Les valeurs des champs utilisateur.
 * @param {Array} values_id - Les valeurs des champs identifiant (pseudo et email).
 * @param {string} ecole - L'école de l'étudiant.
 * @param {string} codePostale - Le code postal de l'école de l'étudiant.
 * @param {string} niveau - Le niveau d'étude de l'étudiant.
 * @returns {string} - Résultat de la création de l'étudiant.
 * - 'true' si l'étudiant a été créé avec succès.
 * - 'erreur' en cas d'échec de l'insertion dans la table étudiant.
 * - 'les2' si à la fois le pseudo et l'email existent déjà.
 * - 'pseudo' si le pseudo existe déjà.
 * - 'mail' si l'email existe déjà.
 */
async function creerEtudiant(values_user, values_id, ecole, codePostale, niveau) {

    try {
        const libre = await fi.verifExistence(values_id);
        if (!libre) {
            const existeP = await fi.existePseudo(values_id[0]);
            const existeM = await fi.existeMail(values_id[1]);


            if (existeM && existeP) {
                return "les2";
            }
            else if (existeP) {
                return "pseudo";
            } else if (existeM) {
                return "mail";
            }
        } else {

            const inserer = await fi.insererUser(values_user, values_id, 'etudiant');
            if (inserer) {
                console.log('Etudiant inséré dans la table etudiant');
                try {
                    const idUser = await fi.chercherUser(values_id[0]);
                    const requet = `INSERT INTO Etudiant (idEtudiant, ecole, niveau_etude, code_postale_ecole) VALUES ('${idUser}', '${ecole}', '${codePostale}', '${niveau}')`;
                    await pool.query(requet);
                    return 'true';
                }
                catch (error) {
                    console.error('Erreur lors de l\'insertion des données côté etudiant :', error);
                    throw error;
                }
            } else {
                console.log('Insertion dans la table etudiant échouée');
            }
        }
    } catch (err) {
        console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
    }
}

/**Modifier un étudiant */
async function modifierEtudiant(idUser, valeurs, valeurs_etudiant, password) {

    try {
        userModel.modifierUser(idUser, valeurs, password)
            .then(() => {

                const student = `UPDATE Etudiant
                    SET ecole = '${valeurs_etudiant[1]}',
                    niveau_etude = '${valeurs_etudiant[2]}' 
                    WHERE idEtudiant = ${idUser}`;

                console.log()
                try {
                    pool.query(student);
                    console.log("reussi");
                }
                catch (error) {
                    console.error("Erreur lors de la mise à jour de l'étudiant", error);
                }

            })
            .catch((error) => {
                console.error("Erreur lors de la mise à jour de l'étudiant", error);
            });


    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'étudiant", error);
        throw error;
    }

}





module.exports = {
    chercherStudent,
    creerEtudiant,
    chercherListeStudents,
    modifierEtudiant
}