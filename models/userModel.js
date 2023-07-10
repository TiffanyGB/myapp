const pool = require('../database/configDB');
const passwordModel = require('../models/passwordModel');
// const etudiantmodel = require('./etudiantModel');
const gestionnaireExterneModel = require('./gestionnaireExterneModel');
const gestionnaireIAModel = require('./gestionnaireIaModel');
const verif = require('../controllers/Auth/verificationExistenceController');
const Joi = require('joi');


/**Valider les données */
const schemaInscription = Joi.object({
    nom: Joi.string().regex(/^[A-Za-z]+$/).min(3).max(40).required().messages({
        'string.base': 'Le champ {#label} doit être une chaîne de caractères.',
        'string.empty': 'Le champ {#label} ne doit pas être vide.',
        'string.pattern.base': 'Le champ {#label} ne doit contenir que des lettres.',
        'string.min': 'Le champ {#label} doit contenir au moins {#limit} caractères.',
        'string.max': 'Le champ {#label} doit contenir au maximum {#limit} caractères.',
        'any.required': 'Le champ {#label} est requis.',
    }),
    prenom: Joi.string().regex(/^[A-Za-z]+$/).min(3).max(40).required(),
    pseudo: Joi.string().regex(/^[a-zA-Z0-9!&#(~)_^%?]+$/).min(3).max(25).required(),
    email: Joi.string().email().regex(/^[a-zA-Z0-9!&#(~)_^%?]+$/).max(100).required(),
    linkedin: Joi.string().uri().regex(/^[^<>]+$/).max(150).optional(),
    github: Joi.string().uri().regex(/^[^<>]+$/).max(150).optional(),
    ville: Joi.string().regex(/^[A-Za-z]+$/).min(3).max(45),
    password: Joi.string().min(8).max(100).required()
});

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

/**Chercher un utilisateur par son pseudo, retourne l'id
 * Permet de trouver l'id d'un utilisateur si on ne connaît pas l'id
 */

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
async function insererUser(values, password,values2, type) {

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

    infoUser = temp[0];

    const id = [valeurs[3], valeurs[4]];

    const les2 = await verif.verifExistence(id);

    if (les2 === false) {

        const pseudo = await verif.existePseudo(valeurs[3]);
        const email = await verif.existeMail(valeurs[4]);

        if (pseudo === true && email === true) {
            return 'les2'
        }
        else if (pseudo === false) {
            return 'mail';
        } else {
            return 'pseudo';
        }
    }

    const modif = `UPDATE Utilisateur 
    SET typeUser = '${valeurs[0]}', 
    nom = '${valeurs[1]}',
    prenom = '${valeurs[2]}',
    pseudo = '${valeurs[3]}',
    email = '${valeurs[4]}'
    WHERE idUser = '${idUser}'`;


    pool.query(modif)
        .then(() => {
            if (password != '') {
                passwordModel.salageMdp(password)
                    .then((hashedPassword) => {
                        insererMdp(hashedPassword, idUser);
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


/**JSON de la liste des utilisateurs */
// async function envoyer_json_liste_user() {

//     try {
//         const listeUsers = await chercherListeUtilisateurs();

//         jsonRetour = {};
//         jsonRetour.utilisateurs = [];

//         if (listeUsers === 0) {
//             json.message = "Aucun utilisateur";
//             return 'aucun';
//         } else {

//             for (i = 0; i < listeUsers.length; i++) {

//                 let userCourant = listeUsers[i];
//                 let userInfos = {};

//                 userInfos.id = userCourant.iduser;
//                 userInfos.nom = userCourant.nom;
//                 userInfos.prenom = userCourant.prenom;
//                 userInfos.pseudo = userCourant.pseudo;
//                 userInfos.role = userCourant.typeuser;
//                 userInfos.mail = userCourant.email;
//                 userInfos.dateCreation = userCourant.date_inscription;
//                 userInfos.ville = userCourant.ville;
//                 userInfos.github = userCourant.lien_github;
//                 userInfos.linkedin = userCourant.lien_linkedin;

//                 if (userCourant.typeuser === 'etudiant') {
//                     let chercherStudent = await etudiantmodel.chercherStudent(userCourant.iduser);

//                     if (chercherStudent === 0) {
//                         return 'erreur_student'
//                     } else {
//                         etudiantCourant = chercherStudent[0];

//                         //console.log("ihhhhh", etudiantCourant.ecole);
//                         // userInfos.ecole = etudiantCourant.ecole;
//                         userInfos.niveauEtude = etudiantCourant.niveau_etude;
//                     }
//                 }

//                 if (userCourant.typeuser === 'gestionnaireExterne') {

//                     let chercherGE = await gestionnaireExterneModel.chercherGestionnaireExtID(userCourant.iduser);

//                     if (chercherGE === 0) {
//                         return 'erreur_student'
//                     } else {
//                         let gex = chercherGE[0];

//                         userInfos.entreprise = gex.entreprise;
//                         userInfos.metier = gex.metier;
//                     }
//                 }

//                 if (userCourant.typeuser === 'gestionnaireIA') {

//                     let chercherGIA = await gestionnaireIAModel.chercherGestionnaireIapau(userCourant.iduser);

//                     if (chercherGIA === 0) {
//                         return 'erreur_student'
//                     } else {
//                         let gia = chercherGIA[0];

//                         userInfos.role_asso = gia.role_asso;
//                     }
//                 }
//                 jsonRetour.utilisateurs.push(userInfos);
//             }
//             return jsonRetour;
//         }
//     } catch (error) {
//         throw error;
//     }
// }


module.exports = {
    chercherListeUtilisateurs,
    chercherUserID,
    chercherUserPseudo,
    // envoyer_json_liste_user,
    supprimerUser,
    modifierUser,
    insererUser,
    schemaInscription
}