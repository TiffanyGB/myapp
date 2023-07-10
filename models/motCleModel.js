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


/**Insérer mot clé */
async function insererMot(valeurs){
    const inserer = `INSERT INTO Mot_cle (mot, idProjet)
    VALUES ($1, $2)`;

    try {
        await pool.query(inserer, valeur_projet);
        return 'ok';
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des données côté etudiant :', error);
        throw error;
    }

}


module.exports = {
    recupererMot,
    insererMot
}