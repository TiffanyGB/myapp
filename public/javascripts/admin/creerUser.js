const bcrypt = require('bcrypt');
const pool = require('../../../database/configDB');
const fi = require('../index/fonctions_inscription');



async function creerAdmin(values_user, values_id) {
    try {
        const libre = await fi.verifExistence(values_id);

        if(!libre){

            const existeP = await fi.existePseudo(values_id[0]);
            const existeM = await fi.existeMail(values_id[1]);
      
            if(existeM && existeP){
              return "les2";
            }
            else if (existeP) {
              return "pseudo";
            }else if (existeM) {
              return "mail";
            }
        }else{
            const inserer = await fi.insererUser(values_user, values_id, 'administrateur');
            if (inserer) {
                console.log('Admin inséré dans la table utilisateur');
                try {
                    const idUser = await fi.chercherUser(values_id[0]);
                    const requet = `INSERT INTO admini (idadmin) VALUES ('${idUser}')`;
                    await pool.query(requet);
                    return 'true';
                } catch (error) {
                    console.error('Erreur lors de l\'insertion des données côté admin :', error);
                    throw error;
                }
            } else {
                console.log('Insertion dans la table admin échouée');
                return 'erreur';
            }
        }

    } catch (err) {
        console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
    }
}

async function creerGestionnaireIA(values_user, values_id, role) {

    try {

        const libre = await fi.verifExistence(values_id);

        if(!libre){

            const existeP = await fi.existePseudo(values_id[0]);
            const existeM = await fi.existeMail(values_id[1]);
      
            if(existeM && existeP){
              return "les2";
            }
            else if (existeP) {
              return "pseudo";
            }else if (existeM) {
              return "mail";
            }
        }else{

            const inserer = await fi.insererUser(values_user, values_id, 'gestionnaireIA');
            if (inserer) {
                console.log('GestionnaireIA inséré dans la table utilisateur');
                try {
                    const idUser = await fi.chercherUser(values_id[0]);
                    const requet = `INSERT INTO Gestionnaire_iapau (id_g_iapau, role_asso) VALUES ('${idUser}', '${role}')`;
                    await pool.query(requet);
                    return 'true';
                }
                catch (error) {
                    console.error('Erreur lors de l\'insertion des données côté gestionnaire ia :', error);
                    throw error;
                }
            } else {
                console.log('Insertion dans la table gestionnaire ia échouée');
            }
        }
    } catch (err) {
        console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
    }
}

async function creerGestionnaireExterne(values_user, values_id, entreprise, metier) {

    try {
        const libre = await fi.verifExistence(values_id);
        if(!libre){
            const existeP = await fi.existePseudo(values_id[0]);
            const existeM = await fi.existeMail(values_id[1]);
    
      
            if(existeM && existeP){
              return "les2";
            }
            else if (existeP) {
              return "pseudo";
            }else if (existeM) {
              return "mail";
            }
        }else{

            const inserer = await fi.insererUser(values_user, values_id, 'gestionnaireExterne');
            if (inserer) {
                console.log('GestionnaireExterne inséré dans la table utilisateur');
                try {
                    const idUser = await fi.chercherUser(values_id[0]);
                    const requet = `INSERT INTO Gestionnaire_externe (id_g_externe, entreprise, metier) VALUES ('${idUser}', '${entreprise}', '${metier}')`;
                    await pool.query(requet);
                    return 'true';
                }
                catch (error) {
                    console.error('Erreur lors de l\'insertion des données côté gestionnaire externe :', error);
                    throw error;
                }
            } else {
                console.log('Insertion dans la table gestionnaire externe échouée');
            }
        }
    } catch (err) {
        console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
    }
}

async function creerEtudiant(values_user, values_id, entreprise, metier) {

    try {
        const libre = await fi.verifExistence(values_id);
        if(!libre){
            const existeP = await fi.existePseudo(values_id[0]);
            const existeM = await fi.existeMail(values_id[1]);
    
      
            if(existeM && existeP){
              return "les2";
            }
            else if (existeP) {
              return "pseudo";
            }else if (existeM) {
              return "mail";
            }
        }else{

            const inserer = await fi.insererUser(values_user, values_id, 'etudiant');
            if (inserer) {
                console.log('Etudiant inséré dans la table etudiant');
                try {
                    const idUser = await fi.chercherUser(values_id[0]);
                    const requet = `INSERT INTO Gestionnaire_externe (id_g_externe, entreprise, metier) VALUES ('${idUser}', '${entreprise}', '${metier}')`;
                    await pool.query(requet);
                    return 'true';
                }
                catch (error) {
                    console.error('Erreur lors de l\'insertion des données côté etudiant :', error);
                    throw error;
                }
            } else {
                console.log('Insertion dans la table etudiant échouée');
            }
        }
    } catch (err) {
        console.error('Erreur lors de l\'insertion de l\'utilisateur :', err);
    }
}

module.exports = {
    creerAdmin,
    creerGestionnaireIA,
    creerGestionnaireExterne,
    creerEtudiant
};