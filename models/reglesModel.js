const pool = require('../database/configDB');

/**Récupérer une regle à partir de l'id de l'event */
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

/**Ajouter une regle à un event */
function ajouterRegle(idEvent, titre, contenu) {

    const valeur = [titre, contenu, idEvent];

    const ajouter = `INSERT INTO Regle (titre, contenu, idevent)
    VALUES ($1, $2, $3)`;

    return new Promise((resolve, reject) => {
        pool.query(ajouter, valeur)
            .then(() => {
                resolve('true');
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function supprimerRegles(idEvent) {

    const supprimer = `DELETE FROM Regle 
    WHERE idEvent = $1`;

    try {
        pool.query(supprimer, [idEvent]);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    recuperer_regles,
    ajouterRegle,
    supprimerRegles
}