const pool =require('../database/configDB');


function chercherClassement(idEvent) {
    const classement = `SELECT classement FROM Resultat WHERE idevent = $1`;

    return new Promise((resolve, reject) => {
        pool.query(classement, [idEvent])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}



module.exports = {
    chercherClassement
}