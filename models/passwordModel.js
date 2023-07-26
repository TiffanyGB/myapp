const pool = require('../database/configDB');
const bcrypt = require('bcrypt');


/**Insérer un mot de passe */


/**Changer le mot de passe */
function updateMdp(mdp, id) {

    const inserer = `UPDATE utilisateur
        SET hashMdp = $1
        WHERE idUser= $2`;

    try {
        pool.query(inserer, [mdp, id]);
    }catch{
        throw error;
    }
}

/**Crypter le mot de passe */
function salageMdp(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                reject(err);
            } else {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(hash);
                    }
                });
            }
        });
    });
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
    comparerMdp
}