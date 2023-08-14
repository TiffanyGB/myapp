const projetModel = require('../models/projetModel');
const motModel = require('../models/motCleModel');
const gererProjet = require('../models/gererProjet');
const gestionnaireExterneModel = require('../models/gestionnaireExterneModel');
const gestionnaireIaModel = require('../models/gestionnaireIaModel');
const ressourceModel = require('../models/ressourceModel');
const { body } = require('express-validator');
const { validateurErreurs } = require('../validateur');


/**Liste des projets */
async function voirListeProjets(req, res) {
    if (req.method === 'OPTION') {
        res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'GET') {

        /*Récupérer la liste des projets */
        try {
            const jsonretour = await projetModel.listeProjetsJson(req)
            res.status(200).json(jsonretour);
        } catch (error) {
            res.status(400).json({ erreur: "Erreur lors de la récupération des données côté étudiant" });
        }
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
    }
}


/**Créer */
async function creationProjet(req, res) {
    if (req.method === 'OPTION') {
        res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'POST') {

        /**Vérifier ces valeurs */
        const {
            nom,
            lienSujet,
            motClefs,
            Ressources,
            gestionnaireExterne,
            gestionnaireIA,
            recompense,
            description,
            image
        } = req.body;
        const valeurs_projets = [
            nom,
            description,
            recompense,
            lienSujet,
            image
        ];

        /*Vérification des données des mots-clés */
        if (motClefs.length > 0) {
            for (const mot of motClefs) {
                await body('motClefs')
                    .optional()
                    .notEmpty().withMessage('Le mot-clé ne doit pas être vide.')
                    .isLength({ min: 2, max: 25 }).withMessage('Le mot-clé doit avoir une longueur comprise entre 2 et 25 caractères.')
                    .run(req);

                validateurErreurs(req, res);
            }
        }

        for (const ressource of Ressources) {
            await body('Ressources')
                .optional()
                .isArray({ min: 1 }).withMessage('Le tableau des ressources ne doit pas être vide.')
                .run(req);

            await body('Ressources.*.nom')
                .notEmpty().withMessage('Le nom ne doit pas être vide.')
                .isLength({ min: 2, max: 100 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 100 caractères.')
                .run(req);

            await body('Ressources.*.type')
                .notEmpty().withMessage('Le type ne doit pas être vide.')
                .matches(/^(video|lien|drive|téléchargment)$/).withMessage('Le type doit avoir "video", "lien", "drive" ou "téléchargement".')
                .isLength({ min: 2, max: 18 })
                .run(req);

            await body('Ressources.*.lien')
                .notEmpty().withMessage('Le nom ne doit pas être vide.')
                .isURL()
                .isLength({ min: 3, max: 1000 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 1000 caractères.')
                .run(req);
            await body('Ressources.*.description')
                .notEmpty().withMessage('La description est obligatoire.')
                .isLength({ min: 10, max: 10000 }).withMessage('La description doit avoir une longueur comprise entre 10 et 10000 caractères.')
                .run(req);
            await body('Ressources.*.consultation')
                .notEmpty().withMessage('La consultation ne doit pas être vide.')
                .matches(/^(privé|public)$/).withMessage('Le type doit avoir "privé", "public".')
                .isLength({ min: 2, max: 6 })
                .run(req);

            await body('Ressources.*.publication')
                .notEmpty().withMessage('La date ne doit pas être vide.')
                .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
                .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('La date ne doit contenir que des lettres et des chiffres.')
                .run(req);

            validateurErreurs(req, res);
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

    }
}

/**Modifier */
async function modifierProjet(req, res) {
    if (req.method === 'OPTION') {
        res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'PATCH') {

        const idProjet = res.locals.idProjet;

        try {
            // Vérifier que l'id existe dans la bdd, sinon 404 error
            const user = await projetModel.chercheridProjet(idProjet);
            if (user.length === 0) {
                return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
            }

            const {
                nom,
                lienSujet,
                motClefs,
                Ressources,
                gestionnaireExterne,
                gestionnaireIA,
                recompense,
                description,
                image
            } = req.body;


            const valeurs_projets = [
                nom,
                description,
                recompense,
                lienSujet,
                image,
                idProjet
            ];


            if (motClefs.length > 0) {
                for (const mot of motClefs) {
                    await body('motClefs')
                        .optional()
                        .notEmpty().withMessage('Le mot-clé ne doit pas être vide.')
                        .isLength({ min: 2, max: 25 }).withMessage('Le mot-clé doit avoir une longueur comprise entre 2 et 25 caractères.')
                        .run(req);

                    validateurErreurs(req, res);
                }
            }

            for (const ressource of Ressources) {
                await body('Ressources')
                    .optional()
                    .isArray({ min: 1 }).withMessage('Le tableau des ressources ne doit pas être vide.')
                    .run(req);

                await body('Ressources.*.nom')
                    .notEmpty().withMessage('Le nom ne doit pas être vide.')
                    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit avoir une longueur comprise entre 3 et 100 caractères.')
                    .run(req);

                await body('Ressources.*.type')
                    .notEmpty().withMessage('Le type ne doit pas être vide.')
                    .matches(/^(video|lien|drive|téléchargement)$/).withMessage('Le type doit avoir "vidéo", "lien", "drive" ou "téléchargement".')
                    .isLength({ min: 2, max: 18 })
                    .run(req);

                await body('Ressources.*.lien')
                    .notEmpty().withMessage('Le lien ne doit pas être vide.')
                    .isURL().withMessage('Le lien de chaque ressource doit être un lien valide.')
                    .isLength({ min: 3, max: 1000 }).withMessage('Le lien doit avoir une longueur comprise entre 3 et 1000 caractères.')
                    .run(req);
                await body('Ressources.*.description')
                    .notEmpty().withMessage('La description est obligatoire.')
                    .isLength({ min: 10, max: 10000 }).withMessage('La description doit avoir une longueur comprise entre 10 et 10000 caractères.')
                    .run(req);
                await body('Ressources.*.consultation')
                    .notEmpty().withMessage('La consultation ne doit pas être vide.')
                    .matches(/^(privé|public)$/).withMessage('Le type doit avoir "privé", "public".')
                    .isLength({ min: 2, max: 6 })
                    .run(req);

                await body('Ressources.*.publication')
                    .notEmpty().withMessage('La date ne doit pas être vide.')
                    .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
                    .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('La date ne doit contenir que des lettres et des chiffres.')
                    .run(req);

                validateurErreurs(req, res);
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
            projetModel.modifierProjet(valeurs_projets)
                .then(() => {

                    /**Supprimer anciennes données */
                    gererProjet.destituerProjetExterne(idProjet);
                    gererProjet.destituerProjetIa(idProjet);
                    motModel.supprimerMot(idProjet);
                    ressourceModel.supprimerRessources(idProjet);

                    for (i = 0; i < motClefs.length; i++) {
                        let motValeurs = [motClefs[i], idProjet];
                        motModel.insererMot(motValeurs);
                    }
                    for (let i = 0; i < gestionnaireExterne.length; i++) {

                        let id = gestionnaireExterne[i];
                        gererProjet.attribuerProjetExterne(idProjet, id);
                    }
                    for (let i = 0; i < gestionnaireIA.length; i++) {
                        let id2 = gestionnaireIA[i];
                        gererProjet.attribuerProjetIA(idProjet, id2);
                    }

                    for (i = 0; i < Ressources.length; i++) {

                        let courant = Ressources[i];

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
                })
                .catch(() => {
                    return res.status(400).json({ erreur: "Le projet n'a pas pu être modifié" });
                });
        } catch {
            return res.status(400).json({ erreur: "erreur" });
        }
    }
}

/**Supprimer */
async function supprimerProjet(req, res) {
    if (req.method === 'OPTION') {
        res.status(200).json({ sucess: 'Agress granted' });
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