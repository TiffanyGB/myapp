/**
 * @fileoverview Model des administrateurs.
 */

const pool = require('../database/configDB');


/**
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Int} id - Identifiant de l'utilisateur à insérer dans la table des administrateurs
 * @description Cette fonction permet de créer un nouvel administrateur.
 * @throws {Error} Si la création échoue.
*/
async function creerAdmin(id) {
    const requet = `INSERT INTO Admini (idAdmin) VALUES ($1)`;

    try {
        pool.query(requet, [id]);
    }
    catch (error) {
        throw error;
    }
}

/**
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Int} id - Identifiant de l'utilisateur à rechercher
 * @description Cette fonction permet de trouver un administrateur.
 * @returns {Object} Toutes les informations sur l'administrateur
 * @throws {Error} Si la recherche échoue.
*/
async function chercherAdminID(idUser) {
    const users = 'SELECT * FROM Admini WHERE idAdmin = $1';

    try {
        const chercher = await pool.query(users, [idUser]);
        return chercher.rows;

    } catch (error) {
        throw error;
    }
}


module.exports = {
    creerAdmin,
    chercherAdminID
}