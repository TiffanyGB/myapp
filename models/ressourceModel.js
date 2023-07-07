const pool = require('../database/configDB');

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
    recuperer_ressourcesPrivees
}