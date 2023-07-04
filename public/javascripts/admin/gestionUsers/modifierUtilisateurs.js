const pool = require('../../../../database/configDB');
const fi = require('../../index/fonctions_inscription');

async function modifierUser(idUser, valeurs, valeurs_etudiant) {

    const temp = await recherche.chercherUserID(idUser);

    infoUser = temp[0];

    if(valeurs[0] == infoUser.typeUser){
        //Modifier type
    } 

    if(valeurs[1] != infoUser.nom){
        //modifier le nom avec update
    }

    if(valeurs[2] != infoUser.prenom){
        //modifier prenom
    }

    // if(valeurs[3] != infoUser.)

    const modif = `UPDATE Utilisateur 
        SET typeUser = $1, 
        nom = $2,
        prenom = $3,
        pseudo = $4,
        email = $5,
        WHERE idUser = ${idUser}`;

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
    modifierUser,
    supprimerUser
}