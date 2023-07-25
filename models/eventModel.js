const pool = require('../database/configDB');
const projetModel = require('./projetModel');
const regleModel = require('./reglesModel');
const motCleModel = require('./motCleModel');
const ressourceModel = require('./ressourceModel');
const classementModel = require('./classementModel');
const finalisteModel = require('./finalisteModel');
const equipeModel = require('./equipeModel');
const { aUneEquipe, jsonListeEquipeProjet } = require('./equipeModel');

const validationDonnees = require('../middleware/validationDonnees');
const { body } = require('express-validator');

const validateEvent = [
    body('typeEvent')
        .optional()
        .notEmpty().withMessage('Le type ne doit pas être vide.')
        .matches(/^(challenge|battle)$/).withMessage('Le type doit être soit "challenge" soit "battle".')
        .isLength({ min: 2, max: 30 }).withMessage('Le type doit avoir une longueur comprise entre 2 et 30 caractères.'),

    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .matches(/^[\Wa-zA-ZÀ-ÿ0-9 \-']*$/)
        .isLength({ min: 2, max: 50 }).withMessage('Le nom doit avoir une longueur comprise entre 3 et 50 caractères.'),

    body('inscription')
        .notEmpty().withMessage('La date ne doit pas être vide.')
        .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
        .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('Le pseudo ne doit contenir que des lettres et des chiffres.'),

    body('debut')
        .notEmpty().withMessage('La date ne doit pas être vide.')
        .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
        .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('Le pseudo ne doit contenir que des lettres et des chiffres.'),

    body('fin')
        .notEmpty().withMessage('La date ne doit pas être vide.')
        .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
        .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('Le pseudo ne doit contenir que des lettres et des chiffres.'),

    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 0, max: 5000 }).withMessage('Le lien GitHub doit avoir une longueur comprise entre 0 et 5000 caractères.'),


    body('nombreMinEquipe')
        .notEmpty().withMessage('La date ne doit pas être vide.')
        .matches(/^[0-9]*$/).withMessage("Il doit y a voir que des chiffres.")
        .isInt({ min: 1, max: 30 }).withMessage('Le nombre minimum par équipe doit être un nombre entre 1 et 30.'),

    body('nombreMaxEquipe')
        .notEmpty().withMessage('La date ne doit pas être vide.')
        .matches(/^[0-9]*$/).withMessage("Il doit y a voir que des chiffres.")
        .isInt({ min: 1, max: 30 }).withMessage('Le nombre maximum par équipe doit être un nombre entre 1 et 30.')
        .custom((value, { req }) => {
            const nombreMinEquipe = parseInt(req.body.nombreMinEquipe);
            const nombreMaxEquipe = parseInt(value);
            if (nombreMaxEquipe < nombreMinEquipe) {
                throw new Error('Le nombre maximum d\'équipes doit être supérieur ou égal au nombre minimum d\'équipes.');
            }
            return true;
        }),

    body('messageFin')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 2, max: 3000 }).withMessage('Le lien GitHub doit avoir une longueur comprise entre 2 et 3000 caractères.'),

    /**Appel du validateur */
    validationDonnees.validateUserData,
];

