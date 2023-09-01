const pool = require('../database/configDB');
const userModel = require('./userModel');
const { body } = require('express-validator');

/**Valider les données */
async function validerEtudiant(req) {
    await body('ecole')
        .isLength({ min: 2, max: 400 })
        .custom((value) => !(/^\s+$/.test(value)))
        .withMessage("L'école doit contenir entre 2 et 400 caractères")
        .matches(/^[^<>]+$/).withMessage('Le pseudo ne doit contenir que des lettres, des chiffres et des caractères spéciaux, sauf les espaces et les symboles "<>".')
        .run(req);

    await body('niveau_etude')
        .isIn(['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'])
        .isLength({ min: 2, max: 15 })
        .withMessage("Le niveau scolaire n'est pas valide")
        .run(req);
}

/**
 * Cherche la liste de tous les utilisateurs
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @throws {Error} Une erreur si la requête échoue.
 * @returns {Array} - Les lignes de la bdd concernées.
*/
async function chercherListeStudents() {

    const users = 'SELECT * FROM Etudiant';

    try {
        const res = await pool.query(users);
        return res.rows;
    } catch (error) {
        throw (error);
    }
}

/**
 * Cherche un étudiant par son id
 * @async
 * @function
 * @param {Int} idUser Id de l'utilisateur
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @throws {Error} Une erreur si la requête échoue.
 * @returns {Array} - Les lignes de la bdd concernées.
*/
async function chercherStudent(idUser) {

    const users = 'SELECT * FROM Etudiant WHERE idEtudiant = $1';

    try {
        const res = await pool.query(users, [idUser]);
        return res.rows;
    } catch (error) {
        throw (error);
    }
}

/**
 * Crée un json avec les infos d'un étudiant
 * @async
 * @function
 * @param {Int} userId Id de l'utilisateur
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @throws {Error} Une erreur si la requête échoue.
 * @returns {JSON} Json avec les infos de l'étudiant
*/
async function getStudentInfo(userId) {
    try{
        const chercher = await chercherStudent(userId);
        const etudiantCourant = chercher[0];
    
        return {
            niveauEtude: etudiantCourant.niveau_etude,
            ecole: etudiantCourant.ecole,
        };
    }catch (error){
        throw error;
    }

}

/**
 * Crée un nouvel étudiant.
 * @async
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {string} ecole - L'école de l'étudiant.
 * @param {string} id - Identifiant bdd de l'utilisateur.
 * @param {string} niveau - Le niveau d'étude de l'étudiant.
 * @throws {Error} Une erreur si la requête échoue.
 */
async function creerEtudiant(ecole, niveau, id) {

    const values_etudiant = [id, ecole, niveau];
    const requet = `INSERT INTO Etudiant (idEtudiant, ecole, niveau_etude) VALUES ($1, $2, $3)`;

    try {
        pool.query(requet, values_etudiant)
    }
    catch (error) {
        throw error;
    }
}

/**
 * Modifie un étudiant.
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {string} valeurs_etudiant - Les données spécifiques à l'étudiants, ecole, niveau scolaire.
 * @param {string} password - Le nouveau mdp (peut être vide).
 * @param {string} idUser - Identifiant bdd de l'utilisateur.
 * @param {string} valeurs - Valeurs communes à tous les utilisateurs comme le nom, prénom.
 * @throws {Error} Une erreur si la requête échoue.
 */
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
                    SET ecole = $1,
                    niveau_etude = $2 
                    WHERE idEtudiant = $3`;

        valeurs_etudiant.push(idUser);
        try {
            pool.query(student, valeurs_etudiant);
        }
        catch (error) {
            throw error;
        }
    } catch (error) {
        throw error;
    }
}


module.exports = {
    chercherStudent,
    creerEtudiant,
    chercherListeStudents,
    modifierEtudiant,
    validerEtudiant,
    getStudentInfo
}