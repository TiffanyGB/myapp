const userModel = require('../../../models/userModel');
const etudiantmodel = require('../../../models/etudiantModel');
const gestionnaireExterneModel = require('../../../models/gestionnaireExterneModel');
const gestionnaireIAModel = require('../../../models/gestionnaireIaModel');

/* **************************** A déplacer dans un model ************************************/
/******************************************************************************************** */
/******************************************************************************************** */


/**JSON de la liste des utilisateurs */
async function envoyer_json_liste_user() {

    try {
        const listeUsers = await userModel.chercherListeUtilisateurs();

        /**Json contenant les informations des utilisateurs */
        jsonRetour = {};
        jsonRetour.utilisateurs = [];

        /*Parcours des utilisateurs, on récupère les informations de chacun*/
        for (i = 0; i < listeUsers.length; i++) {

            let userCourant = listeUsers[i];
            let userInfos = {};

            /**Infos d'un user (commun) */
            userInfos.id = userCourant.iduser;
            userInfos.nom = userCourant.nom;
            userInfos.prenom = userCourant.prenom;
            userInfos.pseudo = userCourant.pseudo;
            userInfos.role = userCourant.typeuser;
            userInfos.mail = userCourant.email;
            userInfos.dateCreation = userCourant.date_inscription;

            if (userCourant.ville === null) {
                userInfos.ville = '';

            } else {
                userInfos.ville = userCourant.ville;
            }

            if (userCourant.lien_github === null) {
                userInfos.github = '';

            } else {
                userInfos.github = userCourant.lien_github;
            }

            if (userCourant.lien_linkedin === null) {
                userInfos.linkedin = '';

            } else {
                userInfos.linkedin = userCourant.lien_linkedin;
            }

            /**Infos d'un étudiant */
            if (userCourant.typeuser === 'etudiant') {
                let chercherStudent = await etudiantmodel.chercherStudent(userCourant.iduser);

                if (chercherStudent === 0) {
                    return 'erreur_user'
                } else {
                
                    etudiantCourant = chercherStudent[0];
                    userInfos.niveauEtude = etudiantCourant.niveau_etude;
                    userInfos.ecole = etudiantCourant.ecole;
                }
            }



            /**Infos d'un gestionnaire externe */
            if (userCourant.typeuser === 'gestionnaireExterne') {

                let chercherGE = await gestionnaireExterneModel.chercherGestionnaireExtID(userCourant.iduser);

                if (chercherGE === 0) {
                    return 'erreur_user'
                } else {
                    let gex = chercherGE[0];

                    userInfos.entreprise = gex.entreprise;
                    userInfos.metier = gex.metier;
                }
            }

            /**Infos d'un gestionnaire IA pau */
            if (userCourant.typeuser === 'gestionnaireIA') {

                let chercherGIA = await gestionnaireIAModel.chercherGestionnaireIapau(userCourant.iduser);

                if (chercherGIA === 0) {
                    return 'erreur_user'
                } else {
                    let gia = chercherGIA[0];

                    userInfos.role_asso = gia.role_asso;
                }
            }
            jsonRetour.utilisateurs.push(userInfos);
        }
        return jsonRetour;

    } catch (error) {
        throw error;
    }
}


module.exports = {
    envoyer_json_liste_user
}
