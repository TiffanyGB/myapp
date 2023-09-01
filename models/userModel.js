/**
 * @fileoverview Model des utilisateurs.
 */
const {getStudentInfo, chercherStudent} = require('./etudiantModel');
const {getExterneInfo} = require('./gestionnaireExterneModel');
const {getIAGestionnaireInfo, chercherGestionnaireIapau} = require('./gestionnaireIaModel');
const {chercherAdminID} = require('./adminModel');

const pool = require('../database/configDB');
const passwordModel = require('../models/passwordModel');
const verif = require('../verifications/verif_pseudo_mail_libres');
const { body } = require('express-validator');
const { validateurDonnéesMiddleware } = require('../verifications/validateur');

const validateUser = [
    body('prenom')
        .notEmpty().withMessage('Le prénom ne doit pas être vide.')
        .custom((value) => !(/^\s+$/.test(value))).withMessage('Le prénom ne doit pas être vide.')
        .matches(/^[a-zA-ZÀ-ÿ \-']*$/).withMessage("Le prénom doit contenir uniquement des lettres, des espaces, des tirets '-', des apostrophes ''', ou des lettres avec accents.")
        .isLength({ min: 2, max: 60 }).withMessage('Le prénom doit avoir une longueur comprise entre 2 et 60 caractères.'),

    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .custom((value) => !(/^\s+$/.test(value)))
        .matches(/^[a-zA-ZÀ-ÿ \-']*$/).withMessage("Le nom doit contenir uniquement des lettres, des espaces, des tirets '-', des apostrophes ''', ou des lettres avec accents.")
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit avoir une longueur comprise entre 2 et 100 caractères.'),

    body('pseudo')
        .notEmpty().withMessage('Le pseudo ne doit pas être vide.')
        .isLength({ min: 2, max: 30 }).withMessage('Le pseudo doit avoir une longueur comprise entre 3 et 30 caractères.')
        .matches(/^[^\s]+$/).withMessage('Le pseudo ne doit pas contenir des espaces.')
    ,
    body('email')
        .notEmpty().withMessage('L\'email ne doit pas être vide.')
        .isEmail().withMessage('L\'email doit être une adresse email valide.')
        .isLength({ min: 2, max: 200 }).withMessage('L\'email doit avoir une longueur comprise entre 2 et 200 caractères.'),

    body('linkedin')
        /* Rend la validation facultative si la valeur est vide ou nulle*/
        .optional({ nullable: true, checkFalsy: true })
        .isURL().withMessage('Le lien LinkedIn doit être une URL valide.')
        .isLength({ min: 0, max: 400 }).withMessage('Le lien LinkedIn doit avoir une longueur comprise entre 2 et 400 caractères.'),

    body('github')
        /* Rend la validation facultative si la valeur est vide ou nulle*/
        .optional({ nullable: true, checkFalsy: true })
        .isURL().withMessage('Le lien GitHub doit être une URL valide.')
        .isLength({ min: 0, max: 400 }).withMessage('Le lien GitHub doit avoir une longueur comprise entre 2 et 400 caractères.'),


    body('ville')
        /* Rend la validation facultative si la valeur est vide ou nulle*/
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => !(/^\s+$/.test(value)))
        .matches(/^[a-zA-ZÀ-ÿ \-']*$/).withMessage("La ville doit contenir uniquement des lettres, des espaces, des tirets '-', des apostrophes ''', ou des lettres avec accents.")
        .isLength({ min: 1, max: 100 }).withMessage('La ville doit avoir une longueur comprise entre 1 et 100 caractères.'),

    /**Appel du validateur */
    validateurDonnéesMiddleware,
];

const connexion = [

    body('identifiant')
        .isLength({ max: 100 })
        .withMessage('L\'identifiant doit avoir une longueur de maximum 100 caractères.'),

    body('password')
        .isLength({ max: 255 })
        .withMessage('Le mot de passe doit avoir une longueur de maximum 255 caractères.'),

    validateurDonnéesMiddleware,
]

/**
 * Cherche le type d'un utilisateur en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idUser - L'identifiant de l'utilisateur à rechercher.
 * @returns {Promise<string>} - Une promesse résolue avec le type de l'utilisateur (gestionnaireIA, administrateur, etudiant, gestionnaireExterne).
 * @throws {Error} Une erreur si la recherche échoue.
 */async function chercherType(idUser) {
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
 * Récupère la liste de tous les utilisateurs.
 * @async
 * @function
 * @returns {Promise<Array<object>>} - Une promesse résolue avec un tableau d'objets représentant les utilisateurs.
 * @throws {Error} Une erreur si la recherche échoue.
 */
async function chercherListeUtilisateurs() {

    const users = `SELECT * FROM Utilisateur`;

    try {
        const chercher = await pool.query(users);
        return chercher.rows;
    }catch (error){
        throw error;
    }
}

/**
 * Cherche un utilisateur par son identifiant.
 * @async
 * @function
 * @param {number} idUser - L'identifiant de l'utilisateur à rechercher.
 * @returns {Promise<Array<object>>} - Une promesse résolue avec un tableau d'objets représentant les informations de l'utilisateur.
 * @throws {Error} Une erreur si la recherche échoue.
 */
async function chercherUserID(idUser) {
    const users = 'SELECT * FROM Utilisateur WHERE idUser = $1';

    try {
        const chercher = await pool.query(users, [idUser]);
        return chercher.rows;
    }catch (error){
        throw error;
    }
}

/**
 * Cherche l'identifiant d'un utilisateur par son pseudo.
 * @async
 * @function
 * @param {string} pseudo - Le pseudo de l'utilisateur à rechercher.
 * @returns {Promise<number>} - Une promesse résolue avec l'identifiant de l'utilisateur ou undefined s'il n'est pas trouvé.
 * @throws {Error} Une erreur si la recherche échoue.
 */
async function chercherUserPseudo(pseudo) {
    const user = `SELECT idUser FROM utilisateur WHERE pseudo = $1`;

    try{
        const chercher = await pool.query(user, [pseudo]);c
        return chercher.rows[0].iduser;
    }catch{

    }
}

/**
 * Insère un nouvel utilisateur dans la base de données.
 * Il hache le mot de passe.
 * @async
 * @function
 * @param {Array<any>} values - Les valeurs des colonnes de l'utilisateur à insérer.
 * @param {string} password - Le mot de passe de l'utilisateur à insérer.
 * @param {Array<string>} values2 - Les valeurs du pseudo et de l'email pour vérifier les conflits.
 * @returns {Promise<string>} - Une promesse résolue avec un message de confirmation ou une chaîne indiquant le type de conflit rencontré (les2, pseudo, mail).
 * @throws {Error} Une erreur si l'insertion échoue.
 */
async function insererUser(values, password, values2) {

    const insertUser = `
      INSERT INTO Utilisateur (nom, prenom, pseudo, email, lien_linkedin, lien_github, ville, date_inscription, hashMdp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8)  RETURNING iduser`;

      try {
        let mdp = await passwordModel.salageMdp(password);

        values.push(mdp);

        const existeP = await verif.existePseudo(values2[0]);
        const existeM = await verif.existeMail(values2[1]);

        /**Pas d'utilisateur ayant les mêmes identifiants, on peut insérer */
        if (!existeP && !existeM) {
            
                const inserer = await pool.query(insertUser, values);
                return inserer.rows[0].iduser;
        }
        else {
            if (existeM && existeP) {
                return "les2";
            }
            else if (existeP) {
                return "pseudo";
            } else if (existeM) {
                return "mail";
            }
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Insère un nouvel utilisateur dans la base de données.
 * @async
 * @function
 * @param {Array<any>} values - Les valeurs des colonnes de l'utilisateur à insérer.
 * @param {string} password - Le mot de passe de l'utilisateur à hacher et insérer, s'il n'est pas vide.
 * @param {Array<string>} values2 - Les valeurs du pseudo et de l'email pour vérifier les conflits.
 * @returns {Promise<string>} - Une promesse résolue avec un message de confirmation ou une chaîne indiquant le type de conflit rencontré (les2, pseudo, mail).
 * @throws {Error} Une erreur si l'insertion échoue.
 */
async function modifierUser(idUser, valeurs, password) {

    const temp = await chercherUserID(idUser);

    /**Vérifier que le nouveau pseudo et email n'existent pas */
    infoUser = temp[0];

    const id = [valeurs[2], valeurs[3]];

    let existeP;
    let existeM;

    if (id[0] != infoUser.pseudo) {
        existeP = await verif.existePseudo(id[0]);

    } else {
        existeP = false;
    }
    if (id[1] != infoUser.email) {
        existeM = await verif.existeMail(id[1]);

    } else {
        existeM = false;
    }

    if (existeM && existeP) {
        return "les2";
    }
    else if (existeP) {
        return "pseudo";
    }
    if (existeM) {
        return "mail";
    }

    const modif = `
    UPDATE Utilisateur 
    SET
      nom = ${valeurs[0] ? `'${valeurs[0]}'` : 'nom'},
      prenom = ${valeurs[1] ? `'${valeurs[1]}'` : 'prenom'},
      pseudo = ${valeurs[2] ? `'${valeurs[2]}'` : 'pseudo'},
      email = ${valeurs[3] ? `'${valeurs[3]}'` : 'email'},
      lien_linkedin = '${valeurs[4]}',
      lien_github = '${valeurs[5]}',
      ville = '${valeurs[6]}',
      derniereModif = CURRENT_TIMESTAMP
    WHERE idUser = '${idUser}'`;

    try {
        pool.query(modif);
        if (password != '') {
            const hashedPassword = await passwordModel.salageMdp(password)
            passwordModel.updateMdp(hashedPassword, idUser);
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Supprime un utilisateur de la base de données.
 * @function
 * @param {number} idUser - L'identifiant de l'utilisateur à supprimer.
 * @returns {void}
 * @throws {Error} Une erreur si la suppression échoue.
 */
function supprimerUser(idUser) {

    const suppr = `DELETE FROM Utilisateur WHERE idUser = $1`;

    try {
        pool.query(suppr, [idUser])
    } catch (error) {
        throw error;
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



module.exports = {
    chercherListeUtilisateurs,
    chercherUserID,
    chercherUserPseudo,
    supprimerUser,
    modifierUser,
    insererUser,
    envoyer_json_liste_user,
    validateUser,
    connexion,
    chercherType
}