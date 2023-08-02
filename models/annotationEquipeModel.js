/**
 * @fileoverview Models des annotations d'une équipes.
 * @module Annotation_équipes
 */

const pool = require('../database/configDB');

// * Elle récupère les informations du body récupérées par le controller et les insère
// * dans la table Annotation
function creerAnnotation(valeurs) {

    const inserer = `INSERT INTO Annotation
    (idEquipe, auteur, contenu)
    VALUES ($1, $2, $3)`;

    try {
        pool.query(inserer, valeurs);
    } catch (error) {
        throw error;
    }
}

async function getAnnotationEquipes(idEquipe) {

    const chercher = `SELECT * FROM Annotation
    WHERE idEquipe = $1`;

    return new Promise((resolve) => {
        try {
            pool.query(chercher, [idEquipe])
                .then((res) => {
                    resolve(res.rows);
                })

        } catch (error) {
            throw error;
        }
    });
}


module.exports = {
    creerAnnotation,
    getAnnotationEquipes
}