const {validationResult } = require('express-validator');

/*Validateur pour controller */
        /*Appel du validateur, il vérifie que les contraintes définies dans 'validaterEtudiant' 
        sont respectées. */
        /*Mettre un exemple comme         await etudiantModel.validerEtudiant(req);
        validateurErreurs(req,res); */
function validateurErreurs(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
}

/*Validateur pour middleware */
function validateurDonnéesMiddleware(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

module.exports = {validateurErreurs, validateurDonnéesMiddleware}