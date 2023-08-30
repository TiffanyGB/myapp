const gestionnaireModel = require('../models/gestionnaireModel');

/**Liste des gestionnaire IA et externes */
async function voirListeGestionnaires(req, res) {
    if (req.method === 'OPTION') {
        return res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'GET') {

        try {
            const result = await gestionnaireModel.envoyer_json_liste_gestionnaires()

            return res.status(200).json(result);
        } catch (error){
            return res.status(500).json({ erreur: "Erreur lors de la récupération des gestionnaires." });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}
module.exports = {
    voirListeGestionnaires
}