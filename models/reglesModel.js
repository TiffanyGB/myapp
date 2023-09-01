const pool = require('../database/configDB');
const { body } = require('express-validator');

async function validerRegles(req) {
    body('titre')
        .notEmpty().withMessage('Le titre ne doit pas être vide.')
        .custom((value) => !(/^\s+$/.test(value)))
        .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit avoir une longueur comprise entre 2 et 50 caractères.')
        .run(req);

    body('contenu')
        .notEmpty().withMessage('La règle ne doit pas être vide.')
        .custom((value) => !(/^\s+$/.test(value)))
        .isLength({ min: 2, max: 1000 }).withMessage('Le lien doit avoir une longueur comprise entre 3 et 1000 caractères.')
        .run(req);
}

/**
 * Récupère les règles associées à un événement en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idEvent - Identifiant de l'événement.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau de règles associées à l'événement.
 * @throws {Error} Une erreur si la récupération des règles échoue.
 */
async function recuperer_regles(idEvent) {

    const chercherProjets = `SELECT * FROM Regle WHERE idevent = $1`

    try {
        const chercher = await pool.query(chercherProjets, [idEvent]);
        return chercher.rows;
    } catch (error) {
        throw (error);
    }
}

/**
 * Ajoute une règle à un événement.
 * @function
 * @param {number} idEvent - Identifiant de l'événement auquel ajouter la règle.
 * @param {string} titre - Le titre de la règle.
 * @param {string} contenu - Le contenu de la règle.
 * @throws {Error} Une erreur si l'ajout de la règle échoue.
 */
function ajouterRegle(idEvent, titre, contenu) {

    const valeur = [titre, contenu, idEvent];

    const ajouter = `INSERT INTO Regle (titre, contenu, idevent)
    VALUES ($1, $2, $3)`;

    try{
        pool.query(ajouter, valeur);
    }catch (error){
        throw error;
    }
}

/**
 * Supprime toutes les règles associées à un événement en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idEvent - Identifiant de l'événement.
 * @throws {Error} Une erreur si la suppression des règles échoue.
 */
async function supprimerRegles(idEvent) {

    const supprimer = `DELETE FROM Regle 
    WHERE idEvent = $1`;

    try {
        pool.query(supprimer, [idEvent]);
    } catch (error) {
        throw error;
    }
}


module.exports = {
    recuperer_regles,
    ajouterRegle,
    supprimerRegles,
    validerRegles,
}