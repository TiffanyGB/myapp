const pool = require('../database/configDB');

/**
 * Récupère les mots-clés associés à un projet.
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {number} idProjet - Identifiant du projet.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau de mots-clés associés au projet.
 * @throws {Error} Une erreur si la récupération des mots-clés échoue.
 */
async function recupererMot(idProjet) {

    const chercherMots = `SELECT * FROM mot_cle WHERE idProjet = $1`

    try {
        const chercher = await pool.query(chercherMots, [idProjet]);
        return chercher.rows;
    }catch (error){
        throw error;
    }
}

/**
 * Insère un mot-clé associé à un projet.
 * @async
 * @function
 * @param {Array} valeurs - Un tableau contenant les valeurs à insérer : [mot, idProjet].
 * @throws {Error} Une erreur si l'insertion du mot-clé échoue.
 */
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

/**
 * Supprime tous les mots-clés associés à un projet.
 * @async
 * @function
 * @param {number} idProjet - Identifiant du projet.
 * @throws {Error} Une erreur si la suppression des mots-clés échoue.
 */
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