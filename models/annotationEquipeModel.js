/**
 * @fileoverview Models des annotations d'une équipes.
 */

const pool = require('../database/configDB');
const userModel = require('../models/userModel');
const { body } = require('express-validator');

async function validerAnnotation(req) {
    await body('contenu')
    .isLength({ min: 0, max: 2000 })
    .custom((value) => !(/^\s+$/.test(value)))
    .withMessage('Le message est trop long (maximum 2000 caractères)')
    .run(req);
}

/**
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Array} valeurs - Un tableau contenant les valeurs à insérer :
 *                         [idEquipe, auteur, contenu]
 * @description Cette fonction permet de créer une nouvelle annotation.
 * @returns {Object} Toutes les informations sur l'administrateur
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
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Int} idEquipe - identifiant de l'équipe
 * @description Cette fonction permet de chercher toutes les annotation d'une équipe.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau d'annotations associées à l'équipe.
 * @throws {Error} Une erreur si la récupération des annotations échoue.
*/
async function getAnnotationEquipes(idEquipe) {

    const chercher = `SELECT * FROM Annotation
    WHERE idEquipe = $1`;

        try {
            const res = await pool.query(chercher, [idEquipe])
            return res.rows;
        } catch (error) {
            throw error;
        }
}

/**
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @param {Int} idEquipe - identifiant de l'équipe
 * @description Cette fonction permet de créer un json personnalisé avec toutes les annotations de l'équipe
 * mais également des éléments en plus comme les noms et prénoms des auteurs.
 * @returns {Promise<Object>} - Une promesse résolue avec un objet JSON contenant les annotations au format détaillé.
 * @throws {Error} Une erreur si la récupération des annotations échoue.
*/
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
    }catch (error){
        throw error;
    }
}

module.exports = {
    creerAnnotation,
    jsonGetAnnotation,
    getAnnotationEquipes,
    validerAnnotation
}