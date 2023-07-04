const pool = require('../../../../database/configDB');
const fi = require('../../index/fonctions_inscription');
const recherche = require('../../recherche');

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

                userInfos.nom = userCourant.nom;
                userInfos.prenom = userCourant.prenom;
                userInfos.pseudo = userCourant.pseudo;
                userInfos.role = userCourant.typeuser;
                userInfos.mail = userCourant.email;
                userInfos.dateCreation = userCourant.date_inscription;
                userInfos.ville = userCourant.ville;
                userInfos.github = userCourant.github;
                userInfos.linkedin = userCourant.linkedin;


                if (userCourant.typeuser === 'etudiant') {
                    let chercherStudent = await recherche.chercherUtilisateur(userCourant.iduser, 'Etudiant');

                    if (chercherStudent === 0) {
                        return 'erreur_student'
                    } else {
                        etudiantCourant = chercherStudent[0];

                        userInfos.ecole = etudiantCourant.ecole;
                        userInfos.niveauEtude = etudiantCourant.niveau_etude;
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