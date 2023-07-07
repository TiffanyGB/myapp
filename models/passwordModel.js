const pool = require('../database/configDB');
const bcrypt = require('bcrypt');


/**Insérer un mot de passe */


/**Changer le mot de passe */
function updateMdp(mdp, id) {

    const inserer = `UPDATE utilisateur
        SET hashMdp = '${mdp}'
        WHERE idUser='${id}'`;

    pool.query(inserer)
        .catch((error) => {
            console.error('Fichier "' + __filename + '" fonction: "' + arguments.callee.name + ':\nErreur lors de l\'insertion du mot de passe:', error);
        });
}


/**Crypter le mot de passe */
function salageMdp(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                console.error('Erreur lors de la génération du sel:', err);
                reject(err);
            } else {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        console.error('Erreur lors du hachage du mot de passe dans la fonction ${err.name} à la ligne ${err.lineNumber}:', err);
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

        console.error('Erreur lors de la comparaison des mots de passe:', error);
        throw error;
    }
}


module.exports = {
    updateMdp,
    salageMdp,
    comparerMdp
}