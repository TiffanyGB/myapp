const { body } = require('express-validator');
const {validateurDonnéesMiddleware} = require('../verifications/validateur');


const validatePasswordCreation = [

    body('password')
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

const connexion = [

    body('identifiant')
        .isLength({ max: 100 })
        .withMessage('L\'identifiant doit avoir une longueur de maximum 100 caractères.'),

    body('password')
    .isLength({ max: 255 })
    .withMessage('Le mot de passe doit avoir une longueur de maximum 255 caractères.'),

    validateurDonnéesMiddleware,
]

module.exports = {
    validateurDonnéesMiddleware,
    validatePasswordCreation,
    validatePasswordModif,
    connexion
}