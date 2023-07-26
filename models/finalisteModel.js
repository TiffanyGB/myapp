const pool = require('../database/configDB');

function chercher_finalistes(idEvent) {
    const finaliste = `SELECT * FROM Equipe WHERE finaliste = $1`;

    return new Promise((resolve, reject) => {
        pool.query(finaliste, [idEvent])
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