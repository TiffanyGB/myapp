const pool = require('../database/configDB');
const gestionnaireExterneModel = require('./gestionnaireExterneModel');
const gestionnaireIaModel = require('./gestionnaireIaModel');
const userModel = require('./userModel');

/**
 * Crée un json avec la liste des gestionnaires externes et internes.
 * Utile pour la modification et création des projets
 * @async
 * @function
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * @returns {JSON} Json avec les informations
 * @throws {Error} Une erreur si la requête échoue.
*/
async function envoyer_json_liste_gestionnaires() {

    try {

        let jsonRetour = {};
        jsonRetour.gestionnairesExternes = [];
        jsonRetour.gestionnairesIa = [];

        /*Liste des gestionnaires externes et internes */
        const listeGExt = await gestionnaireExterneModel.chercherListeGestionnairesExt();
        const listeGIa = await gestionnaireIaModel.chercherListeGestionnaireIapau();


        /*Externes */
        if (listeGExt.length > 0) {

            for (i = 0; i < listeGExt.length; i++) {

                tempInfo = {};

                let gestionnaireCourant = listeGExt[i];
                let idCourant = gestionnaireCourant.id_g_externe;

                /**Chercher les infos du gestionnaire externe dans la table utilisateur */
                let userCourant = await userModel.chercherUserID(idCourant);

                /**Erreur pas d'utilisateur associé*/
                if (userCourant.length === 0) {
                    throw(error);
                }

                for (j = 0; j < userCourant.length; j++) {

                    tempInfo.Nom = userCourant[0].nom;
                    tempInfo.Prenom = userCourant[0].prenom;
                    tempInfo.Mail = userCourant[0].email;
                }

                tempInfo.id = gestionnaireCourant.id_g_externe;
                tempInfo.Entreprise = gestionnaireCourant.entreprise;
                tempInfo.Metier = gestionnaireCourant.metier;

                jsonRetour.gestionnairesExternes.push(tempInfo);
            }
        }

        /*IA Pau*/
        if (listeGIa.length > 0) {

            for (i = 0; i < listeGIa.length; i++) {

                tempInfo = {};

                let gestionnaireCourant = listeGIa[i];
                let idCourant = gestionnaireCourant.id_g_iapau;

                /**Chercher les infos du gestionnaire externe dans la table utilisateur */
                let userCourant = await userModel.chercherUserID(idCourant);

                for (j = 0; j < userCourant.length; j++) {

                    tempInfo.Nom = userCourant[0].nom;
                    tempInfo.Prenom = userCourant[0].prenom;
                    tempInfo.Mail = userCourant[0].email;

                }

                tempInfo.id = gestionnaireCourant.id_g_iapau;
                tempInfo.Entreprise = 'IA-Pau';
                tempInfo.Metier = gestionnaireCourant.role_asso;

                jsonRetour.gestionnairesIa.push(tempInfo);
            }
        }
        return jsonRetour;

    } catch (error) {
        throw error;
    }
}

/**
 * Modifie un gestionnaire externe en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idUser - L'identifiant du gestionnaire externe à modifier.
 * @param {object} valeurs - Les nouvelles valeurs à mettre à jour pour la table utilisateur.
 * @param {string} metier - Le nouveau métier du gestionnaire externe.
 * @param {string} entreprise - La nouvelle entreprise du gestionnaire externe.
 * @param {string} password - Le nouveau mot de passe du gestionnaire externe (peut être vide).
 * @returns {Promise<string>} - Une promesse résolue avec un message de confirmation ou une chaîne indiquant le type de conflit rencontré (les2, pseudo, mail).
 * @throws {Error} Une erreur si la modification échoue.
 * @author Tiffany GAY-BELLILE
 */
async function modifierExterne(idUser, valeurs, metier, entreprise, password) {

    try {
        const result = await userModel.modifierUser(idUser, valeurs, password)

        switch (result) {
            case 'les2':
                return 'les2';
            case 'pseudo':
                return 'pseudo';
            case 'mail':
                return 'mail';
            default:
                break;
        }

        const modif = `UPDATE Gestionnaire_externe
            SET entreprise = $1,
            metier = $2 
            WHERE id_g_externe = $3`;

        pool.query(modif, [entreprise, metier, idUser]);

    } catch (error) {
        throw error;
    }
}

/**
 * Modifie un gestionnaire IAPAU en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idUser - L'identifiant du gestionnaire IAPAU à modifier.
 * @param {object} valeurs - Les nouvelles valeurs à mettre à jour pour la table utilisateur.
 * @param {string} role_asso - Le nouveau rôle associatif du gestionnaire IAPAU.
 * @param {string} password - Le nouveau mot de passe du gestionnaire IAPAU (peut être vide).
 * @returns {Promise<string>} - Une promesse résolue avec un message de confirmation ou une chaîne indiquant le type de conflit rencontré (les2, pseudo, mail).
 * @throws {Error} Une erreur si la modification échoue.
 * @author Tiffany GAY-BELLILE
 */
async function modifierIapau(idUser, valeurs, role_asso, password) {
    try {

        const result = await userModel.modifierUser(idUser, valeurs, password);

        switch (result) {
            case 'les2':
                return 'les2';
            case 'pseudo':
                return 'pseudo';
            case 'mail':
                return 'mail';
            default:
                break;
        }

        const modif = `UPDATE Gestionnaire_iapau
                SET role_asso = '${role_asso}'
                WHERE id_g_iapau = ${idUser}`;

        pool.query(modif);
    } catch (error) {
        throw error;
    }
}
module.exports = {
    envoyer_json_liste_gestionnaires,
    modifierIapau,
    modifierExterne
}