const pool = require('../database/configDB');
const passwordModel = require('../models/passwordModel');
const profilModel = require('./profilModel');
const validationDonnees = require('../middleware/validationDonnees');
const verif = require('../controllers/Auth/verificationExistenceController');
const preference = require('./profilModel');
const { body } = require('express-validator');

const validateUser = [
    body('prenom')
        .notEmpty().withMessage('Le prénom ne doit pas être vide.')
        .matches(/^[a-zA-ZÀ-ÿ \-']*$/).withMessage("Le prénom doit contenir uniquement des lettres, des espaces, des tirets '-', des apostrophes ''', ou des lettres avec accents.")
        .isLength({ min: 2, max: 30 }).withMessage('Le prénom doit avoir une longueur comprise entre 2 et 30 caractères.'),

    body('nom')
        .notEmpty().withMessage('Le prénom ne doit pas être vide.')
        .matches(/^[a-zA-ZÀ-ÿ \-']*$/).withMessage("Le prénom doit contenir uniquement des lettres, des espaces, des tirets '-', des apostrophes ''', ou des lettres avec accents.")
        .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 50 caractères.'),

    body('pseudo')
        .notEmpty().withMessage('Le pseudo ne doit pas être vide.')
        .isLength({ min: 2, max: 30 }).withMessage('Le pseudo doit avoir une longueur comprise entre 3 et 30 caractères.')
        .matches(/^[^\s<>]+$/).withMessage('Le pseudo ne doit contenir que des lettres, des chiffres et des caractères spéciaux, sauf les espaces et les symboles "<>".')
    ,
    body('email')
        .notEmpty().withMessage('L\'email ne doit pas être vide.')
        .isEmail().withMessage('L\'email doit être une adresse email valide.')
        .isLength({ min: 2, max: 100 }).withMessage('L\'email doit avoir une longueur comprise entre 2 et 100 caractères.'),

    body('linkedin')
        /* Rend la validation facultative si la valeur est vide ou nulle*/
        .optional({ nullable: true, checkFalsy: true })
        .isURL().withMessage('Le lien LinkedIn doit être une URL valide.')
        .isLength({ min: 0, max: 300 }).withMessage('Le lien LinkedIn doit avoir une longueur comprise entre 2 et 300 caractères.'),

    body('github')
        /* Rend la validation facultative si la valeur est vide ou nulle*/
        .optional({ nullable: true, checkFalsy: true })
        .isURL().withMessage('Le lien GitHub doit être une URL valide.')
        .isLength({ min: 0, max: 300 }).withMessage('Le lien GitHub doit avoir une longueur comprise entre 2 et 300 caractères.'),


    body('ville')
        /* Rend la validation facultative si la valeur est vide ou nulle*/
        .optional({ nullable: true, checkFalsy: true })
        .matches(/^[a-zA-ZÀ-ÿ \-']*$/).withMessage("La ville doit contenir uniquement des lettres, des espaces, des tirets '-', des apostrophes ''', ou des lettres avec accents.")
        .isLength({ min: 1, max: 50 }).withMessage('La ville doit avoir une longueur comprise entre 1 et 50 caractères.'),

    /**Appel du validateur */
    validationDonnees.validateUserData,
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
    const user = `SELECT idUser FROM utilisateur WHERE pseudo = $1`;

    return new Promise((resolve, reject) => {
        pool.query(user, [pseudo])
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

    const insertUser = `
      INSERT INTO Utilisateur (nom, prenom, pseudo, email, lien_linkedin, lien_github, ville, date_inscription, typeUser, hashMdp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8, $9)  RETURNING iduser`;

    try {
        values.push(type, mdp)
        const nonExiste = await verif.verifExistence(values2);

        /**Pas d'utilisateur ayant les mêmes id, on peut insérer */
        if (nonExiste) {
            return new Promise((resolve) => {
                pool.query(insertUser, values)
                    .then((result) => {

                        let id = result.rows[0].iduser;
                        profilModel.preferences(id);
                        resolve(id);
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
function supprimerUser(idUser) {

    const suppr = `DELETE FROM Utilisateur WHERE idUser = $1`;

    try {
        pool.query(suppr, [idUser])
    } catch {
        throw error;
    }
}

/*Sert a r */
function supprimerUserID(idUser) {

    const suppr = `DELETE FROM Utilisateur WHERE idUser = $1`;

    return new Promise((resolve, reject) => {

        pool.query(suppr, [idUser])
            .then(() => {
                resolve('ok');
            })
            .catch((error) => {
                reject(error);
            });

    });
}

async function getInfosProfil(id) {

    // etudiant: ecole, niveau
    // gestionnaire ia role
    // externe metier role

    const user = (await chercherUserID(id))[0];
    jsonRetour = {};

    jsonRetour.idUser = id;
    // jsonRetour.type = user.typeuser;
    jsonRetour.nom = user.nom;
    jsonRetour.prenom = user.prenom;
    jsonRetour.pseudo = user.pseudo;
    jsonRetour.email = user.email;
    jsonRetour.lien_linkedin = user.lien_linkedin;
    jsonRetour.lien_github = user.lien_github;
    jsonRetour.ville = user.ville;

    const preferences = await preference.getPreferences(id);
    jsonRetour.preferences = [];
    jsonRetour.preference = JSON.parse(JSON.stringify(preferences[0]));

    /*Les préférences */
    //git, linkedin, ville
    //ecole, niveau, metier

    console.log(jsonRetour.preference.iduser)

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
}