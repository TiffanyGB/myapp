const pool = require('../database/configDB');
const validationDonnees = require('../middleware/validationDonnees');
const userModel = require('./userModel');
const projetModel = require('./projetModel')
const { body } = require('express-validator');
const motCleModel = require('../models/motCleModel');
const modelsInterface = require('../interfaces/EventInterface');
// const { chercherEvenement } = modelsInterface;

const validerEquipe = [
    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .matches(/^[\W0-9a-zA-ZÀ-ÿ \-']*$/)
        .isLength({ min: 2, max: 30 }).withMessage('Le prénom doit avoir une longueur comprise entre 2 et 30 caractères.'),

    body('statut')
        .notEmpty().withMessage('Le statut ne doit pas être vide.')
        .matches(/^(ouvert|fermé)$/).withMessage('Le statut doit être soit "ouvert" soit "fermé".')
        .isLength({ min: 5, max: 6 }).withMessage('Le statut doit avoir une longueur de 6 caractères.'),


    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 10, max: 2000 }).withMessage('Le pseudo doit avoir une longueur comprise entre 3 et 2000 caractères.'),

    //Doit être controllé si le profil est admin ou gestionnaire
    // body('idCapitaine')
    //     .optional() // Le champ est optionnel, s'il n'est pas présent, il sera ignoré
    //     .notEmpty().withMessage("L'id ne doit pas être vide.")
    //     .matches(/^[0-9]*$/).withMessage("L'id ne doit contenir que des chiffres.")
    //     .isInt({ min: 1, max: 10000 }).withMessage("L'id doit contenir entre 1 et 10000 chiffres."),

    body('idProjet')
        .notEmpty().withMessage('Le prénom ne doit pas être vide.')
        .matches(/^[0-9]*$/).withMessage("L\'id ne doit avoir que des chiffres.")
        .isLength({ min: 1, max: 10000 }),

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
    lien_github = $4,
    idProjet = $5,
    lienDiscussion = $6,
    preferenceQuestionnaire = $7
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

function ajouterMembre(valeurs, idEquipe) {

    for (i = 0; i < valeurs.length; i++) {

        let info = [valeurs[i], idEquipe];
        let inserer = `INSERT INTO Appartenir (idUser, idEquipe)
        VALUES ($1, $2)`;

        try {
            pool.query(inserer, info);
        } catch (error) {
            throw error
        }
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

/* retourner l'id de l'équipe */
function aUneEquipe(idEtudiant) {

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

        if (chercher === 0) {
            return 'aucun';
        } else {

            let temp1 = chercher[0];

            /*Nom*/
            jsonRetour.nom = temp1.nom;

            /*Nombre de membres de l'équipe */
            const membres = await ListeMembre(idEquipe);
            jsonRetour.nombre_membres = membres.length;

            //Nombre max de l'event
            const projet = await projetModel.chercherProjetId(temp1.idprojet);
            let idevent = projet[0].idevent;

            const event = await chercherEvenement(idevent);
            jsonRetour.nombre_max_membres = event[0].nombre_max_equipe;

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
            jsonRetour.capitaine.email = capitaine[0].mail;

            /* Infos des membres, id et pseudo */
            jsonRetour.membres = [];

            for (i = 0; i < membres.length; i++) {

                temp = {};
                membreCourant = membres[i];
                temp.id = membreCourant.iduser;

                let user = await userModel.chercherUserID(membreCourant.iduser);

                temp.pseudo = user[0].pseudo;

                jsonRetour.membres.push(temp);
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
            //Amélioration, rajouter si profil = etudiant regarder si fait partie de l'quipe

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

            jsonRetour.reponseQuestionAll = true;

            if (temp.lien_github == null) {
                jsonRetour.git = '';
            } else {
                jsonRetour.git = temp.lien_github;
            }

            if (temp.liendiscussion == null) {
                jsonRetour.lien_discussion = '';
            } else {
                jsonRetour.lien_discussion = temp.liendiscussion;
            }

            /*liste projet event pour modifier le choix*/
            jsonRetour.liste_projets_event = [];

            const listeProjetEvent = await projetModel.recuperer_projets(idevent);

            console.log(listeProjetEvent)
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

    } catch (error) {
        throw error;
    }
}

/*A supprimer peut etre*/
async function jsonInfosEquipe(idEquipe) {

    try {

        const chercher = await chercherEquipeID(idEquipe);

        jsonRetour = {}

        if (chercher === 0) {
            return 'aucun';
        } else {

            temp = chercher[0];

            jsonRetour.id = temp.idequipe;
            jsonRetour.nom = temp.nom;
            jsonRetour.description = temp.description_equipe;
            jsonRetour.statut = temp.statut_recrutement;
            jsonRetour.idProjet = temp.idprojet;
            jsonRetour.idCapitaine = temp.idcapitaine;

            if (temp.lien_github == null) {
                jsonRetour.github = '';
            } else {
                jsonRetour.github = temp.lien_github;
            }

            if (temp.finaliste == null) {
                jsonRetour.finaliste = '';

            } else {
                jsonRetour.finaliste = temp.finaliste;
            }


            return jsonRetour;
        }

    } catch (error) {
        throw error;
    }
}

/**Permet de voir les équipes associées à un projet */
async function jsonListeEquipeProjet(idProjet) {

    try {
        const equipeList = await listeEquipeProjet(idProjet);

        jsonRetour = {};
        jsonRetour.equipe = []

        for (i = 0; i < equipeList.length; i++) {

            equipeCourante = equipeList[i];

            temp = {};

            //temp.img = equipeList IMAGE

            temp.id = equipeCourante.idequipe;
            temp.idProjet = idProjet;
            temp.nom = equipeCourante.nom;
            if (equipeCourante.description_equipe === null) {
                temp.description = '';
            } else {
                temp.description = equipeCourante.description_equipe;
            }
            temp.statut = equipeCourante.statut_recrutement;

            if (equipeCourante.lien_github === null) {
                temp.lien_github = '';
            } else {
                temp.lien_github = equipeCourante.lien_github;
            }

            temp.idprojet = equipeCourante.idprojet;
            temp.idCapitaine = equipeCourante.idcapitaine;

            if (equipeCourante.finaliste === null) {
                temp.finaliste = '';
            } else {
                temp.finaliste = equipeCourante.finaliste;
            }

            jsonRetour.equipe.push(temp);
        }

        return jsonRetour;

    } catch (error) {

        console.error(error);
    }
}

async function jsonEquipesOuvertes() {

    /*Récupérer toutes les équipes ouvertes */
    const equipes = await equipesOuvertes();
    jsonRetour = {};
    jsonRetour.equipes = [];

    for (i = 0; i < equipes.length; i++) {
        temp = {};
        temp.nom = equipes[i].nom;
        temp.description = equipes[i].description_equipe;

        /*Nom du proejt */
        const nomProjet = await projetModel.chercherProjetId(equipes[i].idprojet);
        temp.nomProjet = nomProjet[0].nom;
        temp.lienProjet = nomProjet[0].sujet;


        /*Infos du capitaine */
        const capitaine = await userModel.chercherUserID(equipes[i].idcapitaine);
        temp.nomCapitaine = capitaine[0].nom;
        temp.prenomCapitaine = capitaine[0].prenom;

        /*Nombre de membres de l'équipe */
        const membres = await ListeMembre(equipes[i].idequipe);
        temp.nombreMembre = membres.length;

        /* */
        let idevent = nomProjet[0].idevent;

        const event = await chercherEvenement(idevent);
        temp.maxMembresEvent = event[0].nombre_max_equipe;

        jsonRetour.equipes.push(temp);
    }
    return jsonRetour;
}

module.exports = {
    aUneEquipe,
    jsonListeEquipeProjet,
    promouvoir,
    supprimerEquipe,
    creerEquipe,
    listeEquipeProjet,
    jsonInfosEquipe,
    chercherEquipeID,
    validerEquipe,
    ajouterMembre,
    modifierEquipe,
    suprimerTousMembres,
    equipesOuvertes,
    jsonEquipesOuvertes,
    jsonInformationsEquipe,
    supprimerUnMembre,
    quitterEquipe
}