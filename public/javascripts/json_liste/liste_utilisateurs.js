const verifExistenceController = require('../../../controllers/Auth/verificationExistenceController');

const userModel = require('../../../models/userModel');
const etudiantmodel = require('../../../models/etudiantModel');
const gestionnaireExterneModel = require('../../../models/gestionnaireExterneModel');
const gestionnaireIAModel = require('../../../models/gestionnaireIaModel');


/**JSON de la liste des utilisateurs */
async function envoyer_json_liste_user() {

    try {
        const listeUsers = await userModel.chercherListeUtilisateurs();

        jsonRetour = {};
        jsonRetour.utilisateurs = [];

        if (listeUsers === 0) {
            json.message = "Aucun utilisateur";
            return 'aucun';
        } else {

            for (i = 0; i < listeUsers.length; i++) {

                let userCourant = listeUsers[i];
                let userInfos = {};

                userInfos.id = userCourant.iduser;
                userInfos.nom = userCourant.nom;
                userInfos.prenom = userCourant.prenom;
                userInfos.pseudo = userCourant.pseudo;
                userInfos.role = userCourant.typeuser;
                userInfos.mail = userCourant.email;
                userInfos.dateCreation = userCourant.date_inscription;

                if( userCourant.ville === null){
                    userInfos.ville = '';

                }else{
                    userInfos.ville = userCourant.ville;
                }

                if( userCourant.lien_github === null){
                    userInfos.github = '';

                }else{
                    userInfos.github = userCourant.lien_github;
                }

                if( userCourant.lien_linkedin === null){
                    userInfos.linkedin = '';

                }else{
                    userInfos.linkedin = userCourant.lien_linkedin;
                }

                if (userCourant.typeuser === 'etudiant') {
                    let chercherStudent = await etudiantmodel.chercherStudent(userCourant.iduser);

                    if (chercherStudent === 0) {
                        return 'erreur_student'
                    } else {
                        etudiantCourant = chercherStudent[0];

                        userInfos.niveauEtude = etudiantCourant.niveau_etude;
                        userInfos.ecole = etudiantCourant.ecole;
                    }
                }

                if (userCourant.typeuser === 'gestionnaireExterne') {

                    let chercherGE = await gestionnaireExterneModel.chercherGestionnaireExtID(userCourant.iduser);

                    if (chercherGE === 0) {
                        return 'erreur_student'
                    } else {
                        let gex = chercherGE[0];

                        userInfos.entreprise = gex.entreprise;
                        userInfos.metier = gex.metier;
                    }
                }

                if (userCourant.typeuser === 'gestionnaireIA') {

                    let chercherGIA = await gestionnaireIAModel.chercherGestionnaireIapau(userCourant.iduser);

                    if (chercherGIA === 0) {
                        return 'erreur_student'
                    } else {
                        let gia = chercherGIA[0];

                        userInfos.role_asso = gia.role_asso;
                    }
                }
                jsonRetour.utilisateurs.push(userInfos);
            }
            return jsonRetour;
        }
    } catch (error) {
        throw error;
    }
}


module.exports = {
    envoyer_json_liste_user
}
