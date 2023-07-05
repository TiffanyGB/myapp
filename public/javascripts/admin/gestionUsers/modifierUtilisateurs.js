const pool = require('../../../../database/configDB');
const fi = require('../../index/fonctions_inscription');
const recherche = require('../../recherche');

async function modifierUser(idUser, valeurs){
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
        console.log("Mise à jour côté étudiant réussie");
    })
    .catch((error)=> {
        console.log(error);
    })
}

async function modifierEtudiant(idUser, valeurs, valeurs_etudiant) {

    try {
        modifierUser(idUser, valeurs)
        .then(() => {

            // const student = `UPDATE Etudiant
            // SET ecole = '${valeurs_etudiant[1]}',
            // code_postale_ecole = '${valeurs_etudiant[0]}',
            // niveau_etude = '${valeurs_etudiant[2]}' 
            // WHERE idEtudiant = ${idUser}`;

            // try{
            //     pool.query(student);
            //     console.log(reussi);
            // }
            // catch(error){
            //     console.error("Erreur lors de la mise à jour de l'étudiant", error);
            // }

        })
        .catch((error) =>{
            console.error("Erreur lors de la mise à jour de l'étudiant", error);
        });

        
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'étudiant", error);
        throw error;
    }

}

function modifierAdministrateur() {

}

function modifierExterne() {

}

function modifierIapau() { }

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