/*Liste de tous les événements */
function chercherListeEvenement() {

    const users = 'SELECT * FROM Evenement';

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

/*Chercher un événement par son id*/
function chercherEvenement(idEvent) {

    const users = 'SELECT * FROM Evenement WHERE idEvent = $1';

    return new Promise((resolve, reject) => {
        pool.query(users, [idEvent])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/*Création d'événement */
async function creerEvent(valeurs_event, regles) {
    const inserer = `
      INSERT INTO Evenement (type_event, nom, debut_inscription, date_debut, date_fin, description_event, nombre_min_equipe, nombre_max_equipe)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING idevent`;

    try {
        const result = await pool.query(inserer, valeurs_event);
        /* Récupération de l'id de l'event (pour l'insertion des règles) */
        const idEvent = result.rows[0].idevent;

        /*Insertion des règles */
        for (let i = 0; i < regles.length; i++) {
            await regleModel.ajouterRegle(idEvent, regles[i].titre, regles[i].contenu);
        }
        return idEvent;

    } catch (error) {
        throw error;
    }
}

/*Modifier un event*/
async function modifierEvent(valeurs) {

    const modifier = `
        UPDATE Evenement 
        SET
          nom = $1,
          debut_inscription = $2,
          date_debut = $3,
          date_fin = $4,
          description_event = $5,
          nombre_min_equipe = $6,
          nombre_max_equipe = $7,
          message_fin = $8,
          derniereModif = CURRENT_TIMESTAMP
        WHERE idEvent = $9`;

    try {
        await pool.query(modifier, valeurs);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'événement", error);
        throw error;
    }
}

/*Supprimer un event*/
async function supprimerEvent(idEvent) {

    const supprimer = `DELETE FROM Evenement WHERE idEvent = $1`;

    return new Promise((resolve, reject) => {

        pool.query(supprimer, [idEvent])
            .then(() => {
                resolve('ok');
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**
 * Récupérer les événements terminés dans la base de données
 * @returns {Promise<Array<Object>>} Une promesse résolue avec un tableau d'objets représentant les événements passés.
 * En cas d'erreur, la promesse est rejetée avec l'erreur rencontrée.
 */
function recupererAncienEvents() {
    const query = `SELECT * FROM Evenement WHERE DATE(date_fin) < NOW();`;

    return new Promise((resolve, reject) => {
        pool.query(query)
            .then((res) => {
                resolve(res);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**
 * Récupérer les événements non terminés dans la base de données
 * @returns {Promise<Array<Object>>} Une promesse résolue avec un tableau d'objets représentant les événements en cours.
 * En cas d'erreur, la promesse est rejetée avec l'erreur rencontrée.
 */
function recupererEventActuel() {
    const query = `SELECT * FROM Evenement WHERE date_fin > NOW()`;

    return new Promise((resolve, reject) => {
        pool.query(query)
            .then((res) => {
                resolve(res);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function toutesInfosEvent(idEvent, tabRetour) {
    const event = (await chercherEvenement(idEvent))[0];

    /**Insertion des données de l'event */
    tabRetour.idEvent = event.idevent;
    tabRetour.title = event.nom;
    tabRetour.date_creation = event.debut_inscription;
    tabRetour.date_debut = event.date_debut;
    tabRetour.date_fin = event.date_fin;
    tabRetour.type_challenge = event.type_event;
    tabRetour.description = event.description_event;
    tabRetour.nbMinParEquipe = event.nombre_min_equipe;
    tabRetour.nbMaxParEquipe = event.nombre_max_equipe;
    tabRetour.projet = [];
    tabRetour.regles = [];
    tabRetour.themes = [];

    if (event.message_fin == null) {
        tabRetour.messageFin = '';
    } else {
        tabRetour.messageFin = event.message_fin;
    }
}

async function jsonEventChoisi(idEvent, typeUser) {

    let tabRetour = {};

    try {

        toutesInfosEvent(idEvent, tabRetour);



        const listeRegles = await regleModel.recuperer_regles(idEvent);
        for (i = 0; i < listeRegles.length; i++) {

            let regleCourante = listeRegles[i];
            let reglesInfos = {};

            reglesInfos.titre = regleCourante.titre;
            reglesInfos.contenu = regleCourante.contenu;

            tabRetour.regles.push(reglesInfos);
        }
        
        /**Récupérer les projets associé à l'event*/
        const listeProjets = await projetModel.recuperer_projets(idEvent);

        /**Les projets */
        for (i = 0; i < listeProjets.length; i++) {

            let projetCourant = listeProjets[i];
            let projetInfos = {};

            if (projetCourant.imgprojet == null) {
                projetInfos.img = '';
            } else {
                projetInfos.img = projetCourant.imgprojet;
            }
            projetInfos.titre = projetCourant.nom;
            projetInfos.idprojet = projetCourant.idprojet;
            projetInfos.description = projetCourant.description_projet;
            projetInfos.recompense = projetCourant.recompense;
            projetInfos.sujet = projetCourant.sujet;
            projetInfos.thematique = [];


            const listeMots = await motCleModel.recupererMot(projetCourant.idprojet);

            for (j = 0; j < listeMots.length; j++) {

                let motCourant = listeMots[j];

                tabRetour.themes.push(motCourant.mot);

                projetInfos.thematique.push(motCourant.mot);
            }

            /**Les ressources */
            const listeRessource = await ressourceModel.recuperer_ressourcesPubliques(projetCourant.idprojet);

            projetInfos.ressources = [];

            for (j = 0; j < listeRessource.length; j++) {

                let ressourceCourante = listeRessource[j];
                let ressourcesInfos = {};

                ressourcesInfos.titre = ressourceCourante.titre;
                ressourcesInfos.type = ressourceCourante.type_ressource;
                ressourcesInfos.lien = ressourceCourante.lien;
                ressourcesInfos.description = ressourceCourante.description_ressource;
                ressourcesInfos.statut = ressourceCourante.statut;

                projetInfos.ressources.push(ressourcesInfos);

            }

            if (typeUser != 'aucun') {
                const listeRessourcePv = await ressourceModel.recuperer_ressourcesPrivees(projetCourant.idprojet);

                for (j = 0; j < listeRessourcePv.length; j++) {

                    let ressourceCourante = listeRessourcePv[j];
                    let ressourcesPvInfos = {};
                    ressourcesPvInfos.titre = ressourceCourante.titre;
                    ressourcesPvInfos.type = ressourceCourante.type_ressource;
                    ressourcesPvInfos.lien = ressourceCourante.lien;
                    ressourcesPvInfos.statut = ressourceCourante.statut;
                    ressourcesPvInfos.description = ressourceCourante.description_ressource;
                    ressourcesPvInfos.statut = ressourceCourante.statut;

                    projetInfos.ressources.push(ressourcesPvInfos);

                }
            }
            tabRetour.projet.push(projetInfos);
        }

        let classementFinal = await classementModel.chercherClassement(idEvent);

        if (classementFinal == []) {
            tabRetour.classement = null;
        } else {
            tabRetour.podium = [];

            temp = {}

            temp.premier = classementFinal.premier;
            temp.deuxieme = classementFinal.deuxieme;
            temp.troisieme = classementFinal.troisieme;

            tabRetour.podium.push(temp);
        }

        let finalistes = await finalisteModel.chercher_finalistes(idEvent);

        if (finalistes == []) {
            tabRetour.finalistes = '';
        } else {

            tabRetour.finalistes = [];

            for (i = 0; i < finalistes.length; i++) {
                tabRetour.finalistes.push(finalistes[i]);
            }
        }



        if (typeUser === 'etudiant') {

            const equipe = await aUneEquipe(4); /**Mettre id User */
            tabRetour.userIsInterested = false;

            if (equipe > 0) {
                tabRetour.team = 5;
            } else {
                tabRetour.team = -1;
            }
        } else {
            tabRetour.userIsInterested = false;
            tabRetour.team = -1;
        }
        return tabRetour;
    } catch (error) {
        throw error;
    }
}

async function creerJsonTousEvents() {

    try {

        let listesAnciens = await recupererAncienEvents();
        let listeActuels = await recupererEventActuel();

        // if (listesAnciens.rows.length === 0) {
        //     return false;
        // } else {

        tabRetour = {};

        tabRetour.oldEvents = [];
        tabRetour.actualEvent = [];

        for (i = 0; i < listesAnciens.rows.length; i++) {

            ancienCourant = listesAnciens.rows[i];
            courantInfos = {};

            courantInfos.type = ancienCourant.type_event;
            courantInfos.id = ancienCourant.idevent;
            courantInfos.titre = ancienCourant.nom;
            courantInfos.image = ancienCourant.img;
            courantInfos.debut = ancienCourant.date_debut;
            courantInfos.fin = ancienCourant.date_fin;
            courantInfos.phase = "Terminé";

            let listeProjets = await projetModel.recuperer_projets(ancienCourant.idevent);
            let gainTotal = 0;

            let motCle = [];


            for (j = 0; j < listeProjets.length; j++) {
                gainTotal += listeProjets[j].recompense;

                let recupeMot = await motCleModel.recupererMot(listeProjets[j].idprojet);

                for (k = 0; k < recupeMot.length; k++) {
                    motCle.push(recupeMot[k].mot);
                }
            }
            courantInfos.mot = motCle;
            courantInfos.gain = gainTotal;

            tabRetour.oldEvents.push(courantInfos);
        }

        for (i = 0; i < listeActuels.rows.length; i++) {

            actuelCourant = listeActuels.rows[i];
            courantInfos = {};

            courantInfos.type = actuelCourant.type_event;
            courantInfos.id = actuelCourant.idevent;
            courantInfos.titre = actuelCourant.nom;
            courantInfos.image = actuelCourant.img;
            courantInfos.debut = actuelCourant.date_debut;
            courantInfos.fin = actuelCourant.date_fin;

            const currentDate = new Date();
            if (actuelCourant.date_debut > currentDate) {
                courantInfos.phase = "Inscriptions";
            } else {
                courantInfos.phase = "En cours";
            }

            let listeProjets = await projetModel.recuperer_projets(actuelCourant.idevent);
            let gainTotal = 0;
            let motCle = [];


            for (j = 0; j < listeProjets.length; j++) {
                gainTotal += listeProjets[j].recompense;

                let recupeMot = await motCleModel.recupererMot(listeProjets[j].idprojet);

                for (k = 0; k < recupeMot.length; k++) {
                    motCle.push(recupeMot[k].mot);
                }

            }


            courantInfos.mot = motCle;
            courantInfos.gain = gainTotal;

            tabRetour.actualEvent.push(courantInfos);
        }
        return tabRetour;
    }
    // }
    catch (error) {
        throw error;
    }
}

async function jsonlisteEquipeEvent(idEvent) {

    try {
        const listeProjets = await projetModel.recuperer_projets(idEvent);

        const jsonRetour = {}; // Assurez-vous d'initialiser jsonRetour comme un objet vide ici
        jsonRetour.equipes = [];

        for (let i = 0; i < listeProjets.length; i++) {
            let equipeList = await jsonListeEquipeProjet(listeProjets[i].idprojet);


            for (j = 0; j < equipeList.equipe.length; j++) {
                jsonRetour.equipes.push(equipeList.equipe[j]);
            }
        }
        return (jsonRetour);

    } catch (error) {
        console.error(error);
    }
}

/*Pour la modification d'un event */
async function recup_Infos_Modif_Event(idEvent) {

    let jsonRetour = await jsonEventChoisi(idEvent);
    delete jsonRetour.finalistes;
    delete jsonRetour.classement;
    delete jsonRetour.userIsInterested;
    delete jsonRetour.team;
    delete jsonRetour.themes;

    jsonRetour.projet.forEach((projet) => {
        delete projet.ressources;
        delete projet.recompense;
        delete projet.thematique;
        delete projet.img;
        projet.idEvent = idEvent;
    });

    return jsonRetour;
}


module.exports = {
    chercherEvenement,
    chercherListeEvenement,
    jsonEventChoisi,
    creerJsonTousEvents,
    modifierEvent,
    creerEvent,
    supprimerEvent,
    jsonlisteEquipeEvent,
    recup_Infos_Modif_Event,
    validateEvent
}