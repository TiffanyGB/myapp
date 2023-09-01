/**
 * @fileoverview Contrôleur des annotations d'une équipes.
 * 
 * @version 1.0.0 
 * @author Tiffany GAY-BELLILE
 * @requires ../../models/annotationEquipeModel
 * @requires express-validator
 */

const annotationModel = require('../models/annotationEquipeModel');
const { validationResult } = require('express-validator');


/**
 * Contrôleur pour créer une nouvelle annotation associée à une équipe.
 * 
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @returns {Object} - Retourne un objet JSON avec un message indiquant si l'annotation a été créée
 * avec succès ou une erreur en cas d'échec.
 * @description  Contrôleur fait appel à la fonction de création d'une nouvelle annotation associée à une équipe.
 * 
 * Récupère les informations utiles à l'insertion dans la base de données:
 * 
 * Le contenu de l'annotation: est récupéré du body, message que laisse l'administrateur
 * ou le gestionnaire du projet,
 * L'id de l'équipe: Directement depuis l'url de la route,
 * L'id de l'auteur de l'annotation depuis son token.
 * 
 * Elle vérifie les données du body avec sa fonction de validation.
 * 
 * Accès à ce controller: Gestionnaires du projet et les administrateurs.
 * 
 * 
 * Route: annotation.js
 * 
*/
async function ecrireAnnotation(req, res) {

    if (req.method === 'OPTIONS') {
        res.status(200).json({ sucess: 'Access granted' });

    } else if (req.method === 'POST') {

        const idEquipe = res.locals.idEquipe;
        const auteur = req.id;
        let contenu = req.body.contenu;

        /*Supprimer les espcaces au début et à la fin de la chaîne de caractères */
        contenu = contenu.trim();

        await annotationModel.validerAnnotation(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errorDetected = true;
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            annotationModel.creerAnnotation([idEquipe, auteur, contenu]);
            return res.status(200).json({ message: 'Annotation créée.' });
        } catch (error) {
            return res.status(400).json({ error: 'Echec lors de la création de l\'annotation.' });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

/**
 * Contrôleur pour récupérer toutes les annotations associées à une équipe.
 * 
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @returns {Object} - Retourne un objet JSON contenant l'ensemble des annotations de l'équipe.
 * Si la requête échoue, code d'erreur 400 et message d'erreur.
 * @description  Ce contrôleur récupère l'ensemble des annotations liées à une équipe.
 * 
 * L'id de l'équipe est directement récupéré depuis l'url de la route.
 * 
 * Accès à ce controller: Gestionnaires du projet et les administrateurs.
 * 
 * Route: annotation.js

*/
async function getAnnotationEquipe(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ sucess: 'Access granted' });

    } else if (req.method === 'GET') {
        const idEquipe = res.locals.idEquipe;

        try {
            const annotation = await annotationModel.jsonGetAnnotation(idEquipe);

            /*On enlève le champs idAnnotation du json avant de l'envoyer au client,
            inutile pour lui */
            for (i = 0; i < annotation.length; i++) {
                delete annotation[i].idannotation;
            }
            return res.status(200).json(annotation);
        } catch {
            return res.status(400).json({ error: 'Echec lors de la création de l\'annotation.' });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

module.exports = {
    ecrireAnnotation,
    getAnnotationEquipe,
}