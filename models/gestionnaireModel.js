const gestionnaireExterneModel = require('./gestionnaireExterneModel');
const gestionnaireIaModel = require('./gestionnaireIaModel');
const userModel = require('./userModel');


/*JSON de la liste des gestionnaires externes et internes
 * Pour la gestion des projets
 */
async function envoyer_json_liste_gestionnaires() {

    try {

        let jsonRetour = {};
        jsonRetour.gestionnairesExternes = [];
        jsonRetour.gestionnairesIa = [];

        /*Liste des gestionnaires externes et internes */
        const listeGExt = await gestionnaireExterneModel.chercherListeGestionnairesExt();
        const listeGIa = await gestionnaireIaModel.chercherListeGestionnaireIapau();


        /*Externes */
        if (listeGExt.length > 0) {

            for (i = 0; i < listeGExt.length; i++) {

                tempInfo = {};

                let gestionnaireCourant = listeGExt[i];
                let idCourant = gestionnaireCourant.id_g_externe;

                /**Chercher les infos du gestionnaire externe dans la table utilisateur */
                let userCourant = await userModel.chercherUserID(idCourant);

                /**Erreur pas d'utilisateur associé*/
                if (userCourant.length === 0) {
                    throw(error);
                }

                for (j = 0; j < userCourant.length; j++) {

                    tempInfo.Nom = userCourant[0].nom;
                    tempInfo.Prenom = userCourant[0].prenom;
                    tempInfo.Mail = userCourant[0].email;
                }

                tempInfo.id = gestionnaireCourant.id_g_externe;
                tempInfo.Entreprise = gestionnaireCourant.entreprise;
                tempInfo.Metier = gestionnaireCourant.metier;

                jsonRetour.gestionnairesExternes.push(tempInfo);
            }
        }

        /*IA Pau*/
        if (listeGIa.length > 0) {

            for (i = 0; i < listeGIa.length; i++) {

                tempInfo = {};

                let gestionnaireCourant = listeGIa[i];
                let idCourant = gestionnaireCourant.id_g_iapau;

                /**Chercher les infos du gestionnaire externe dans la table utilisateur */
                let userCourant = await userModel.chercherUserID(idCourant);

                for (j = 0; j < userCourant.length; j++) {

                    tempInfo.Nom = userCourant[0].nom;
                    tempInfo.Prenom = userCourant[0].prenom;
                    tempInfo.Mail = userCourant[0].email;

                }

                tempInfo.id = gestionnaireCourant.id_g_iapau;
                tempInfo.Entreprise = 'IA-Pau';
                tempInfo.Metier = gestionnaireCourant.role_asso;

                jsonRetour.gestionnairesIa.push(tempInfo);
            }
        }
        return jsonRetour;

    } catch (error) {
        throw error;
    }
}

module.exports = {
    envoyer_json_liste_gestionnaires
}