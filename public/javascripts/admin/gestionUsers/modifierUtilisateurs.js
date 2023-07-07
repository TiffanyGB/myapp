const pool = require('../../../../database/configDB');
const fi = require('../../index/fonctions_inscription');
const recherche = require('../../rechercheUsers');
const utilisateurModel = require('../../../../controllers/passwordController');


function insererMdp(mdp, id) {

    const inserer = `UPDATE utilisateur
        SET hashMdp = '${mdp}'
        WHERE idUser='${id}'`;
  
    pool.query(inserer)
      .catch((error) => {
        console.error('Fichier "' + __filename + '" fonction: "' + arguments.callee.name + ':\nErreur lors de l\'insertion du mot de passe:', error);
      });
  }

async function modifierUser(idUser, valeurs, password) {
    const temp = await recherche.chercherTableUserID(idUser);

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
                utilisateurModel.salageMdp(password)
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

async function modifierEtudiant(idUser, valeurs, valeurs_etudiant, password) {

    try {
        modifierUser(idUser, valeurs, password)
            .then(() => {

                const student = `UPDATE Etudiant
            SET ecole = '${valeurs_etudiant[1]}',
            niveau_etude = '${valeurs_etudiant[2]}' 
            WHERE idEtudiant = ${idUser}`;

                console.log()
                try {
                    pool.query(student);
                    console.log("reussi");
                }
                catch (error) {
                    console.error("Erreur lors de la mise à jour de l'étudiant", error);
                }

            })
            .catch((error) => {
                console.error("Erreur lors de la mise à jour de l'étudiant", error);
            });


    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'étudiant", error);
        throw error;
    }

}

async function modifierAdministrateur(idUser, valeurs, password) {

    try {
        modifierUser(idUser, valeurs, password);

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'admin", error);
        throw error;
    }
}

async function modifierExterne(idUser, valeurs, metier, entreprise, password) {

    try {
        modifierUser(idUser, valeurs, password)
            .then(() => {

                const student = `UPDATE Gestionnaire_externe
            SET entreprise = '${entreprise}',
            metier = '${metier}' 
            WHERE id_g_externe = ${idUser}`;

                console.log()
                try {
                    pool.query(student);
                    console.log("reussi");
                }
                catch (error) {
                    console.error("Erreur lors de la mise à jour du gestionnaire externe", error);
                }

            })
            .catch((error) => {
                console.error("Erreur lors de la mise à jour u gestionnaire externe", error);
            });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du gestionnaire externe", error);
        throw error;
    }
}

async function modifierIapau(idUser, valeurs, role_asso, password) {
    try {
        modifierUser(idUser, valeurs, password)
            .then(() => {

                const student = `UPDATE Gestionnaire_iapau
                SET role_asso = '${role_asso}'
                WHERE id_g_iapau = ${idUser}`;

                console.log()
                try {
                    pool.query(student);
                    console.log("reussi");
                }
                catch (error) {
                    console.error("Erreur lors de la mise à jour du gestionnaire iapau", error);
                }

            })
            .catch((error) => {
                console.error("Erreur lors de la mise à jour du gestionnaire iapau", error);
            });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du gestionnaire iapau", error);
        throw error;
    }
}

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

module.exports = {
    modifierEtudiant,
    supprimerUser,
    modifierAdministrateur,
    modifierExterne,
    modifierIapau
}