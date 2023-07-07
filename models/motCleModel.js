const pool = require('../database/configDB');


function recupererMot(idProjet) {

    const chercherMots = `SELECT * FROM mot_cle WHERE idProjet = ${idProjet}`

    return new Promise((resolve, reject) => {
        pool.query(chercherMots)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

module.exports = {
    recupererMot
}