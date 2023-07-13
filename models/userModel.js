

const pool = require('../database/configDB');
const passwordModel = require('../models/passwordModel');
// const etudiantmodel = require('./etudiantModel');
const gestionnaireExterneModel = require('./gestionnaireExterneModel');
const gestionnaireIAModel = require('./gestionnaireIaModel');
const verif = require('../controllers/Auth/verificationExistenceController');
const { body, validationResult } = require('express-validator');


function validateUserData(req, res, next) {
    // Exécuter les validateurs Express Validator
    const errors = validationResult(req);

    // Vérifier s'il y a des erreurs de validation
    if (!errors.isEmpty()) {
        // Renvoyer les erreurs de validation au client
        return res.status(400).json({ errors: errors.array() });
    }

    // Si les données sont valides, passer à l'étape suivante
    next();
}


const validateUser = [
    body('prenom')
        .notEmpty().withMessage('Le prénom ne doit pas être vide.')
        .isAlpha().withMessage('Le prénom doit contenir uniquement des lettres.')
        .isLength({ min: 2, max: 30 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 30 caractères.'),


    body('nom')
        .notEmpty().withMessage('Le prénom ne doit pas être vide.')
        .isAlpha().withMessage('Le prénom doit contenir uniquement des lettres.')
        .isLength({ min: 2, max: 30 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 30 caractères.'),

    body('pseudo')
        .notEmpty().withMessage('Le pseudo ne doit pas être vide.')
        .isLength({ min: 2, max: 30 }).withMessage('Le pseudo doit avoir une longueur comprise entre 2 et 30 caractères.'),

    body('email')
        .notEmpty().withMessage('L\'email ne doit pas être vide.')
        .isEmail().withMessage('L\'email doit être une adresse email valide.')
        .isLength({ min: 2, max: 30 }).withMessage('L\'email doit avoir une longueur comprise entre 2 et 120 caractères.'),

    body('linkedin')
        .optional({ nullable: true, checkFalsy: true }) // Rend la validation facultative si la valeur est vide ou nulle
        .isURL().withMessage('Le lien LinkedIn doit être une URL valide.')
        .isLength({ min: 0, max: 300 }).withMessage('Le lien LinkedIn doit avoir une longueur comprise entre 2 et 200 caractères.'),


    body('github')
        .optional({ nullable: true, checkFalsy: true }) // Rend la validation facultative si la valeur est vide ou nulle
        .isURL().withMessage('Le lien GitHub doit être une URL valide.')
        .isLength({ min: 0, max: 300 }).withMessage('Le lien GitHub doit avoir une longueur comprise entre 2 et 200 caractères.'),


    body('ville')
        .optional({ nullable: true, checkFalsy: true }) // Rend la validation facultative si la valeur est vide ou nulle
        .isAlpha().withMessage('La ville doit contenir uniquement des lettres.')
        .isLength({ min: 1, max: 50 }).withMessage('La ville doit avoir une longueur comprise entre 1 et 50 caractères.'),


    body('password')
        .notEmpty().withMessage('Le mot de passe ne doit pas être vide.')
        .isLength({ min: 8, max: 100 }).withMessage('Le mot de passe doit avoir une longueur comprise entre 8 et 100 caractères.')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
        .matches(/[!@#$%^&*]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial (!, @, #, $, %, ^, & ou *).'),

    /**Appel du validateur */
    validateUserData,
];

const validateUserModif = [
    body('prenom')
        .notEmpty().withMessage('Le prénom ne doit pas être vide.')
        .isAlpha().withMessage('Le prénom doit contenir uniquement des lettres.')
        .isLength({ min: 2, max: 30 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 30 caractères.'),


    body('nom')
        .notEmpty().withMessage('Le prénom ne doit pas être vide.')
        .isAlpha().withMessage('Le prénom doit contenir uniquement des lettres.')
        .isLength({ min: 2, max: 30 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 30 caractères.'),

    body('pseudo')
        .notEmpty().withMessage('Le pseudo ne doit pas être vide.')
        .isLength({ min: 2, max: 30 }).withMessage('Le pseudo doit avoir une longueur comprise entre 2 et 30 caractères.'),

    body('email')
        .notEmpty().withMessage('L\'email ne doit pas être vide.')
        .isEmail().withMessage('L\'email doit être une adresse email valide.')
        .isLength({ min: 2, max: 30 }).withMessage('L\'email doit avoir une longueur comprise entre 2 et 120 caractères.'),

    body('linkedin')
        .optional({ nullable: true, checkFalsy: true }) // Rend la validation facultative si la valeur est vide ou nulle
        .isURL().withMessage('Le lien LinkedIn doit être une URL valide.')
        .isLength({ min: 0, max: 300 }).withMessage('Le lien LinkedIn doit avoir une longueur comprise entre 2 et 200 caractères.'),


    body('github')
        .optional({ nullable: true, checkFalsy: true }) // Rend la validation facultative si la valeur est vide ou nulle
        .isURL().withMessage('Le lien GitHub doit être une URL valide.')
        .isLength({ min: 0, max: 300 }).withMessage('Le lien GitHub doit avoir une longueur comprise entre 2 et 200 caractères.'),


    body('ville')
        .optional({ nullable: true, checkFalsy: true }) // Rend la validation facultative si la valeur est vide ou nulle
        .isAlpha().withMessage('La ville doit contenir uniquement des lettres.')
        .isLength({ min: 1, max: 50 }).withMessage('La ville doit avoir une longueur comprise entre 1 et 50 caractères.'),


    body('password')
        .optional({ nullable: true, checkFalsy: true }) // Rend la validation facultative si la valeur est vide ou nulle
        .isLength({ min: 8, max: 100 }).withMessage('Le mot de passe doit avoir une longueur comprise entre 8 et 100 caractères.')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
        .matches(/[!@#$%^&*]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial (!, @, #, $, %, ^, & ou *).'),

    /**Appel du validateur */
    validateUserData,
];

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

/**Pour supprimer, odifier la fonction de hachage de l'admin */
function chercherUserPseudo(pseudo) {
    const user = `SELECT idUser FROM utilisateur WHERE pseudo = '${pseudo}'`;

    return new Promise((resolve, reject) => {
        pool.query(user)
            .then((result) => {
                if (result.rows.length > 0) {
                    resolve(result.rows[0].iduser);
                } else {
                    reject(new Error('Utilisateur non trouvé: erreur dans le fichier "' + __filename + '" dans "' + arguments.callee.name + '"'));
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**Création utilisateur */
async function insererUser(values, password, values2, type) {

    let mdp = await passwordModel.salageMdp(password);

    /**inserr mdp avec un tableau */

    const insertUser = `
      INSERT INTO Utilisateur (nom, prenom, pseudo, email, lien_linkedin, lien_github, ville, date_inscription, typeUser, hashMdp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, '${type}', '${mdp}')  RETURNING iduser`;

    try {
        const nonExiste = await verif.verifExistence(values2);

        /**Pas d'utilisateur ayant les mêmes id, on peut insérer */
        if (nonExiste) {
            return new Promise((resolve, reject) => {
                pool.query(insertUser, values)
                    .then((result) => {
                        let id = result.rows[0].iduser;
                        resolve(id);
                    })
                    .catch((error) => {
                        console.error('Fichier "' + __filename + '" fonction: "' + arguments.callee.name + ':\nErreur lors de l\'insertion des données côté utilisateur:', error);
                        reject(error);
                    });
            });
        }
        else {
            const existeP = await verif.existePseudo(values2[0]);
            const existeM = await verif.existeMail(values2[1]);

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
        console.error('Erreur lors de l\'insertion des données côté utilisateur:', error);
        throw error;
    }
}

/**Modifier un utilisateur */
async function modifierUser(idUser, valeurs, password) {

    const temp = await chercherUserID(idUser);

    /**Vérifier que le nouveau pseudo et email n'existent pas */

    infoUser = temp[0];

    const id = [valeurs[2], valeurs[3]];

    let existeP;
    let existeM;

    if (id[0] != infoUser.pseudo) {
        existeP = await verif.existePseudo(id[0]);

    }else{
        existeP = false;
    }
    if (id[1] != infoUser.email) {
        existeM = await verif.existeMail(id[1]);

    }else{
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




    pool.query(modif)
        .then(() => {
            if (password != '') {
                passwordModel.salageMdp(password)
                    .then((hashedPassword) => {
                        passwordModel.updateMdp(hashedPassword, idUser);
                        console.log('Mot de passe inséré avec succès');

                    })
            } else {
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
        case 'admini':
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


function supprimerUserID(idUser) {

    const suppr = `DELETE FROM Utilisateur WHERE idUser = '${idUser}'`;

    return new Promise((resolve, reject) => {

        pool.query(suppr)
            .then(() => {
                resolve('ok');
            })
            .catch((error) => {
                reject(error);
            });

    });
}



module.exports = {
    chercherListeUtilisateurs,
    chercherUserID,
    chercherUserPseudo,
    supprimerUser,
    modifierUser,
    insererUser,
    supprimerUserID,
    validateUser,
    validateUserModif

}