/**
 * @fileoverview Fonctions liées au classement d'un évènement.
 * @module Evenement
 */

const pool =require('../database/configDB');

/**
 * Récupérer le classement associé à un événement.
 * 
 * Cette fonction effectue une requête SQL pour récupérer le classement à partir de la table Resultat
 * en fonction de l'identifiant de l'événement.
 * 
 * @function
 * @async
 * @param {number} idEvent - L'identifiant de l'événement pour lequel récupérer le classement.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau contenant le classement associé à l'événement.
 *                          - Si aucun classement n'est trouvé, la promesse est résolue avec un tableau vide.
 * @throws {Error} Une erreur si la requête de récupération échoue.
 */
function chercherClassement(idEvent) {
    const classement = `SELECT classement FROM Resultat WHERE idevent = $1`;

    return new Promise((resolve, reject) => {
        try{
            pool.query(classement, [idEvent])
            .then((res) => {
                resolve(res.rows);
            });
        }catch (error){
            throw error;
        }
    });
}


module.exports = {
    chercherClassement
}