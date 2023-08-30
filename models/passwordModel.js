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

/**Insérer un mot de passe */


/**Changer le mot de passe */
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

/**Crypter le mot de passe */
async function salageMdp(password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        throw error;
    }
}

/**ComparerMdp */
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