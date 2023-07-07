const pool =require('../database/configDB');


function chercherClassement(idEvent) {
    const classement = `SELECT classement FROM Resultat WHERE idevent = '${idEvent}'`;

    return new Promise((resolve, reject) => {
        pool.query(classement)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**Modifier classement */


module.exports = {
    chercherClassement
}