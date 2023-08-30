/**
 * @fileoverview Model des administrateurs.
 */

const pool = require('../database/configDB');
const userModel = require('./userModel');


/**
 * Création d'un administrateur.
 * 
 * Insert dans la table 'Admini' un nouvel admin
 * @async
 * @param {Array} values_user - Les valeurs des champs utilisateur.
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

/**Chercher un admin par son id*/
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