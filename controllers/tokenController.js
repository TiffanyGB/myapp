const jwt = require('jsonwebtoken');
const tk = require('../public/javascripts/token/token')




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

            console.log("admin");
            req.userProfile = 'admin';

        } else if (decoded.utilisateurType === 'etudiant') {

            console.log("etudiant");
            req.userProfile = 'etudiant';

        } else if ((decoded.utilisateurType === 'gestionnaireIA') || (decoded.utilisateurType === 'gestionnaireExterne')) {
            console.log(decoded.utilisateurType);
            req.userProfile = 'gestionnaire';
        }
        req.decodedToken = decoded;

        next();
    });
}



module.exports = {
    verifyToken,
    
};