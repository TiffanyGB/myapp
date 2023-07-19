const pool = require('../database/configDB');
const userModel = require('./userModel');
const { body } = require('express-validator');


async function validerGestionnaireExterne(req) {
    await body('entreprise')
      .notEmpty().withMessage("Le nom de l'entreprise ne doit pas être vide.")
      .matches(/^[A-Za-z0-9\W]+$/).withMessage("Le nom de l'entreprise doit contenir uniquement des lettres et des chiffres.")
      .isLength({ min: 2, max: 100 }).withMessage("Le nom de l'entreprise doit avoir une longueur comprise entre 2 et 100 caractères.")
      .custom((value, { req }) => {
        if (/<|>/.test(value)) {
          throw new Error("Le nom de l'entreprise ne doit pas contenir les caractères '<' ou '>'");
        }
        return true;
      })
      .run(req);
  
    await body('metier')
      .notEmpty().withMessage("Le métier ne doit pas être vide.")
      .matches(/^[A-Za-z0-9\W]+$/).withMessage("Le métier doit contenir uniquement des lettres et des chiffres.")
      .isLength({ min: 2, max: 100 }).withMessage("Le métier doit avoir une longueur comprise entre 2 et 100 caractères.")
      .custom((value, { req }) => {
        if (/<|>/.test(value)) {
          throw new Error("Le métier ne doit pas contenir les caractères '<' ou '>'");
        }
        return true;
      })
      .run(req);
  }


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


async function creerGestionnaireExterne(id, entreprise, metier) {

    const valeurs_ges = [entreprise, metier];
    const requet = `INSERT INTO Gestionnaire_externe (id_g_externe, entreprise, metier) VALUES ('${id}', $1, $2)`;

    try {
        return new Promise((resolve, reject) => {
            pool.query(requet, valeurs_ges)
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

/**Modifier */
async function modifierExterne(idUser, valeurs, metier, entreprise, password) {


}


module.exports = {
    chercherListeGestionnairesExt,
    chercherGestionnaireExtID,
    creerGestionnaireExterne,
    modifierExterne,
    validerGestionnaireExterne
}