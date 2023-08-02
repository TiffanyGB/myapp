/**
 * @fileoverview Controllers des anno.
 * @module Annotation_équipes
 */

const annotationModel = require('../models/annotationEquipeModel');


/**
 * Controller pour créer une nouvelle annotation associée à une équipe.
 * 
 * Récupère les informations utiles à l'insertion dans la base de données:
 * 
 * Le contenu de l'annotation: Récupéré du body, message que laisse l'administrateur
 * ou le gestionnaire du projet,
 * L'id de l'équipe: Directement depuis l'url de la route,
 * L'id de l'auteur de l'annotation depuis son token.
 * 
 * L'appel du controller dans la route , se fait après l'appel de ces middlewares
 * la vérification du token, la vérification de l'existence de l'équipe et la vérification
 * du profil (dans cet ordre, les middlewares dépendants les uns des autres).
 * 
 * Accès à ce controller: Gestionnaires du projet et les administrateurs (verifProfil/)
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @returns {Object} - Retourne un objet JSON avec un message indiquant si l'annotation a été créée
 * avec succès ou une erreur en cas d'échec.
 * @throws {Error} Une erreur si la création de l'annotation échoue.
*/
function ecrireAnnotation(req, res) {

    if (req.method === 'OPTIONS') {

    } else if (req.method === 'POST') {
        const idEquipe = res.locals.idEquipe;
        const auteur = req.id;

        const contenu = req.body.contenu;

        try {
            annotationModel.creerAnnotation([idEquipe, auteur, contenu]);
            res.status(200).json({ message: 'Annotation créée.' });
        } catch {
            res.status(400).json({ error: 'Echec lors de la création de l\'annotation.' });
        }
    }
}


async function getAnnotationEquipe(req, res) {
    if (req.method === 'OPTIONS') {

    } else if (req.method === 'GET') {
        const idEquipe = res.locals.idEquipe;

        try {
            const annotation = await annotationModel.getAnnotationEquipes(idEquipe);
            for (i = 0; i < annotation.length; i++) {
                delete annotation[i].idannotation;
            }
            res.status(200).json(annotation);
        } catch {
            res.status(400).json({ error: 'Echec lors de la création de l\'annotation.' });
        }
    }
}


module.exports = {
    ecrireAnnotation,
    getAnnotationEquipe,
}