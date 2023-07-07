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

/**Modifier */

/**Supprimer */

module.exports = {
    voirListeProjets
}