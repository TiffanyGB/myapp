const pool = require('../database/configDB');

function supprimerDemandes(idUser) {

    const supprimer = `DELETE FROM DemandeEquipe
    WHERE idUser = $1`;

    try {
        pool.query(supprimer, [idUser]);
    } catch (error) {
        throw (error);
    }
}

function declinerDemande(idUser, idEquipe) {

    const supprimer = `DELETE FROM DemandeEquipe
    WHERE idUser = $1 AND idEquipe = $2`;

    try {
        pool.query(supprimer, [idUser, idEquipe]);
    } catch (error) {
        throw (error);
    }
}

module.exports = {
    supprimerDemandes,
    declinerDemande
}