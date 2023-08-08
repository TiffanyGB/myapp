const pool = require('../database/configDB');


function recupererMot(idProjet) {

    const chercherMots = `SELECT * FROM mot_cle WHERE idProjet = $1`

    return new Promise((resolve, reject) => {
        pool.query(chercherMots, [idProjet])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**Insérer mot clé */
async function insererMot(valeurs) {
    const inserer = `INSERT INTO Mot_cle (mot, idProjet)
    VALUES ($1, $2)`;

    try {
        await pool.query(inserer, valeurs);
    }
    catch (error) {
        throw error;
    }
}

async function supprimerMot(idProjet) {

    const supprimer = `DELETE FROM Mot_cle 
    WHERE idProjet = $1`;

    try {
        pool.query(supprimer, [idProjet]);
    } catch (error) {
        throw error;
    }
}


module.exports = {
    recupererMot,
    insererMot,
    supprimerMot
}