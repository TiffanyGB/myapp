const {validationResult } = require('express-validator');

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


module.exports = {
    validateUserData
}