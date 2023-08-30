/**
 * @fileoverview Models des annotations d'une équipes.
 */

const pool = require('../database/configDB');

/**
 * Supprimer toutes les demandes d'admission d'un utilisteur.
 * 
 * Cette fonction est utilisée lorsque qu'un étudiant est accepté dans une équipe.
 * Les autres équipes qu'il a sollicitées ne verront plus ses demandes.
 * 
 * @function
 * @param {number} idUser - L'identifiant de l'utilisateur.
 * @throws {Error} Une erreur si la suppression des demandes échoue.
*/
function supprimerDemandes(idUser) {

    const supprimer = `DELETE FROM DemandeEquipe
    WHERE idUser = $1`;

    try {
        pool.query(supprimer, [idUser]);
    } catch (error) {
        throw (error);
    }
}

/**
 * Décliner une demande d'admission d'un utilisteur.
 * 
 * @function
 * @param {number} idUser - L'identifiant de l'utilisateur.
 * @param {number} idEquipe - L'identifiant de l'équipe.
 * @throws {Error} Une erreur si la suppression de la demande échoue.
*/
function declinerDemande(idUser, idEquipe) {

    const supprimer = `DELETE FROM DemandeEquipe
    WHERE idUser = $1 AND idEquipe = $2`;

    try {
        pool.query(supprimer, [idUser, idEquipe]);
    } catch (error) {
        throw (error);
    }
}

function envoyerDemande(valeurs) {

    const envoyer = `INSERT INTO DemandeEquipe
    (idUser, idEquipe, messageDemande)
    VALUES ($1, $2, $3)`;

    try {
        pool.query(envoyer, valeurs);
    } catch (error) {
        throw (error);
    }
}

async function demandeDejaEnvoyee(idUser, idEquipe) {

    const envoyee = `SELECT *
    FROM DemandeEquipe 
    WHERE idUser = $1 AND idEquipe = $2`;

    try {
        const res = await pool.query(envoyee, [idUser, idEquipe]);
        return res.rows;
    } catch (error) {
        throw (error);
    }
}

module.exports = {
    supprimerDemandes,
    declinerDemande,
    envoyerDemande,
    demandeDejaEnvoyee
}