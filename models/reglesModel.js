const pool = require('../database/configDB');


function recuperer_regles(idEvent) {

    const chercherProjets = `SELECT * FROM Regle WHERE idevent = ${idEvent}`

    return new Promise((resolve, reject) => {
        pool.query(chercherProjets)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

module.exports = {
    recuperer_regles
}