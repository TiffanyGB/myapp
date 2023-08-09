/**
 * @fileoverview Model des administrateurs.
 * @module Gestion_des_utilisateurs
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


/**Modifier un admin */
async function modifierAdministrateur(idUser, valeurs, password) {

    try {
        userModel.modifierUser(idUser, valeurs, password);
    } catch (error) {
        throw error;
    }
}


module.exports = {
    creerAdmin,
    chercherAdminID,
    modifierAdministrateur
}
