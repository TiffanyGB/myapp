const pool = require('../database/configDB');
const bcrypt = require('bcrypt');
const { body } = require('express-validator');
const { validateurDonnéesMiddleware } = require('../verifications/validateur');

const validatePasswordCreation = [

    body('password')
        .notEmpty()
        .isLength({ min: 8, max: 255 }).withMessage('Le mot de passe doit avoir une longueur comprise entre 8 et 255 caractères.')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
        .matches(/[\W]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.'),

    /**Appel du validateur */
    validateurDonnéesMiddleware,
];

const validatePasswordModif = [

    body('password')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 8, max: 100 }).withMessage('Le mot de passe doit avoir une longueur comprise entre 8 et 255 caractères.')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
        .matches(/[\W]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.'),

    /**Appel du validateur */
    validateurDonnéesMiddleware,
];


/**
 * Met à jour le mot de passe d'un utilisateur.
 * @function
 * @param {string} mdp - Le nouveau mot de passe crypté.
 * @param {number} id - Identifiant de l'utilisateur.
 * @throws {Error} Une erreur si la mise à jour du mot de passe échoue.
 */
function updateMdp(mdp, id) {

    const inserer = `UPDATE utilisateur
        SET hashMdp = $1
        WHERE idUser= $2`;

    try {
        pool.query(inserer, [mdp, id]);
    } catch {
        throw error;
    }
}

/**
 * Crypte un mot de passe en utilisant une fonction de hachage avec salage.
 * @async
 * @function
 * @param {string} password - Le mot de passe clair à crypter.
 * @returns {Promise<string>} - Une promesse résolue avec le mot de passe crypté.
 * @throws {Error} Une erreur si le cryptage du mot de passe échoue.
 */
async function salageMdp(password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        throw error;
    }
}

/**
 * Compare un mot de passe clair avec un mot de passe crypté pour vérifier s'ils correspondent.
 * @async
 * @function
 * @param {string} mdpClair - Le mot de passe clair à comparer.
 * @param {string} mdpCrypte - Le mot de passe crypté à comparer.
 * @returns {Promise<boolean>} - Une promesse résolue avec `true` si les mots de passe correspondent, sinon `false`.
 * @throws {Error} Une erreur si la comparaison des mots de passe échoue.
 */
async function comparerMdp(mdpClair, mdpCrypte) {
    try {
        const match = await bcrypt.compare(mdpClair, mdpCrypte);
        return match;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    updateMdp,
    salageMdp,
    comparerMdp,
    validatePasswordCreation,
    validatePasswordModif
}