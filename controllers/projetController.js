const projetModel = require('../models/projetModel');
const motModel = require('../models/motCleModel');
const gererProjet = require('../models/gererProjet');
const gestionnaireExterneModel = require('../models/gestionnaireExterneModel');
const gestionnaireIaModel = require('../models/gestionnaireIaModel');
const ressourceModel = require('../models/ressourceModel');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');

/**Liste des projets */
async function voirListeProjets(req, res) {
    if (req.method === 'OPTION') {
        return res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'GET') {
        try {
            const jsonretour = await projetModel.listeProjetsJson(req)
            return res.status(200).json(jsonretour);
        } catch (error) {
            return res.status(400).json({ erreur: "Erreur lors de la récupération des données côté étudiant" });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

/**Informations d'un projet */
async function infosProjet(req, res) {
    if (req.method === 'OPTION') {
        return res.status(200).json({ success: 'Access granted' });
    } else if (req.method === 'GET') {
        const idProjet = res.locals.idProjet;

        try {
            const projetInfos = await projetModel.infosProjet(idProjet);
            return res.status(200).json(projetInfos);
        } catch (error) {
            return res.status(400).json({ erreur: "Erreur lors de la récupération des équipes" });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

/**Créer */
async function creationProjet(req, res) {
    if (req.method === 'OPTION') {
        return res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'POST') {

        const {
            nom,
            lienSujet,
            motClefs,
            Ressources,
            gestionnaireExterne,
            gestionnaireIA,
            recompense,
            description,
            image,
            template
        } = req.body;

        const valeurs_projets = [
            nom,
            description,
            recompense,
            lienSujet,
            image,
            template
        ];

        /*Vérification des données des mots-clés */
        if (motClefs.length > 0) {
            for (const mot of motClefs) {
                await body('motClefs')
                    .optional()
                    .notEmpty().withMessage('Le mot-clé ne doit pas être vide.')
                    .isLength({ min: 1, max: 25 }).withMessage('Le mot-clé doit avoir une longueur comprise entre 1 et 25 caractères.')
                    .run(req);

                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    errorDetected = true; // Marquer qu'une erreur a été détectée
                    return res.status(400).json({ errors: errors.array() });
                }
            }
        }

        for (const ressource of Ressources) {
            await body('Ressources')
                .optional()
                .isArray({ min: 1 }).withMessage('Le tableau des ressources ne doit pas être vide.')
                .run(req);

            await body('Ressources.*.nom')
                .notEmpty().withMessage('Le nom des ressources est obligatoire.')
                .isLength({ min: 2, max: 100 }).withMessage('Le nom des ressources doit avoir une longueur comprise entre 3 et 100 caractères.')
                .run(req);

            await body('Ressources.*.type')
                .notEmpty().withMessage('Le type des ressources est obligatoire.')
                .matches(/^(video|lien|drive|téléchargment)$/).withMessage('Le type doit avoir "video", "lien", "drive" ou "téléchargement".')
                .isLength({ min: 2, max: 18 })
                .run(req);

            await body('Ressources.*.lien')
                .notEmpty().withMessage('Le lien des ressources est obligatoire.')
                .isURL()
                .isLength({ min: 3, max: 2000 }).withMessage('Le lien de la ressource doit  être valide.')
                .run(req);
            await body('Ressources.*.description')
                .notEmpty().withMessage('La description des ressources est obligatoire.')
                .isLength({ min: 10, max: 10000 }).withMessage('La description de la ressource doit avoir une longueur comprise entre 10 et 10000 caractères.')
                .run(req);
            await body('Ressources.*.consultation')
                .notEmpty().withMessage('La consultation des ressources ne doit pas être vide.')
                .matches(/^(privé|public)$/).withMessage('Le consultation des ressources doit être "privé" ou "public".')
                .isLength({ min: 2, max: 6 })
                .run(req);

            await body('Ressources.*.publication')
                .notEmpty().withMessage('La date de publication des ressources ne doit pas être vide.')
                .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
                .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('La date ne doit contenir que des lettres et des chiffres.')
                .run(req);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errorDetected = true; // Marquer qu'une erreur a été détectée
                return res.status(400).json({ errors: errors.array() });
            }
        }

        /*Vérification des données des gestionnaires, les id doivent être des entiers
        et doivent correspondre à des gestionnaires */
        for (const element of gestionnaireExterne) {
            const parsedElement = parseInt(element, 10);

            if (!Number.isInteger(parsedElement)) {
                return res.status(400).json({ message: "Un élément du tableau des gestionnaires n'est pas un entier." })
            }

            let user = await gestionnaireExterneModel.chercherGestionnaireExtID(parsedElement);

            if (user.length === 0) {
                return res.status(400).json({ erreur: "Aucun gestionnaire externe ne possède l'id " + parsedElement + "." })
            }
        }

        for (const element of gestionnaireIA) {
            const parsedElement = parseInt(element, 10);

            if (!Number.isInteger(parsedElement)) {
                return res.status(400).json({ message: "Un élément du tableau des gestionnaires n'est pas un entier." })
            }

            let user = await gestionnaireIaModel.chercherGestionnaireIapau(element);

            if (user.length === 0) {
                return res.status(400).json({ erreur: "Aucun gestionnaire externe ne possède l'id " + element + "." })
            }
        }

        try {
            /*On crée le projet et on récupère son id dans la bdd */
            const projetInsertion = await projetModel.creerProjet(valeurs_projets);
            if (typeof projetInsertion === 'number') {

                /*Insertion des mots-clés */
                for (let i = 0; i < motClefs.length; i++) {
                    let motValeurs = [motClefs[i], projetInsertion];
                    await motModel.insererMot(motValeurs);
                }

                /*Attribution du projet aux gestionnaires */
                for (let i = 0; i < gestionnaireExterne.length; i++) {
                    let id = gestionnaireExterne[i];
                    await gererProjet.attribuerProjetExterne(projetInsertion, id);
                }
                for (let i = 0; i < gestionnaireIA.length; i++) {
                    let id2 = gestionnaireIA[i];
                    await gererProjet.attribuerProjetIA(projetInsertion, id2);
                }

                /*Insertion des ressources */
                for (let i = 0; i < Ressources.length; i++) {
                    let courant = Ressources[i];
                    let valeurs_ressources = [
                        courant.nom,
                        courant.type,
                        courant.lien,
                        courant.publication,
                        courant.consultation,
                        courant.description,
                        projetInsertion
                    ];
                    ressourceModel.ajouterRessources(valeurs_ressources);
                }

                return res.status(200).json({ message: "Projet créé" });
            }
            return res.status(400).json({ message: "Problème lors de la récupération de l'id du projet" });
        } catch (error) {
            return res.status(400).json({ erreur: "Erreur lors de la création du projet" });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

/**Modifier */
async function modifierProjet(req, res) {
    if (req.method === 'OPTION') {
        return res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'PATCH') {

        const idProjet = res.locals.idProjet;
        const data = req.body;

        try {

            const valeurs_projets = [
                data.nom,
                data.description,
                data.recompense,
                data.lienSujet,
                data.image,
                idProjet
            ];

            /*Vérification des données des mots-clés */
            if (data.motClefs.length > 0) {
                for (const mot of data.motClefs) {
                    await body('motClefs')
                        .optional()
                        .notEmpty().withMessage('Le mot-clé ne doit pas être vide.')
                        .isLength({ min: 1, max: 25 }).withMessage('Le mot-clé doit avoir une longueur comprise entre 1 et 25 caractères.')
                        .run(req);

                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        errorDetected = true; // Marquer qu'une erreur a été détectée
                        return res.status(400).json({ errors: errors.array() });
                    }
                }
            }

            for (const ressource of data.Ressources) {
                await body('Ressources')
                    .optional()
                    .isArray({ min: 1 }).withMessage('Le tableau des ressources ne doit pas être vide.')
                    .run(req);

                await body('Ressources.*.nom')
                    .notEmpty().withMessage('Le nom des ressources est obligatoire.')
                    .isLength({ min: 2, max: 100 }).withMessage('Le nom des ressources doit avoir une longueur comprise entre 3 et 100 caractères.')
                    .run(req);

                await body('Ressources.*.type')
                    .notEmpty().withMessage('Le type des ressources est obligatoire.')
                    .matches(/^(video|lien|drive|téléchargment)$/).withMessage('Le type doit avoir "video", "lien", "drive" ou "téléchargement".')
                    .isLength({ min: 2, max: 18 })
                    .run(req);

                await body('Ressources.*.lien')
                    .notEmpty().withMessage('Le lien des ressources est obligatoire.')
                    .isURL()
                    .isLength({ min: 3, max: 2000 }).withMessage('Le lien de la ressource doit  être valide.')
                    .run(req);
                await body('Ressources.*.description')
                    .notEmpty().withMessage('La description des ressources est obligatoire.')
                    .isLength({ min: 10, max: 10000 }).withMessage('La description de la ressource doit avoir une longueur comprise entre 10 et 10000 caractères.')
                    .run(req);
                await body('Ressources.*.consultation')
                    .notEmpty().withMessage('La consultation des ressources ne doit pas être vide.')
                    .matches(/^(privé|public)$/).withMessage('Le consultation des ressources doit être "privé" ou "public".')
                    .isLength({ min: 2, max: 6 })
                    .run(req);

                await body('Ressources.*.publication')
                    .notEmpty().withMessage('La date de publication des ressources ne doit pas être vide.')
                    .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
                    .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('La date ne doit contenir que des lettres et des chiffres.')
                    .run(req);

                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    errorDetected = true; // Marquer qu'une erreur a été détectée
                    return res.status(400).json({ errors: errors.array() });
                }

            }

            /*Vérification des données des gestionnaires, les id doivent être des entiers
            et doivent correspondre à des gestionnaires */
            for (const element of data.gestionnaireExterne) {
                const parsedElement = parseInt(element, 10);

                if (!Number.isInteger(parsedElement)) {
                    return res.status(400).json({ message: "Un élément du tableau des gestionnaires n'est pas un entier." })
                }

                let user = await gestionnaireExterneModel.chercherGestionnaireExtID(parsedElement);

                if (user.length === 0) {
                    return res.status(400).json({ erreur: "Aucun gestionnaire externe ne possède l'id " + parsedElement + "." })
                }
            }

            for (const element of data.gestionnaireIA) {
                const parsedElement = parseInt(element, 10);

                if (!Number.isInteger(parsedElement)) {
                    return res.status(400).json({ message: "Un élément du tableau des gestionnaires n'est pas un entier." })
                }

                let user = await gestionnaireIaModel.chercherGestionnaireIapau(element);

                if (user.length === 0) {
                    return res.status(400).json({ erreur: "Aucun gestionnaire externe ne possède l'id " + element + "." })
                }
            }
            projetModel.modifierProjet(valeurs_projets)

            /**Supprimer anciennes données */
            gererProjet.destituerProjetExterne(idProjet);
            gererProjet.destituerProjetIa(idProjet);
            motModel.supprimerMot(idProjet);
            ressourceModel.supprimerRessources(idProjet);

            for (i = 0; i < data.motClefs.length; i++) {
                let motValeurs = [data.motClefs[i], idProjet];
                motModel.insererMot(motValeurs);
            }
            for (let i = 0; i < data.gestionnaireExterne.length; i++) {

                let id = data.gestionnaireExterne[i];
                gererProjet.attribuerProjetExterne(idProjet, id);
            }
            for (let i = 0; i < data.gestionnaireIA.length; i++) {
                let id2 = data.gestionnaireIA[i];
                gererProjet.attribuerProjetIA(idProjet, id2);
            }

            for (i = 0; i < data.Ressources.length; i++) {

                let courant = data.Ressources[i];

                let valeurs_ressources = [
                    courant.nom,
                    courant.type,
                    courant.lien,
                    courant.publication,
                    courant.consultation,
                    courant.description,
                    idProjet
                ]

                ressourceModel.ajouterRessources(valeurs_ressources);
            }
            return res.status(200).json({ message: "Projet modifié" });
        } catch (error) {
            return res.status(400).json({ erreur: "Le projet n'a pas pu être modifié" });
        }
    }
}

/**Supprimer */
async function supprimerProjet(req, res) {
    if (req.method === 'OPTION') {
        return res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'DELETE') {

        const idProjet = res.locals.idProjet;

        try {
            await projetModel.supprimerProjet(idProjet);
            return res.status(200).json({ message: "Suppression réussie" });

        } catch {
            return res.status(500).json({ erreur: 'Erreur lors de la suppression du projet' });
        }
    }
}

module.exports = {
    voirListeProjets,
    creationProjet,
    supprimerProjet,
    modifierProjet,
    infosProjet
}