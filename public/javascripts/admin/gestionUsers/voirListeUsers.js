const pool = require('../../../../database/configDB');
const fi = require('../../index/fonctions_inscription');
const recherche = require('../../rechercheUsers');

async function envoyer_json_liste_user() {

    try {
        const listeUsers = await recherche.chercherUtilisateur();

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
                userInfos.ville = userCourant.ville;
                userInfos.github = userCourant.lien_github;
                userInfos.linkedin = userCourant.lien_linkedin;

                if (userCourant.typeuser === 'etudiant') {
                    let chercherStudent = await recherche.chercherStudent(userCourant.iduser);

                    if (chercherStudent === 0) {
                        return 'erreur_student'
                    } else {
                        etudiantCourant = chercherStudent[0];

                        userInfos.ecole = etudiantCourant.ecole;
                        userInfos.niveauEtude = etudiantCourant.niveau_etude;
                    }
                }

                if (userCourant.typeuser === 'gestionnaireExterne') {

                    let chercherGE = await recherche.chercherGestionnaireExterne(userCourant.iduser);

                    if (chercherGE === 0) {
                        return 'erreur_student'
                    } else {
                        let gex = chercherGE[0];

                        userInfos.entreprise = gex.entreprise;
                        userInfos.metier = gex.metier;
                    }
                }

                if (userCourant.typeuser === 'gestionnaireIA') {

                    let chercherGIA = await recherche.chercherGestionnaireIapau(userCourant.iduser);

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