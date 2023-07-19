const pool = require('../database/configDB');
const userModel = require('./userModel');
const { body, validationResult } = require('express-validator');

/**Valider les données */
async function validerEtudiant(req) {
    await body('ecole')
        .isLength({ min: 2, max: 100 })
        .withMessage("L'école doit contenir entre 2 et 100 caractères")
        .matches(/^[^<>]+$/).withMessage('Le pseudo ne doit contenir que des lettres, des chiffres et des caractères spéciaux, sauf les espaces et les symboles "<>".')
        .run(req);

    await body('niveau_etude')
        .isIn(['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'])
        .isLength({ min: 2, max: 15 })
        .withMessage("Le niveau d'études n'est pas valide")
        .run(req);
}

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
async function creerEtudiant(ecole, niveau, id) {

    const values_etudiant = [ecole, niveau];
    const requet = `INSERT INTO Etudiant (idEtudiant, ecole, niveau_etude) VALUES ('${id}', $1, $2)`;

    try {
        return new Promise((resolve, reject) => {
            pool.query(requet, values_etudiant)
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


/**Modifier un étudiant */
async function modifierEtudiant(idUser, valeurs, valeurs_etudiant, password) {

    try {
        const result = await userModel.modifierUser(idUser, valeurs, password)

        if (result === 'les2') {
            return 'les2';
        } else if (result === 'pseudo') {
            return 'pseudo';
        }
        else if (result === 'mail') {
            return 'mail';
        }
        const student = `UPDATE Etudiant
                    SET ecole = '${valeurs_etudiant[1]}',
                    niveau_etude = '${valeurs_etudiant[2]}' 
                    WHERE idEtudiant = ${idUser}`;

        try {
            pool.query(student);
            console.log("reussi");
        }
        catch (error) {
            console.error("Erreur lors de la mise à jour de l'étudiant", error);
        }




    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'étudiant", error);
        throw error;
    }
}



module.exports = {
    chercherStudent,
    creerEtudiant,
    chercherListeStudents,
    modifierEtudiant,
    validerEtudiant
}