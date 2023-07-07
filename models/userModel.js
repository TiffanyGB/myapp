const pool = require('../database/configDB');
const recherche = require('../public/javascripts/rechercheUsers');
const passwordModel = require('../models/passwordModel');


/**Liste des utilisateurs  */
function chercherListeUtilisateurs() {

    const users = `SELECT * FROM Utilisateur`;

    return new Promise((resolve, reject) => {
        pool.query(users)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**Chercher un utilisateur par son id*/
function chercherUserID(idUser) {
    const users = 'SELECT * FROM Utilisateur WHERE idUser = $1';
    const params = [idUser];

    return new Promise((resolve, reject) => {
        pool.query(users, params)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**Chercher un utilisateur par son pseudo */


/**Créer un utilisateur */


/**Modifier un utilisateur */
async function modifierUser(idUser, valeurs, password) {
    const temp = await chercherUserID(idUser);

    infoUser = temp[0];

    const modif = `UPDATE Utilisateur 
    SET typeUser = '${valeurs[0]}', 
    nom = '${valeurs[1]}',
    prenom = '${valeurs[2]}',
    pseudo = '${valeurs[3]}',
    email = '${valeurs[4]}'
    WHERE idUser = '${idUser}'`;


    pool.query(modif)
        .then(() => {
            if(password != ''){
                passwordModel.salageMdp(password)
                .then((hashedPassword) => {
                  insererMdp(hashedPassword, idUser);
                  console.log('Mot de passe inséré avec succès');

                })
            }else{
                console.log('Pas de modif de mdp');
            }
            console.log("Mise à jour côté Utilisateur réussie");
        })
        .catch((error) => {
            console.log(error);
        })
}

/**Supprimer */
//Doit être Etudiant, admini, gestionnaire_iapau ou gestionnaire_externe
function supprimerUser(idUser, role) {

    let id;
    switch (role) {
        case 'idadmin':
            id = 'idadmin';
            break;
        case 'etudiant':
            id = 'idetudiant';
            break;
        case 'gestionnaire_iapau':
            id = 'id_g_iapau';
            break;
        case 'gestionnaire_externe':
            id = 'id_g_externe';
            break;
    }

    const suppRole = `DELETE FROM ${role} WHERE $1 = '${idUser}'`;
    const suppr = `DELETE FROM Utilisateur WHERE idUser = '${idUser}'`;

    return new Promise((resolve, reject) => {
        pool.query(suppRole, [id])
            .then(() => {
                pool.query(suppr)
                    .then(() => {
                        resolve('ok');
                    })
                    .catch((error) => {
                        reject(error);
                    });
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**Valider les données */


/**JSON de la liste des utilisateurs */
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
    chercherListeUtilisateurs,
    chercherUserID,
    envoyer_json_liste_user,
    supprimerUser,
    modifierUser
}