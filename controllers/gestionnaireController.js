const gestionnaireModel = require('../models/gestionnaireModel');


/**Liste des gestionnaire IA et externes */
async function voirListeGestionnaires(req, res) {
    if (req.method === 'OPTION') {
        res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'GET') {

        try{
            const result = await gestionnaireModel.envoyer_json_liste_gestionnaires()

            return res.status(200).json(result);
        }catch{
            return res.status(500).json({ erreur: "Erreur lors de la récupération des gestionnaires." });
        }
    }
}
module.exports = {
    voirListeGestionnaires
}