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
        .custom((value) => !(/^\s+$/.test(value)))
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

/*Avoir le type d'un utilisateur */
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

/**Liste des utilisateurs  */
async function chercherListeUtilisateurs() {

    const users = `SELECT * FROM Utilisateur`;

    try {
        const chercher = await pool.query(users);
        return chercher.rows;
    }catch (error){
        throw error;
    }
}

/**Chercher un utilisateur par son id*/
async function chercherUserID(idUser) {
    const users = 'SELECT * FROM Utilisateur WHERE idUser = $1';

    try {
        const chercher = await pool.query(users, [idUser]);
        return chercher.rows;
    }catch (error){
        throw error;
    }
}

/**Pour supprimer, odifier la fonction de hachage de l'admin */
async function chercherUserPseudo(pseudo) {
    const user = `SELECT idUser FROM utilisateur WHERE pseudo = $1`;

    try{
        const chercher = await pool.query(user, [pseudo]);c
        return chercher.rows[0].iduser;
    }catch{

    }
}

/**Création utilisateur */
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

/**Modifier un utilisateur, injections sql */
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

/**Supprimer */
function supprimerUser(idUser) {

    const suppr = `DELETE FROM Utilisateur WHERE idUser = $1`;

    try {
        pool.query(suppr, [idUser])
    } catch (error) {
        throw error;
    }
}

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