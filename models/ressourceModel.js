const pool = require('../database/configDB');


function ajouterRessources(valeurs) {

    const ajouter = `INSERT INTO Ressource (titre, type_ressource, lien, date_apparition, statut, description_ressource, idProjet)
    VALUES ($1,$2,$3,$4,$5,$6, $7) `;

    try {
        pool.query(ajouter, valeurs);

    } catch(error) {
        throw error;
    }
}

/**Ressources publiques */
function recuperer_ressourcesPubliques(idProjet) {

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = ${idProjet} AND statut = 'public'`;

    return new Promise((resolve, reject) => {
        pool.query(chercherRessources)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**Ressources privées */
function recuperer_ressourcesPrivees(idProjet) {

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = ${idProjet} and statut= 'privé'`;

    return new Promise((resolve, reject) => {
        pool.query(chercherRessources)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**toutes les ressources d'un projet */
function recuperer_toutes_ressources(idProjet) {

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = '${idProjet}'`;

    return new Promise((resolve, reject) => {
        pool.query(chercherRessources)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

module.exports = {
    recuperer_ressourcesPubliques,
    recuperer_toutes_ressources,
    recuperer_ressourcesPrivees,
    ajouterRessources
}