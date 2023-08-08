const pool = require('../database/configDB');

function ajouterRessources(valeurs) {

    const ajouter = `INSERT INTO Ressource (titre, type_ressource, lien, date_apparition, statut, description_ressource, idProjet)
    VALUES ($1,$2,$3,$4,$5,$6, $7) `;

    try {
        pool.query(ajouter, valeurs);

    } catch (error) {
        throw error;
    }
}

/**Ressources publiques */
function recuperer_ressourcesPubliques(idProjet) {

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = $1 AND statut = 'public'`;

    return new Promise((resolve, reject) => {
        pool.query(chercherRessources, [idProjet])
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

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = $1 and statut= 'privé'`;

    return new Promise((resolve, reject) => {
        pool.query(chercherRessources, [idProjet])
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

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = $1`;

    return new Promise((resolve, reject) => {
        pool.query(chercherRessources, [idProjet])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function supprimerRessources(idProjet) {
    const supprimer = `DELETE FROM Ressource
    WHERE idProjet = $1`;

    try {
        pool.query(supprimer, [idProjet]);

    } catch (error) {
        throw error;
    }
}

module.exports = {
    recuperer_ressourcesPubliques,
    recuperer_toutes_ressources,
    recuperer_ressourcesPrivees,
    ajouterRessources,
    supprimerRessources,
}