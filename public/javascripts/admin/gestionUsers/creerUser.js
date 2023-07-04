/**
 * @fileoverview Fichier contenant les fonctions liées à la création des utilisateurs en tant qu'adminisnitrateur.
 * Les 4 types d'utilisateurs: gestionnaire IA Pau, gestionnaire externe, étudiant, administrateur
 * @module Contrôleur/Admin
 * 
 */

const pool = require('../../../../database/configDB');
const fi = require('../../index/fonctions_inscription');


/**
 * Création d'un administrateur
 * @async
 * @param {Array} values_user - Les valeurs des champs utilisateur.
 * @param {Array} values_id - Les valeurs des champs identifiant (pseudo et email).
 * @returns {string} - Résultat de la création de l'administrateur.
 * - 'true' si l'administrateur a été créé avec succès.
 * - 'erreur' en cas d'échec de l'insertion dans la table admin.
 * - 'les2' si à la fois le pseudo et l'email existent déjà.
 * - 'pseudo' si le pseudo existe déjà.
 * - 'mail' si l'email existe déjà.
 */
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

/**
 * Crée un nouveau gestionnaire IA.
 * @async
 * @param {Array} values_user - Les valeurs des champs utilisateur.
 * @param {Array} values_id - Les valeurs des champs identifiant (pseudo et email).
 * @param {string} role - Le rôle du gestionnaire IA au sein de l'association.
 * @returns {string} - Résultat de la création du gestionnaire IA.
 * - 'true' si le gestionnaire IA a été créé avec succès.
 * - 'erreur' en cas d'échec de l'insertion dans la table gestionnaire ia.
 * - 'les2' si à la fois le pseudo et l'email existent déjà.
 * - 'pseudo' si le pseudo existe déjà.
 * - 'mail' si l'email existe déjà.
 */
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

/**
 * Crée un nouveau gestionnaire externe.
 * @async
 * @param {Array} values_user - Les valeurs des champs utilisateur.
 * @param {Array} values_id - Les valeurs des champs identifiant (pseudo et email).
 * @param {string} entreprise - L'entreprise du gestionnaire externe.
 * @param {string} metier - Le métier du gestionnaire externe.
 * @returns {string} - Résultat de la création du gestionnaire externe.
 * - 'true' si le gestionnaire externe a été créé avec succès.
 * - 'erreur' en cas d'échec de l'insertion dans la table gestionnaire externe.
 * - 'les2' si à la fois le pseudo et l'email existent déjà.
 * - 'pseudo' si le pseudo existe déjà.
 * - 'mail' si l'email existe déjà.
 */
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

/**
 * Crée un nouvel étudiant.
 * @async
 * @param {Array} values_user - Les valeurs des champs utilisateur.
 * @param {Array} values_id - Les valeurs des champs identifiant (pseudo et email).
 * @param {string} ecole - L'école de l'étudiant.
 * @param {string} codePostale - Le code postal de l'école de l'étudiant.
 * @param {string} niveau - Le niveau d'étude de l'étudiant.
 * @returns {string} - Résultat de la création de l'étudiant.
 * - 'true' si l'étudiant a été créé avec succès.
 * - 'erreur' en cas d'échec de l'insertion dans la table étudiant.
 * - 'les2' si à la fois le pseudo et l'email existent déjà.
 * - 'pseudo' si le pseudo existe déjà.
 * - 'mail' si l'email existe déjà.
 */
async function creerEtudiant(values_user, values_id, ecole, codePostale, niveau) {

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
                    const requet = `INSERT INTO Etudiant (idEtudiant, ecole, niveau_etude, code_postale_ecole) VALUES ('${idUser}', '${ecole}', '${codePostale}', '${niveau}')`;
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