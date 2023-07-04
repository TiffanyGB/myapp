// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');


// /**Générer clé */
// function genererSecretKey() {

//     return crypto.randomBytes(64).toString('hex');
// };

// // const secretKey = genererSecretKey ();


// /**Créer token */
// function creerToken(payload){
//     return jwt.sign(payload, secretKey, { expiresIn: '50d' });
// }

// /**Vérifier token */



// module.exports = {
//     genererSecretKey,
//     creerToken
// }