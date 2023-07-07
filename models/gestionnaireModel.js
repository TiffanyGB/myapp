const { json } = require('body-parser');
const pool = require('../database/configDB');
const gestionnaireExterneModel = require('./gestionnaireExterneModel');
const gestionnaireIaModel = require('./gestionnaireIaModel');
const userModel = require('./userModel');


/**JSON de la liste des utilisateurs */
async function envoyer_json_liste_gestionnaires() {

    try {

        let jsonRetour = {};
        jsonRetour.gestionnaires = [];

        const listeGExt = await gestionnaireExterneModel.chercherListeGestionnairesExt();
        const listeGIa = await gestionnaireIaModel.chercherListeGestionnaireIapau();

        if (listeGExt.length === 0 && listeGIa.length === 0) {
            return 'aucun_gestionnaires';
        }

        if (listeGExt.length > 0) {

            for (i = 0; i < listeGExt.length; i++) {

                tempInfo = {};

                let gestionnaireCourant = listeGExt[i];
                let idCourant = gestionnaireCourant.id_g_externe;

                /**Chercher les infos du gestionnaire externe dans la table utilisateur */
                let userCourant = await userModel.chercherUserID(idCourant);

                /**Erreur pas d'utilisateur associé*/
                if (userCourant.length === 0) {
                    return 'error_no_user';
                }

                for (j = 0; j < userCourant.length; j++) {

                    tempInfo.nom = userCourant[0].nom;
                    tempInfo.Prenom = userCourant[0].prenom;
                    tempInfo.Mail = userCourant[0].email;

                }

                tempInfo.id = gestionnaireCourant.id_g_externe;
                tempInfo.Entreprise = gestionnaireCourant.entreprise;
                tempInfo.Metier = gestionnaireCourant.metier;

                jsonRetour.gestionnaires.push(tempInfo);
            }
        }

        if (listeGIa.length > 0) {

            for (i = 0; i < listeGIa.length; i++) {

                tempInfo = {};

                let gestionnaireCourant = listeGIa[i];
                let idCourant = gestionnaireCourant.id_g_iapau;

                /**Chercher les infos du gestionnaire externe dans la table utilisateur */
                let userCourant = await userModel.chercherUserID(idCourant);

                /**Erreur pas d'utilisateur associé*/
                if (userCourant.length === 0) {
                    return 'error_no_user';
                }

                for (j = 0; j < userCourant.length; j++) {

                    tempInfo.nom = userCourant[0].nom;
                    tempInfo.Prenom = userCourant[0].prenom;
                    tempInfo.Mail = userCourant[0].email;

                }

                tempInfo.id = gestionnaireCourant.id_g_iapau;
                tempInfo.Entreprise = 'IA-Pau';
                tempInfo.Metier = gestionnaireCourant.role_asso;

                jsonRetour.gestionnaires.push(tempInfo);
            }
        }

        console.log(jsonRetour);
        return jsonRetour;

    } catch (error) {
        throw error;
    }
}


module.exports = {
    envoyer_json_liste_gestionnaires
}