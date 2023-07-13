const pool = require('../database/configDB');
const userModel = require('./userModel');
const { body, validationResult } = require('express-validator');

/**Valider les données */
function validateUserData(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();
}

const validateEtudiantData = (req, res, next) => {
    const regleStudent = [
        body('ecole')
            .notEmpty().withMessage("Le nom de l'école ne doit pas être vide.")
            .matches(/^[A-Za-z0-9]+$/).withMessage("Le nom de l'école doit contenir uniquement des lettres et des chiffres.")
            .isLength({ min: 2, max: 40 }).withMessage("Le nom de l'école doit avoir une longueur comprise entre 2 et 40 caractères."),

        body('niveau_etude')
            .notEmpty().withMessage("Le niveau d'étude ne doit pas être vide.")
            .isIn(['L1', 'L2', 'L3', 'Doctorat', 'M1', 'M2']).withMessage("Le niveau d'étude doit être parmi les suivants : L1, L2, L3, Doctorat, M1, M2"),


    ];
    validateUserData(req, res, () => {
        // Les données sont valides, passer à l'étape suivante
        next();
    })(regleStudent);
};

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
    validateEtudiantData
}