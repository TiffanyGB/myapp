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


/**Liste des étudiants */
async function chercherListeGestionnairesExt() {

    const users = `SELECT * FROM Gestionnaire_externe`;

    try {
        const chercher = await pool.query(users);
        return (chercher.rows);
    } catch (error) {
        throw error;
    }
}

/**Chercher un gestionnaire externe par son id*/
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