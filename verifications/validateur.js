const {validationResult } = require('express-validator');


/*Validateur pour middleware */
function validateurDonnéesMiddleware(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

module.exports = {validateurDonnéesMiddleware}