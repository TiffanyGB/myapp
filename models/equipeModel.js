const pool = require('../database/configDB');
const validationDonnees = require('../middleware/validationDonnees');
const userModel = require('./userModel');
const projetModel = require('./projetModel')
const { body } = require('express-validator');
const motCleModel = require('../models/motCleModel');
const gererProjet = require('./gererProjet');
const modelsInterface = require('../interfaces/EventInterface');
// const { chercherEvenement } = modelsInterface;

const validerEquipe = [
    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .matches(/^[\W0-9a-zA-ZÀ-ÿ \-']*$/)
        .isLength({ min: 2, max: 30 }).withMessage('Le nom doit avoir une longueur comprise entre 2 et 30 caractères.'),

    body('statut')
        .notEmpty().withMessage('Le statut ne doit pas être vide.')
        .matches(/^(ouvert|fermé)$/).withMessage('Le statut doit être soit "ouvert" soit "fermé".')
        .isLength({ min: 5, max: 6 }).withMessage('Le statut doit avoir une longueur de 6 caractères.'),


    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 3, max: 2000 }).withMessage('La description doit avoir une longueur comprise entre 3 et 2000 caractères.'),

    //Doit être controllé si le profil est admin ou gestionnaire
    // body('idCapitaine')
    //     .optional() // Le champ est optionnel, s'il n'est pas présent, il sera ignoré
    //     .notEmpty().withMessage("L'id ne doit pas être vide.")
    //     .matches(/^[0-9]*$/).withMessage("L'id ne doit contenir que des chiffres.")
    //     .isInt({ min: 1, max: 10000 }).withMessage("L'id doit contenir entre 1 et 10000 chiffres."),

    body('lien_discussion')
        .optional({ nullable: true, checkFalsy: true })
        .isURL().withMessage('Doit être un lien')
        .isLength({ max: 300 }),

    body('preferenceQuestionnaire')
        .optional()
        .matches(/^(true|false)$/).withMessage('La préférence doit être soit "true" soit "false".')
        .isLength({ max: 5 }),

    body('idProjet')
        .notEmpty().withMessage('Le prénom ne doit pas être vide.')
        .matches(/^[0-9]*$/).withMessage("L\'id ne doit avoir que des chiffres.")
        .isLength({ min: 1, max: 1000 }),

    /**Appel du validateur */
    validationDonnees.validateUserData,
];

