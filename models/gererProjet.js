/**
 * @fileoverview Fonctions intéragissant avec la BDD pour la gestion des projets des gestionnaires.
 * @module Projet
 */

const pool = require('../database/configDB');

/**
 * Chercher les gestionnaires IA associés à un projet.
 *
 * Cette fonction effectue une requête SQL pour récupérer les gestionnaires IA à partir de la table Gerer_ia_pau
 * en fonction de l'identifiant du projet.
 *
 * @async
 * @function
 * @param {number} idProjet - L'identifiant du projet pour lequel chercher les gestionnaires IA.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau contenant les informations des gestionnaires IA associés au projet.
 *                           - Si aucun gestionnaire IA n'est trouvé, la promesse est résolue avec un tableau vide.
 * @throws {Error} Une erreur si la requête de récupération échoue.
 */
async function chercherGestionnaireIA(idProjet) {
    try {
        const valeurs = [idProjet];

        const attribuer = `SELECT * FROM Gerer_ia_pau 
        WHERE idProjet = $1`;

        return new Promise((resolve, reject) => {
            pool.query(attribuer, valeurs)
                .then((res) => {
                    resolve(res.rows);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Chercher les gestionnaires externes associés à un projet en fonction de leur identifiant.
 *
 * Cette fonction effectue une requête SQL pour récupérer les gestionnaires externes à partir de la table Gerer_externe
 * en fonction de l'identifiant du projet et de l'identifiant du gestionnaire externe.
 *
 * @async
 * @function
 * @param {number} idProjet - L'identifiant du projet pour lequel chercher les gestionnaires externes.
 * @param {number} idGestionnaire - L'identifiant du gestionnaire externe à chercher.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau contenant les informations des gestionnaires externes associés au projet.
 *                           - Si aucun gestionnaire externe n'est trouvé, la promesse est résolue avec un tableau vide.
 * @throws {Error} Une erreur si la requête de récupération échoue.
 *
 */
async function chercherGestionnaireExtID(idProjet, idGestionnaire) {
    try {
        const valeurs = [idProjet, idGestionnaire];

        const attribuer = `SELECT * FROM Gerer_externe 
        WHERE idProjet = $1 and id_g_externe = $2`;

        return new Promise((resolve, reject) => {
            pool.query(attribuer, valeurs)
                .then((res) => {
                    resolve(res.rows);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Chercher les gestionnaires IA associés à un projet en fonction de leur identifiant.
 *
 * Cette fonction effectue une requête SQL pour récupérer les gestionnaires IA à partir de la table Gerer_ia_pau
 * en fonction de l'identifiant du projet et de l'identifiant du gestionnaire IA.
 *
 * @async
 * @function
 * @param {number} idProjet - L'identifiant du projet pour lequel chercher les gestionnaires IA.
 * @param {number} idGestionnaire - L'identifiant du gestionnaire IA à chercher.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau contenant les informations des gestionnaires IA associés au projet.
 *                           - Si aucun gestionnaire IA n'est trouvé, la promesse est résolue avec un tableau vide.
 * @throws {Error} Une erreur si la requête de récupération échoue.
 */

async function chercherGestionnaireIAID(idProjet, idGestionnaire) {
    try {
        const valeurs = [idProjet, idGestionnaire];

        const attribuer = `SELECT * FROM Gerer_ia_pau 
        WHERE idProjet = $1 and id_g_iapau = $2`;

        return new Promise((resolve, reject) => {
            pool.query(attribuer, valeurs)
                .then((res) => {
                    resolve(res.rows);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Chercher les gestionnaires externes associés à un projet.
 *
 * Cette fonction effectue une requête SQL pour récupérer les gestionnaires externes à partir de la table Gerer_externe
 * en fonction de l'identifiant du projet.
 *
 * @async
 * @function
 * @param {number} idProjet - L'identifiant du projet pour lequel chercher les gestionnaires externes.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau contenant les informations des gestionnaires externes associés au projet.
 *                           - Si aucun gestionnaire externe n'est trouvé, la promesse est résolue avec un tableau vide.
 * @throws {Error} Une erreur si la requête de récupération échoue.
 */
async function chercherGestionnaireExt(idProjet) {
    try {
        const valeurs = [idProjet];

        const attribuer = `SELECT * FROM Gerer_externe 
        WHERE idProjet = $1`;

        return new Promise((resolve, reject) => {
            pool.query(attribuer, valeurs)
                .then((res) => {
                    resolve(res.rows);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Attribuer un projet à un gestionnaire IA.
 *
 * Cette fonction effectue une requête SQL pour attribuer un projet à un gestionnaire IA en insérant une entrée dans la table Gerer_ia_pau.
 *
 * @async
 * @function
 * @param {number} idProjet - L'identifiant du projet à attribuer.
 * @param {number} idGestionnaire - L'identifiant du gestionnaire IA auquel attribuer le projet.
 * @returns {Promise<string>} - Une promesse résolue avec la chaîne de caractères 'ok' si l'attribution réussit.
 * @throws {Error} Une erreur si l'attribution échoue.
 */
async function attribuerProjetIA(idProjet, idGestionnaire) {

    try {
        const valeurs = [idGestionnaire, idProjet];

        const attribuer = `INSERT INTO Gerer_ia_pau (id_g_iapau, idProjet)
        VALUES ($1, $2)`;

        pool.query(attribuer, valeurs);
    } catch (error) {
        throw error;
    }
}

/**
 * Attribuer un projet à un gestionnaire externe.
 *
 * Cette fonction effectue une requête SQL pour attribuer un projet à un gestionnaire externe en insérant une entrée dans la table Gerer_externe.
 *
 * @async
 * @function
 * @param {number} idProjet - L'identifiant du projet à attribuer.
 * @param {number} idGestionnaire - L'identifiant du gestionnaire externe auquel attribuer le projet.
 * @returns {Promise<string>} - Une promesse résolue avec la chaîne de caractères 'ok' si l'attribution réussit.
 * @throws {Error} Une erreur si l'attribution échoue.
 */
async function attribuerProjetExterne(idProjet, idGestionnaire) {

    try {
        const valeurs = [idGestionnaire, idProjet];

        const attribuer = `INSERT INTO Gerer_externe (id_g_externe, idProjet)
        VALUES ($1, $2)`;

        pool.query(attribuer, valeurs);
    } catch (error) {
        throw error;
    }
}

/**
 * Destituer un projet d'un gestionnaire externe.
 *
 * Cette fonction effectue une requête SQL pour destituer un projet d'un gestionnaire externe en supprimant l'entrée correspondante de la table Gerer_externe.
 *
 * @async
 * @function
 * @param {number} idProjet - L'identifiant du projet à destituer.
 * @throws {Error} Une erreur si la destitution échoue.
 */
async function destituerProjetExterne(idProjet) {

    try {

        const destituer = `DELETE FROM Gerer_externe 
        WHERE idProjet = $1`;

        pool.query(destituer, [idProjet]);

    } catch (error) {
        throw error;
    }
}

/**
 * Destituer un projet d'un gestionnaire IA.
 *
 * Cette fonction effectue une requête SQL pour destituer un projet d'un gestionnaire IA en supprimant l'entrée correspondante de la table Gerer_ia_pau.
 *
 * @async
 * @function
 * @param {number} idProjet - L'identifiant du projet à destituer.
 * @throws {Error} Une erreur si la destitution échoue.
 */
async function destituerProjetIa(idProjet) {

    try {

        const destituer = `DELETE FROM Gerer_ia_pau 
        WHERE idProjet = $1`;

        pool.query(destituer, [idProjet]);

    } catch (error) {
        throw error;
    }
}

module.exports = {
    attribuerProjetIA,
    attribuerProjetExterne,
    destituerProjetExterne,
    destituerProjetIa,
    chercherGestionnaireExt,
    chercherGestionnaireIA,
    chercherGestionnaireExtID,
    chercherGestionnaireIAID
}