const pool = require('../database/configDB');
const userModel = require('./userModel');
const { body } = require('express-validator');


async function validerGestionnaireIA(req) {
    await body('role_asso')
        .notEmpty().withMessage("Le rôle ne doit pas être vide.")
        .custom((value) => !(/^\s+$/.test(value)))
        .matches(/^[A-Za-z0-9\W]+$/)
        .isLength({ min: 2, max: 200 }).withMessage("Le rôle doit avoir une longueur comprise entre 2 et 200 caractères.")
        .custom((value, { req }) => {
            if (/<|>/.test(value)) {
                throw new Error("Le rôle ne doit pas contenir les caractères '<' ou '>'");
            }
            return true;
        })
        .run(req);
}

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

    const valeurs_ges = [id, role_asso];
    const requet = `INSERT INTO Gestionnaire_iapau (id_g_iapau, role_asso) VALUES ($1, $2)`;

    try {
        pool.query(requet, valeurs_ges)
    }
    catch (error) {
        throw error;
    }
}

async function getIAGestionnaireInfo(userId) {
    const chercherGIA = await chercherGestionnaireIapau(userId);
    const gia = chercherGIA[0];

    return {
        role_asso: gia.role_asso,
    };
}

module.exports = {
    chercherGestionnaireIapau,
    chercherListeGestionnaireIapau,
    creerGestionnaireIA,
    validerGestionnaireIA,
    getIAGestionnaireInfo
}