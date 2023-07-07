const pool = require('../database/configDB');

function aUneEquipe(idEtudiant) {

    const appartientAUneEquipe = `SELECT * FROM Appartenir WHERE idUser = '${idEtudiant}'`;

    return new Promise((resolve, reject) => {
        pool.query(appartientAUneEquipe)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}


module.exports = {
    aUneEquipe
}