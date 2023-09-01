const gestionnaireModel = require('../models/gestionnaireModel');

/**
 * @async
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @description Ce contrôleur permet de récupérer la liste des gestionnaires externes et internes.
 * Ceci est utile pour les affecter à des projets.
 * 
 * Accès à ce controller: Administrateurs.
 * 
 * Route: gestionnaires.js
 * @returns {Object} -JSON des informations ou message d'erreur si la 
 * requête échoue.
 *  
 */
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