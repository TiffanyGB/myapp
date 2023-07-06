const pool = require('../../database/configDB')


/**Chercher les evenements */



/**Chercher les projets */
function tousLesProjets(){

    const projets = `SELECT * FROM Projet`;

    return new Promise((resolve, reject) => {
        pool.query(projets)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}


module.exports = {
    tousLesProjets
}