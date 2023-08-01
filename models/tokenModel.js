const pool = require('../database/configDB');
const jwt = require('jsonwebtoken');


function stockerJWT(jwt, cle) {

    const stocker = `INSERT INTO jwt
    (token, cleScrete) VALUES ($1, $2)`;

    try {
        pool.query(stocker, [jwt, cle]);
    } catch (error) {
        throw (error);
    }
}

async function chercherToken(jwt) {

    const chercher = `SELECT * FROM jwt 
    WHERE token = $1`;

    try {
        return new Promise((resolve) => {
            pool.query(chercher, [jwt])
            .then((res) => {
                resolve(res.rows);
            })
        })
    } catch (error) {
        throw (error)
    }
}

/* Middleware de vérification du token*/
async function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      req.userProfile = 'aucun';
      return next();
    }
  
    try {
      const tokenBdd = await chercherToken(token);
  
      if (tokenBdd.length > 0) {
  
        jwt.verify(tokenBdd[0].token, tokenBdd[0].clescrete, (err, decoded) => {
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
          req.id = decoded.utilisateurId;
  
          next();
        });
      }
    } catch {
      return res.status(403).json({ message: 'Problème au niveau du token.' });
    }
  }

module.exports = { stockerJWT, chercherToken, verifyToken }