const pool = require('../database/configDB');
const { body } = require('express-validator');

async function validerGestionnaireExterne(req) {
    await body('entreprise')
        .notEmpty().withMessage("Le nom de l'entreprise ne doit pas être vide.")
        .custom((value) => !(/^\s+$/.test(value)))
        .matches(/^[A-Za-z0-9\W]+$/).withMessage("Le nom de l'entreprise doit contenir uniquement des lettres et des chiffres.")
        .isLength({ min: 2, max: 300 }).withMessage("Le nom de l'entreprise doit avoir une longueur comprise entre 2 et 300 caractères.")
        .custom((value, { req }) => {
            if (/<|>/.test(value)) {
                throw new Error("Le nom de l'entreprise ne doit pas contenir les caractères '<' ou '>'");
            }
            return true;
        })
        .run(req);

    await body('metier')
        .notEmpty().withMessage("Le métier ne doit pas être vide.")
        .custom((value) => !(/^\s+$/.test(value)))
        .matches(/^[A-Za-z0-9\W]+$/).withMessage("Le métier doit contenir uniquement des lettres et des chiffres.")
        .isLength({ min: 2, max: 200 }).withMessage("Le métier doit avoir une longueur comprise entre 2 et 200 caractères.")
        .custom((value, { req }) => {
            if (/<|>/.test(value)) {
                throw new Error("Le métier ne doit pas contenir les caractères '<' ou '>'");
            }
            return true;
        })
        .run(req);
}


/**
 * Cherche la liste des gestionnaires externes
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @returns {Object} Les lignes de la bdd trouvées par la requête SQL
 * @throws {Error} Une erreur si la requête échoue.
*/
async function chercherListeGestionnairesExt() {

    const users = `SELECT * FROM Gestionnaire_externe`;

    try {
        const chercher = await pool.query(users);
        return (chercher.rows);
    } catch (error) {
        throw error;
    }
}

/**
 * Cherche un gestionnaire avec son id
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Int} idUser id du gestionnaire externe à rechercher
 * @returns {Object} Les lignes de la bdd trouvées par la requête SQL
 * @throws {Error} Une erreur si la requête échoue.
*/
async function chercherGestionnaireExtID(IdUser) {

    const users = `SELECT * FROM Gestionnaire_externe WHERE id_g_externe = $1`;

    try {
        const chercher = await pool.query(users, [IdUser]);
        return (chercher.rows);
    } catch (error) {
        throw error;
    }
}

/**
 * Crée un gestionnaireExterne
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Int} id Id de l'étudiant
 * @param {String} entreprise Entreprise du gestionnaire
 * @param {String} metier Métier du gestionnaire
 * @throws {Error} Une erreur si la requête échoue.
*/
async function creerGestionnaireExterne(id, entreprise, metier) {

    const valeurs_ges = [id, entreprise, metier];
    const requet = `INSERT INTO Gestionnaire_externe (id_g_externe, entreprise, metier) VALUES ($1, $2, $3)`;

    try {
        pool.query(requet, valeurs_ges);
    }
    catch (error) {
        throw error;
    }
}

/**
 * Crée un json avec les infos du gestionnaire voulu
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Int} userId Id du gestionnaire externe
 * @returns {JSON} Json avec les informations
 * @throws {Error} Une erreur si la requête échoue.
*/
async function getExterneInfo(userId) {

    try{
        const chercherGE = await chercherGestionnaireExtID(userId);
        const gex = chercherGE[0];
    
        return {
            entreprise: gex.entreprise,
            metier: gex.metier,
        };
    }catch (error){
        throw error;
    }

}



module.exports = {
    chercherListeGestionnairesExt,
    chercherGestionnaireExtID,
    creerGestionnaireExterne,
    validerGestionnaireExterne,
    getExterneInfo
}