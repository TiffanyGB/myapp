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

/**
 * Cherche la liste des gestionnaires iapau
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @returns {Object} Les lignes de la bdd trouvées par la requête SQL
 * @throws {Error} Une erreur si la requête échoue.
*/
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


/**
 * Cherche un gestionnaire avec son id
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Int} idUser id du gestionnaire externe à rechercher
 * @returns {Object} Les lignes de la bdd trouvées par la requête SQL
 * @throws {Error} Une erreur si la requête échoue.
*/
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


/**
 * Crée un gestionnaire iapau
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Int} id Id de l'étudiant
 * @param {String} role_asso ROle du gestionnaire dans IA PAU
 * @throws {Error} Une erreur si la requête échoue.
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

/**
 * Crée un json avec les infos du gestionnaire voulu
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Int} userId Id du gestionnaire iapau
 * @returns {JSON} Json avec les informations
 * @throws {Error} Une erreur si la requête échoue.
*/
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