/************************************************** C'est à changer dans l'interface ***********/
function chercherEvenement(idEvent) {

    const users = 'SELECT * FROM Evenement WHERE idEvent = $1';
    const params = [idEvent];

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

/* toutes les équipes d'un projet */
async function listeEquipeProjet(idProjet) {

    const chercher = `SELECT * FROM Equipe WHERE idProjet = $1`;

    return new Promise((resolve, reject) => {
        pool.query(chercher, [idProjet])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function chercherEquipeID(id) {

    const chercher = `SELECT * FROM Equipe WHERE idEquipe = $1`;

    return new Promise((resolve, reject) => {
        pool.query(chercher, [id])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**Vérifier si existe equipe */
async function equipeExiste(idEquipe) {
    const equipe = await equipeModel.chercherEquipeID(idEquipe);
    if (equipe.length === 0) {
        return true;
    }
}


/* requete pour les equipes ouvertes */
async function equipesOuvertes() {

    const chercher = `SELECT * FROM Equipe
    WHERE statut_recrutement = 'ouvert'`;

    return new Promise((resolve, reject) => {
        pool.query(chercher)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/* Requete créer équipe */
async function creerEquipe(valeurs) {

    const inserer = `INSERT INTO Equipe (idCapitaine, nom, description_equipe, statut_recrutement, idProjet)
    VALUES ($1, $2, $3, $4, $5) RETURNING idEquipe`;

    try {
        return new Promise((resolve, reject) => {
            pool.query(inserer, valeurs)
                .then((result) => {
                    let id = result.rows[0].idequipe;
                    resolve(id);
                })
        });
    } catch (error) {
        throw error;
    }
}

function modifierEquipe(valeurs) {

    const modifier = `UPDATE Equipe
    SET nom = $1,
    description_equipe = $2,
    statut_recrutement = $3,
    idProjet = $4,
    lienDiscussion = $5,
    preferenceQuestionnaire = $6,
    lien_github = $7
    WHERE idEquipe = $8`;

    try {
        pool.query(modifier, valeurs);
    } catch (error) {
        throw error;
    }
}

function appartenirEquipe(idUser, idEquipe) {

    const chercher = `SELECT * FROM Appartenir 
    WHERE idEquipe = $1 AND idUser = $2`;

    return new Promise((resolve, reject) => {
        pool.query(chercher, [idEquipe, idUser])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function ListeMembre(idEquipe) {

    const chercher = `SELECT idUser FROM Appartenir 
    WHERE idEquipe = $1`;

    return new Promise((resolve, reject) => {
        pool.query(chercher, [idEquipe])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function ajouterMembre(idUser, idEquipe) {

    let inserer = `INSERT INTO Appartenir (idUser, idEquipe)
        VALUES ($1, $2)`;

    try {
        pool.query(inserer, [idUser, idEquipe]);
    } catch (error) {
        throw error
    }

}

async function suprimerTousMembres(idEquipe) {

    const supprimer = `DELETE FROM Appartenir
    WHERE idEquipe = $1`;

    try {
        pool.query(supprimer, [idEquipe]);
    } catch (error) {
        throw error;
    }

}

function supprimerUnMembre(idUser, idEquipe) {

    let supprimer = `DELETE FROM Appartenir 
    WHERE idUser = $1 AND idEquipe = $2`;

    try {
        pool.query(supprimer, [idUser, idEquipe]);
    } catch (error) {
        throw error
    }
}

function supprimerEquipe(idEquipe) {

    const supprimer = `DELETE FROM Equipe 
    WHERE idEquipe = $1`;

    try {
        pool.query(supprimer, [idEquipe]);
    } catch (error) {
        throw error;
    }
}

function quitterEquipe(idEquipe, idMembre) {

    const quitter = `DELETE FROM Appartenir
    WHERE idEquipe = $1 AND idUser = $2`;

    try {
        pool.query(quitter, [idEquipe, idMembre]);
    } catch (error) {
        throw error;
    }
}

function recupererDemande(idEquipe) {

    const chercher = `SELECT * FROM DemandeEquipe 
    WHERE idEquipe = $1`;

    return new Promise((resolve, reject) => {
        pool.query(chercher, [idEquipe])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/* Les équipes de l'user */
async function aUneEquipe(idEtudiant) {

    const appartientAUneEquipe = `SELECT * FROM Appartenir WHERE idUser = $1`;

    return new Promise((resolve, reject) => {
        pool.query(appartientAUneEquipe, [idEtudiant])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function aUneEquipeDansEvent(idUser, idEvent) {
    try {

        const projets_event = await projetModel.recuperer_projets(idEvent);

        for (i = 0; i < projets_event.length; i++) {
            const equipes_projets = await listeEquipeProjet(projets_event[i].idprojet);

            for (j = 0; j < equipes_projets.length; j++) {
                let appartenir = await appartenirEquipe(idUser, equipes_projets[j].idequipe);

                if (appartenir.length > 0) {

                    return appartenir[0].idequipe;
                }
            }
        }
        return -1;
    } catch (error) {
        throw error;
    }
}

/* Promouvoir capitaine */
function promouvoir(idEquipe, idEtudiant) {

    const promouvoir = `UPDATE Equipe
    SET idCapitaine = $1
    WHERE idEquipe = $2`;

    try {
        pool.query(promouvoir, [idEtudiant, idEquipe]);
    } catch (error) {
        throw (error);
    }
}

async function jsonInformationsEquipe(idEquipe, req) {

    try {
        const chercher = await chercherEquipeID(idEquipe);

        jsonRetour = {}

        let temp1 = chercher[0];

        /*Nom*/
        console.log(temp1)
        jsonRetour.nom = temp1.nom;

        /*Nombre de membres de l'équipe */
        const membres = await ListeMembre(idEquipe);
        jsonRetour.nombre_membres = membres.length;

        /*Nombre max de l'event*/
        const projet = await projetModel.chercherProjetId(temp1.idprojet);
        let idevent = projet[0].idevent;

        const event = await chercherEvenement(idevent);
        jsonRetour.nombre_max_membres = event[0].nombre_max_equipe;

        const minimum = event[0].nombre_min_equipe;
        console.log(minimum, membres.length, event[0])

        if (membres.length >= minimum) {
            jsonRetour.valide = true;
        } else {
            jsonRetour.valide = false;
        }

        /* Equipe ouverte ou fermée */
        jsonRetour.statutRecrutement = temp1.statut_recrutement;

        /* Description */
        if (temp1.description_equipe == null) {
            jsonRetour.profilRecherche = "";
        } else {
            jsonRetour.profilRecherche = temp1.description_equipe;
        }

        let temp;
        /* Infos capitaine */
        jsonRetour.capitaine = {};

        let capitaine = await userModel.chercherUserID(temp1.idcapitaine);
        jsonRetour.capitaine.id = temp1.idcapitaine;

        jsonRetour.capitaine.pseudo = capitaine[0].pseudo;
        jsonRetour.capitaine.email = capitaine[0].email;

        /* Infos des membres, id et pseudo */
        jsonRetour.membres = [];

        for (i = 0; i < membres.length; i++) {

            membreCourant = membres[i];

            if (membreCourant.iduser != temp1.idcapitaine) {
                temp = {};
                temp.id = membreCourant.iduser;

                let user = await userModel.chercherUserID(membreCourant.iduser);

                temp.pseudo = user[0].pseudo;

                jsonRetour.membres.push(temp);
            }
        }

        /* Infos projet */
        jsonRetour.sujet = {};

        jsonRetour.sujet.titre = projet[0].nom;
        jsonRetour.sujet.id_projet = projet[0].idprojet;
        jsonRetour.sujet.description = projet[0].description_projet;
        jsonRetour.sujet.lien_sujet = projet[0].sujet;
        jsonRetour.sujet.mots = [];

        let listeMots = await motCleModel.recupererMot(projet[0].idprojet);

        for (j = 0; j < listeMots.length; j++) {

            let motCourant = listeMots[j];
            jsonRetour.sujet.mots.push(motCourant.mot);
        }

        /*L'étudiant fait parti de l'équipe*/
        //Amélioration, rajouter si profil = etudiant regarder si fait partie de l'quipe, pour ne pas le faire
        //pour l'admin

        if (req.userProfile === 'gestionnaire') {
            const gerer_ia = await gererProjet.chercherGestionnaireIA(id, req.id);
            const gerer_ext = await gererProjet.chercherGestionnaireExtID(id, req.id);

            if ((gerer_ia.length > 0) || (gerer_ext > 0)) {
                jsonRetour.superUser = true;
            } else {
                jsonRetour.superUser = false;
            }
        }

        if (req.userProfile === 'admin') {
            jsonRetour.superUser = true;
        } else {
            jsonRetour.superUser = false;
        }

        const etudiant = await appartenirEquipe(req.id, idEquipe);

        if (etudiant.length === 0) {
            jsonRetour.dansEquipe = false;
            return jsonRetour;
        }
        jsonRetour.dansEquipe = true;

        if (jsonRetour.capitaine.id === req.id) {
            jsonRetour.estCapitaine = true;

        } else {
            jsonRetour.estCapitaine = false;
        }

        jsonRetour.reponseQuestionAll = temp1.preferencequestionnaire;

        if (temp1.lien_github == null) {
            jsonRetour.git = '';
        } else {
            jsonRetour.git = temp1.lien_github;
        }

        if (temp1.liendiscussion == null) {
            jsonRetour.lien_discussion = '';
        } else {
            jsonRetour.lien_discussion = temp1.liendiscussion;
        }

        /*liste projet event pour modifier le choix*/
        jsonRetour.liste_projets_event = [];

        const listeProjetEvent = await projetModel.recuperer_projets(idevent);

        for (i = 0; i < listeProjetEvent.length; i++) {

            temp = {};

            if (temp1.idprojet != listeProjetEvent[i].idProjet) {
                temp = {};
                temp.id_projet = listeProjetEvent[i].idprojet;
                temp.titre = listeProjetEvent[i].nom;
                temp.description = listeProjetEvent[i].description_projet;
                temp.lien_sujet = listeProjetEvent[i].sujet;
                temp.mots = [];

                listeMots = await motCleModel.recupererMot(listeProjetEvent[i].idprojet);

                for (j = 0; j < listeMots.length; j++) {

                    let motCourant = listeMots[j];
                    temp.mots.push(motCourant.mot);
                }

                jsonRetour.liste_projets_event.push(temp);
            }
        }

        //Liste user en attente, id, pseudo, message
        const demande = await recupererDemande(idEquipe);

        jsonRetour.liste_user_attente = [];

        for (i = 0; i < demande.length; i++) {

            temp = {};
            temp.id = demande[i].iduser;

            user = await userModel.chercherUserID(demande[i].iduser);

            temp.pseudo = user[0].pseudo;

            if (demande[i].messagedemande == null) {
                temp.message = '';
            } else {
                temp.message = demande[i].messagedemande;
            }
            jsonRetour.liste_user_attente.push(temp);
        }
        return jsonRetour;
    }

    catch (error) {
        throw error;
    }
}

/*Permet de voir les équipes associées à un projet */
async function jsonListeEquipeProjet(idProjet) {

    try {
        const equipeList = await listeEquipeProjet(idProjet);

        jsonRetour = {};
        jsonRetour.equipe = []

        for (i = 0; i < equipeList.length; i++) {

            equipeCourante = equipeList[i];

            temp = {};

            /*Equipe */
            temp.id = equipeCourante.idequipe;
            temp.nom = equipeCourante.nom;

            /*Nombre de membres de l'équipe */
            const membres = await ListeMembre(temp.id);
            temp.nombreMembre = membres.length;

            /*Projet */
            temp.idProjet = idProjet;
            const projet = (await projetModel.chercherProjetId(idProjet))[0];
            temp.nomProjet = projet.nom;

            /*Nombres de personnes suffisantes pour participer*/
            let idevent = projet.idevent;
            const event = (await chercherEvenement(idevent))[0];

            if (temp.nombreMembre >= event.nombre_min_equipe) {
                temp.valide = true;
            } else {
                temp.valide = false;
            }
            temp.nombreMaxEquipe = event.nombre_max_equipe;
            temp.nomEvent = event.nom;
            temp.idEvent = event.idevent;
            temp.dernierSuivi = '';

            /*Capitaine */
            temp.idCapitaine = equipeCourante.idcapitaine;
            temp.nomCapitaine = ((await userModel.chercherUserID(equipeCourante.idcapitaine))[0].pseudo);

            jsonRetour.equipe.push(temp);
        }
        return jsonRetour;
    } catch (error) {
        throw error;
    }
}
async function jsonMesEquipes(idUser) {

    let jsonRetour = {};
    jsonRetour.equipe = [];

    const mesEquipes = await aUneEquipe(idUser);

    for (i = 0; i < mesEquipes.length; i++) {

        let idEquipeCourante = mesEquipes[i].idequipe;
        let equipeCouranteInfos = (await chercherEquipeID(idEquipeCourante))[0];

        temp = {};

        /*Equipe */
        temp.id = idEquipeCourante;
        temp.nom = equipeCouranteInfos.nom;

        /*Nombre de membres de l'équipe */
        const membres = await ListeMembre(temp.id);
        temp.nombreMembre = membres.length;

        /*Projet */
        temp.idProjet = equipeCouranteInfos.idprojet;
        const projet = (await projetModel.chercherProjetId(temp.idProjet))[0];
        temp.nomProjet = projet.nom;

        /*Capitaine */
        if (equipeCouranteInfos.idcapitaine === idUser) {
            temp.estCapitaine = true;

        } else {
            temp.estCapitaine = false;

        }
        temp.nomCapitaine = ((await userModel.chercherUserID(equipeCouranteInfos.idcapitaine))[0].nom);

        /*Nombres de personnes suffisantes pour participer*/
        let idevent = projet.idevent;
        const event = (await chercherEvenement(idevent))[0];

        temp.nombre_max_equipe = event.nombre_max_equipe;
        temp.nomEvent = event.nom;

        if (new Date(event.date_fin) < new Date()) {
            temp.fini = true;
        } else {
            temp.fini = false;
        }
        jsonRetour.equipe.push(temp);
    }
    return jsonRetour;
}

async function jsonEquipesOuvertes(idEvent, req) {

    jsonRetour = {};
    jsonRetour.equipes = [];

    const projet_event = await projetModel.recuperer_projets(idEvent);
    let listeEquipes;
    for (i = 0; i < projet_event.length; i++) {

        listeEquipes = await listeEquipeProjet(projet_event[i].idprojet);

        for (i = 0; i < listeEquipes.length; i++) {
            if (listeEquipes[i].statut_recrutement === 'ouvert') {
                temp = {};
                temp.idEquipe = listeEquipes[i].idequipe;
                temp.nom = listeEquipes[i].nom;

                /*Nom du proejt */
                const nomProjet = await projetModel.chercherProjetId(listeEquipes[i].idprojet);
                temp.projet = nomProjet[0].nom;
                temp.lienProjet = nomProjet[0].sujet;

                /*Infos du capitaine */
                temp.capitaine = {};
                const capitaine = await userModel.chercherUserID(listeEquipes[i].idcapitaine);
                temp.capitaine.pseudo = capitaine[0].pseudo;
                temp.capitaine.idCapitaine = capitaine[0].iduser;

                /*Nombre de membres de l'équipe */
                const membres = await ListeMembre(listeEquipes[i].idequipe);
                temp.nbMembres = membres.length;

                /*Nombre de membres max */
                let idevent = nomProjet[0].idevent;

                const event = (await chercherEvenement(idevent))[0];
                temp.maxNbMembres = event.nombre_max_equipe;

                /*Nombres de personnes suffisantes pour participer*/
                if (temp.nbMembres >= event.nombre_min_equipe) {
                    temp.teamValide = true;
                } else {
                    temp.teamValide = false;
                }

                /* Vérifier si une demande a déjà été envoyée */
                const envoyee = await demandeDejaEnvoyee(req.id, temp.idEquipe);
                if (envoyee.length > 0) {
                    temp.hasSentDemand = true;
                } else {
                    temp.hasSentDemand = false;
                }

                jsonRetour.equipes.push(temp);
            }
        }
    }
    return jsonRetour;
}

function envoyerDemande(valeurs) {

    const envoyer = `INSERT INTO DemandeEquipe
    (idUser, idEquipe, messageDemande)
    VALUES ($1, $2, $3)`;

    try {
        pool.query(envoyer, valeurs);
    } catch (error) {
        throw (error);
    }
}

async function demandeDejaEnvoyee(idUser, idEquipe) {

    const envoyee = `SELECT *
    FROM DemandeEquipe 
    WHERE idUser = $1 AND idEquipe = $2`;

    return new Promise((resolve, reject) => {
        pool.query(envoyee, [idUser, idEquipe])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/*A supprimer peut etre*/
// async function jsonInfosEquipe(idEquipe) {

//     try {

//         const chercher = await chercherEquipeID(idEquipe);

//         jsonRetour = {}

//         if (chercher === 0) {
//             return 'aucun';
//         } else {

//             temp = chercher[0];

//             jsonRetour.id = temp.idequipe;
//             jsonRetour.nom = temp.nom;
//             jsonRetour.description = temp.description_equipe;
//             jsonRetour.statut = temp.statut_recrutement;
//             jsonRetour.idProjet = temp.idprojet;
//             jsonRetour.idCapitaine = temp.idcapitaine;

//             if (temp.lien_github == null) {
//                 jsonRetour.github = '';
//             } else {
//                 jsonRetour.github = temp.lien_github;
//             }

//             if (temp.finaliste == null) {
//                 jsonRetour.finaliste = '';

//             } else {
//                 jsonRetour.finaliste = temp.finaliste;
//             }


//             return jsonRetour;
//         }

//     } catch (error) {
//         throw error;
//     }
// }

module.exports = {
    aUneEquipe,
    jsonListeEquipeProjet,
    promouvoir,
    supprimerEquipe,
    creerEquipe,
    listeEquipeProjet,
    chercherEquipeID,
    validerEquipe,
    ajouterMembre,
    modifierEquipe,
    suprimerTousMembres,
    equipesOuvertes,
    jsonEquipesOuvertes,
    jsonInformationsEquipe,
    supprimerUnMembre,
    quitterEquipe,
    appartenirEquipe,
    envoyerDemande,
    demandeDejaEnvoyee,
    jsonMesEquipes,
    aUneEquipeDansEvent,
    equipeExiste
}