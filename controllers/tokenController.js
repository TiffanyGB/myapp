const jwt = require('jsonwebtoken');


function verifyToken(req, res, next, secretKey) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.userProfile = 'aucun';
        return next();
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide ou expiré.' });
        }

        if (decoded.utilisateurType === 'administrateur') {

            req.userProfile = 'admin';

        } else if (decoded.utilisateurType === 'etudiant') {

            req.userProfile = 'etudiant';

        } else if ((decoded.utilisateurType === 'gestionnaireIA') || (decoded.utilisateurType === 'gestionnaireExterne')) {
            req.userProfile = 'gestionnaire';
        }
        req.decodedToken = decoded;

        next();
    });
}


module.exports = {
    verifyToken,

};