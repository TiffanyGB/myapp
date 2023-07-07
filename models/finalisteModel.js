const pool = require('../database/configDB');

function chercher_finalistes(idEvent) {
    const finaliste = `SELECT * FROM Equipe WHERE finaliste = '${idEvent}'`;

    return new Promise((resolve, reject) => {
        pool.query(finaliste)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

module.exports = {
    chercher_finalistes
}