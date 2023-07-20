const gestionnaireModel = require('../models/gestionnaireModel');


/**Liste des gestionnaire IA et externes */
function voirListeGestionnaires(req, res) {
    if (req.method === 'OPTION') {
        res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'GET') {

        gestionnaireModel.envoyer_json_liste_gestionnaires()
            .then((result) => {
                if (result === 'aucun_gestionnaires') {
                    res.status(200).json({ gestionnaires: [] });
                } else if (result === "error_no_user") {
                    res.status(400).json({ erreur: "Aucun utilisateur ne possède l'id du gestionnaire" })
                } else {
                    res.status(200).json(result);
                }
            })
            .catch(() => {
                res.status(500).json({ erreur: "Erreur lors de la récupération des gestionnaires." });
            });
    }
}
module.exports = {
    voirListeGestionnaires
}