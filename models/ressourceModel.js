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
async function recuperer_ressourcesPubliques(idProjet) {

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = $1 AND statut = 'public'`;

    try{
        const chercher = await pool.query(chercherRessources, [idProjet]);
        return chercher.rows;
    }catch (error){
        throw (error);
    }
}

/**Ressources privées */
async function recuperer_ressourcesPrivees(idProjet) {

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = $1 and statut= 'privé'`;

    try{
        const chercher = await pool.query(chercherRessources, [idProjet]);
        return chercher.rows;
    }catch (error){
        throw (error);
    }
}

/**toutes les ressources d'un projet */
async function recuperer_toutes_ressources(idProjet) {

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = $1`;

    try {
        const chercher = await pool.query(chercherRessources, [idProjet])
        return chercher.rows;
    } catch (error) {
        throw error;
    }
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