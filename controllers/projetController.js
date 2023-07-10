const projetModel = require('../models/projetModel');

/**Liste des projets */
function voirListeProjets(req, res) {

    if (req.userProfile === 'admin') {
        if (req.method === 'OPTION') {
            res.status(200).json({ sucess: 'Agress granted' });
        }
        else if (req.method === 'GET') {


            projetModel.listeProjetsJson()
                .then((result) => {
                    if (result === 'aucun') {
                        res.status(400).json({ erreur: "Erreur lors de la récupération des utilisateurs" })
                    } else if (result === "erreur_student") {
                        res.status(400).json({ erreur: "Erreur lors de la récupération des données côté étudiant" })
                    } else {
                        res.status(200).json(result);
                    }
                });

        }
    } else if (req.userProfile === 'etudiant') {

        res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "etudiant" });
    } else if (req.userProfile === 'gestionnaire') {

        res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "gestionnaire" });
    } else if (req.userProfile === 'aucun') {

        res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "Aucun" });
    }
}

/**Créer */
async function creerProjet(req, res) {

    if (req.userProfile === 'admin') {
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


            try{
                const projetInsertion = await projetModel.creerProjet(valeurs_projets);
                if(projetInsertion === 'ok'){
                    res.status(200).json({message: "ok"});
                }
            }catch{
                res.status(400).json({erreur: "erreur"});
            }

        }
    } else if (req.userProfile === 'etudiant') {

        res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "etudiant" });
    } else if (req.userProfile === 'gestionnaire') {

        res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "gestionnaire" });
    } else if (req.userProfile === 'aucun') {

        res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "Aucun" });
    }
}

/**Modifier */

/**Supprimer */

module.exports = {
    voirListeProjets,
    creerProjet
}