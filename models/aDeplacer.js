const {getStudentInfo, chercherStudent} = require('./etudiantModel');
const {getExterneInfo} = require('./gestionnaireExterneModel');
const {getIAGestionnaireInfo, chercherGestionnaireIapau} = require('./gestionnaireIaModel');
const {chercherAdminID} = require('./adminModel');


/**
 * Cherche le type d'un utilisateur en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idUser - L'identifiant de l'utilisateur à rechercher.
 * @returns {Promise<string>} - Une promesse résolue avec le type de l'utilisateur (gestionnaireIA, administrateur, etudiant, gestionnaireExterne).
 * @throws {Error} Une erreur si la recherche échoue.
 */
async function chercherType(idUser) {
    let result;

    try {

        result = await chercherGestionnaireIapau(idUser);
        if (result.length > 0) {
            return 'gestionnaireIA';
        }

        result = await chercherAdminID(idUser);
        if (result.length > 0) {
            return 'administrateur';
        }

        result = await chercherStudent(idUser);
        if (result.length > 0) {
            return 'etudiant';
        }

        return 'gestionnaireExterne';

    } catch (error) {
        throw (error);
    }
}

/**
 * Récupère et renvoie un JSON contenant la liste des utilisateurs avec leurs informations.
 * @async
 * @function
 * @returns {Promise<object>} - Une promesse résolue avec un objet JSON contenant la liste des utilisateurs et leurs informations.
 * @throws {Error} Une erreur si la récupération échoue.
 */
async function envoyer_json_liste_user() {
    try {
        const listeUsers = await chercherListeUtilisateurs();
        const jsonRetour = { utilisateurs: [] };

        for (const userCourant of listeUsers) {
            const type = await chercherType(userCourant.iduser);

            let userInfos = {
                id: userCourant.iduser,
                nom: userCourant.nom,
                prenom: userCourant.prenom,
                pseudo: userCourant.pseudo,
                role: await chercherType(userCourant.iduser),
                mail: userCourant.email,
                dateCreation: userCourant.date_inscription,
                ville: userCourant.ville || '',
                github: userCourant.lien_github || '',
                linkedin: userCourant.lien_linkedin || '',
            };

            if (type === 'etudiant') {
                userInfos = { ...userInfos, ...await getStudentInfo(userCourant.iduser) };
            } else if (type === 'gestionnaireExterne') {
                userInfos = { ...userInfos, ...await getExterneInfo(userCourant.iduser) };
            } else if (type === 'gestionnaireIA') {
                userInfos = { ...userInfos, ...await getIAGestionnaireInfo(userCourant.iduser) };
            }
            jsonRetour.utilisateurs.push(userInfos);
        }
        return jsonRetour;
    } catch (error) {
        throw error;
    }
}


module.exports = {envoyer_json_liste_user, chercherType}