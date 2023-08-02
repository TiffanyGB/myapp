/**
 * @fileoverview Models des annotations d'une équipes.
 * @module Annotation_équipes
 */

const pool = require('../database/configDB');
const userModel = require('../models/userModel');

/**
 * Créer une nouvelle annotation associée à une équipe.
 * 
 * Le controller lui passe en paramètres les informations à rentrer dans la table
 * Annotation.
 * 
 * @function
 * @param {Array} valeurs - Un tableau contenant les valeurs à insérer :
 *                         [idEquipe, auteur, contenu]
 * @throws {Error} Une erreur si la création de l'annotation échoue.
*/
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

/**
 * Récupérer les annotations associées à une équipe.
 * 
 * L'id de l'équipe souhaitée est récupéré du controller
 * 
 * @function
 * @param {number} idEquipe - L'identifiant de l'équipe pour laquelle récupérer les annotations.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau d'annotations associées à l'équipe.
 * @throws {Error} Une erreur si la récupération des annotations échoue.
*/
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

async function jsonGetAnnotation(idEquipe){

    try{
        const liste = await getAnnotationEquipes(idEquipe);

        const jsonRetour = {};
        jsonRetour.annotations = [];

        for(i = 0; i <liste.length; i++){

            let annotationCourante = liste[i];
            let temp = {};

            temp.contenu = annotationCourante.contenu;
            temp.date = annotationCourante.date_annotation;
        
            let user = (await userModel.chercherUserID(annotationCourante.auteur))[0];

            temp.auteur = '' + user.nom + ' ' + user.prenom;
            
            jsonRetour.annotations.push(temp)
        }

        return jsonRetour;
    }catch{

    }
}


module.exports = {
    creerAnnotation,
    jsonGetAnnotation
}