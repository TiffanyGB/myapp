const projetModel = require('../models/projetModel');
const motModel = require('../models/motCleModel');
const gererProjet = require('../models/gererProjet');
const ressourceModel = require('../models/ressourceModel');


/**Liste des projets */
function voirListeProjets(req, res) {
    if (req.method === 'OPTION') {
        res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'GET') {

        /*Récupérer la liste des projets */
        projetModel.listeProjetsJson(req)
            .then((result) => {
                /**Aucun projet dans la bdd */
                if (result === 'aucun') {
                    res.status(200).json([]);
                } else if (result === "erreur_student") {
                    res.status(400).json({ erreur: "Erreur lors de la récupération des données côté étudiant" });
                } else {
                    res.status(200).json(result);
                }
            });
    }
}

/**Informations d'un projet */
async function infosProjet(req, res) {
    if (req.method === 'OPTION') {
        return res.status(200).json({ success: 'Access granted' });
    } else if (req.method === 'GET') {
        const idProjet = res.locals.projetId;

        try {
            const result = await projetModel.chercherProjetId(idProjet);
            if (result.length === 0) {
                return res.status(404).json({ erreur: "L'id n'existe pas" });
            }

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
            description
        } = req.body;
        const valeurs_projets = [
            nom,
            description,
            recompense,
            lienSujet
        ];


        try {
            const projetInsertion = await projetModel.creerProjet(valeurs_projets);
            if (typeof projetInsertion === 'number') {
                for (let i = 0; i < motClefs.length; i++) {
                    let motValeurs = [motClefs[i], projetInsertion];
                    await motModel.insererMot(motValeurs);
                }
                for (let i = 0; i < gestionnaireExterne.length; i++) {
                    let id = gestionnaireExterne[i].id;
                    await gererProjet.attribuerProjetExterne(projetInsertion, id);
                }
                for (let i = 0; i < gestionnaireIA.length; i++) {
                    let id2 = gestionnaireIA[i].id;
                    await gererProjet.attribuerProjetIA(projetInsertion, id2);
                }
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
                    await ressourceModel.ajouterRessources(valeurs_ressources);
                }

                res.status(200).json({ message: "Projet créé" });
            } else {
                res.status(400).json({ message: "Problème lors de la récupération de l'id du projet" });
            }
        } catch (error) {
            res.status(400).json({ erreur: "Erreur lors de la création du projet" });
        }

    }
}
/**Modifier */
async function modifierProjet(req, res) {
    if (req.method === 'OPTION') {
        res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'PATCH') {

        const projetId = res.locals.projetId;

        try {
            // Vérifier que l'id existe dans la bdd, sinon 404 error
            const user = await projetModel.chercherProjetId(projetId);
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
                description
            } = req.body;


            const valeurs_projets = [
                nom,
                description,
                recompense,
                lienSujet,
                projetId
            ];


            projetModel.modifierProjet(valeurs_projets)
                .then(() => {

                    /**Supprimer anciennes données */
                    gererProjet.destituerProjetExterne(projetId);
                    gererProjet.destituerProjetIa(projetId);
                    motModel.supprimerMot(projetId);
                    ressourceModel.supprimerRessources(projetId);


                    for (i = 0; i < motClefs.length; i++) {
                        let motValeurs = [motClefs[i], projetId];
                        motModel.insererMot(motValeurs);
                    }

                    for (i = 0; i < gestionnaireExterne.length; i++) {

                        let id = gestionnaireExterne[i].id;

                        gererProjet.attribuerProjetExterne(projetId, id);
                    }

                    for (i = 0; i < gestionnaireIA.length; i++) {

                        let id2 = gestionnaireIA[i].id;

                        gererProjet.attribuerProjetIA(projetId, id2);
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
                            projetId
                        ]

                        ressourceModel.ajouterRessources(valeurs_ressources);

                    }

                    return res.status(200).json({ message: "Projet modifié" });
                })
                .catch(() => {
                    return res.status(400).json({ erreur: "Le projet n'a pas pu être modifié" });
                });

        } catch {
            return res.status(400).json({ erreur: "erreur", idErreur: "1" });
        }
    }
}

/**Supprimer */
async function supprimerProjet(req, res) {
    if (req.method === 'OPTION') {
        res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'DELETE') {

        const projetId = res.locals.projetId;

        try {
            /* Vérifier que l'id existe dans la bdd, sinon 404 error*/
            const user = await projetModel.chercherProjetId(projetId);
            if (user.length === 0) {
                return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
            }

            /* Supprimer projet*/
            await projetModel.supprimerProjet(projetId);
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