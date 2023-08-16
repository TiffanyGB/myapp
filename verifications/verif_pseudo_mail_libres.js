/** 
 * @fileoverview Fonctions de vérification de l'existence des identifiants d'un utilisateur.
 * Ses fonctions permettent de vérifier si le pseudo et l'email que saisi un utilisateur lors de 
 * l'inscription ou création de compte n'existent pas. En effet, ses données sont censées être
 * uniques dans la base de données.
 * @module Inscription
 * 
 * @version 1.0.0 
 * @author Tiffany GAY-BELLILE
 * @requires ../../models/database/configDB
 */

const pool = require('../database/configDB');

/**
 * Vérifier si le pseudo en paramètre existe dans la base de données
 * 
 * @param {String} pseudo - L'objet requête Express.
 * @returns {Boolean} - Renvoie 'true' si le pseudo existe, 'false' sinon
 * @description Lors de la création d'un compte, il faut que le pseudo choisi soit unique. 
 * Cette fonction vérifie cela. 
 */
async function existePseudo(pseudo) {
  const verif = `SELECT * FROM utilisateur WHERE (pseudo = $1)`;

  try {
    const result = await pool.query(verif, [pseudo]);
    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
}

/**
 * Vérifier si l'adresse mail en paramètre existe dans la base de données.
 * 
 * @param {String} pseudo - L'objet requête Express.
 * @returns {Boolean} - Renvoie 'true' si le pseudo existe, 'false' sinon
 * @description Lors de la création d'un compte, il faut que l'adresse mail choisi soit unique. 
 * Cette fonction vérifie cela. 
 */
async function existeMail(mail) {
  const verif = `SELECT * FROM utilisateur WHERE (email = $1)`;

  try {
    const result = await pool.query(verif, [mail]);
    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }

}

module.exports = {
  existeMail,
  existePseudo,
}