const { body, validationResult } = require('express-validator');

function validateUserData(req, res, next) {
    // Exécuter les validateurs Express Validator
    const errors = validationResult(req);

    // Vérifier s'il y a des erreurs de validation
    if (!errors.isEmpty()) {
        // Renvoyer les erreurs de validation au client
        return res.status(400).json({ errors: errors.array() });
    }

    /* Si les données sont valides, passer à l'étape suivante*/
    next();
}

// function validatePasswordCreation() {
//     return body('password')
//         .notEmpty().withMessage('Le mot de passe ne doit pas être vide.')
//         .isLength({ min: 8, max: 100 }).withMessage('Le mot de passe doit avoir une longueur comprise entre 8 et 100 caractères.')
//         .matches(/[A-Za-zÀ-ÿ]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
//         .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
//         .matches(/\W/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.')
//         .custom((value, { req }) => {
//             if (/<|>|"|\\/.test(value)) {
//                 throw new Error("Le mdp ne doit pas contenir les caractères '<' ou '>'");
//             }
//             return true;
//         });
// }

const validatePasswordCreation = [

    body('password')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 8, max: 100 }).withMessage('Le mot de passe doit avoir une longueur comprise entre 8 et 100 caractères.')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
        .matches(/[!?.@#$%^&*]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.'),

    /**Appel du validateur */
    validateUserData,
];

const validatePasswordModif = [

    body('password')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 8, max: 100 }).withMessage('Le mot de passe doit avoir une longueur comprise entre 8 et 100 caractères.')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
        .matches(/[!?.@#$%^&*]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.'),

    /**Appel du validateur */
   validateUserData,
];

module.exports = {
    validateUserData,
    validatePasswordCreation,
    validatePasswordModif
}