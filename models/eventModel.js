const pool = require('../database/configDB');
const projetModel = require('./projetModel');
const regleModel = require('./reglesModel');
const motCleModel = require('./motCleModel');
const ressourceModel = require('./ressourceModel');
const equipeModel = require('./equipeModel');
const { jsonListeEquipeProjet} = require('./equipeModel');
const env = require('../environnement.json');
const url_images = env.backend.assets.images;

const { validateurDonnéesMiddleware } = require('../verifications/validateur');
const { body } = require('express-validator');

const validateEvent = [
    body('typeEvent')
        .optional()
        .notEmpty().withMessage('Le type ne doit pas être vide.')
        .matches(/^(challenge|battle)$/).withMessage('Le type doit être soit "challenge" soit "battle".')
        .isLength({ min: 2, max: 30 }).withMessage('Le type doit avoir une longueur comprise entre 2 et 30 caractères.'),

    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .custom((value) => !(/^\s+$/.test(value)))
        .matches(/^[\Wa-zA-ZÀ-ÿ0-9 \-']*$/)
        .isLength({ min: 2, max: 50 }).withMessage('Le nom doit avoir une longueur comprise entre 3 et 50 caractères.'),

    body('inscription')
        .notEmpty().withMessage('La date ne doit pas être vide.')
        .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
        .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('La date ne doit contenir que des lettres et des chiffres.'),

    body('debut')
        .notEmpty().withMessage('La date ne doit pas être vide.')
        .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
        .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('La date ne doit contenir que des lettres et des chiffres.'),

    body('fin')
        .notEmpty().withMessage('La date ne doit pas être vide.')
        .isLength({ min: 10, max: 30 }).withMessage('La date doit avoir une longueur comprise entre 3 et 30 caractères.')
        .matches(/^[0-9a-zA-Z\-\ :.]+$/).withMessage('La date ne doit contenir que des lettres et des chiffres.'),

    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => !(/^\s+$/.test(value)))
        .isLength({ min: 0, max: 5000 }).withMessage('La description doit avoir une longueur comprise entre 0 et 5000 caractères.'),


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
        .custom((value) => !(/^\s+$/.test(value)))
        .isLength({ min: 2, max: 3000 }).withMessage('Le message de fin doit avoir une longueur comprise entre 2 et 3000 caractères.'),

    /**Appel du validateur */
    validateurDonnéesMiddleware
];

/*Liste de tous les événements */
async function chercherListeEvenement() {

    const chercher = 'SELECT * FROM Evenement';

    try {
        const res = await pool.query(chercher);
        return res.rows;
    } catch (error) {
        throw error;
    }
}

/*Chercher un événement par son id*/
async function chercherEvenement(idEvent) {

    const chercher = 'SELECT * FROM Evenement WHERE idEvent = $1';

    try {
        const res = await pool.query(chercher, [idEvent]);
        return res.rows;
    } catch (error) {
        throw error;
    }
}

/*Création d'événement */
async function creerEvent(valeurs_event, regles) {
    const inserer = `
      INSERT INTO Evenement (type_event, nom, debut_inscription, date_debut, date_fin, description_event, nombre_min_equipe, nombre_max_equipe, img)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING idevent`;

    try {
        const result = await pool.query(inserer, valeurs_event);
        /* Récupération de l'id de l'event (pour l'insertion des règles) */
        const idEvent = result.rows[0].idevent;

        /*Insertion des règles */
        for (let i = 0; i < regles.length; i++) {
            regleModel.ajouterRegle(idEvent, regles[i].titre, regles[i].contenu);
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
          derniereModif = CURRENT_TIMESTAMP,
          img = $9
        WHERE idEvent = $10`;

    try {
        await pool.query(modifier, valeurs);
    } catch (error) {
        throw error;
    }
}

/*Supprimer un event*/
function supprimerEvent(idEvent) {

    const supprimer = `DELETE FROM Evenement WHERE idEvent = $1`;

    try {
        pool.query(supprimer, [idEvent])
    } catch (error) {
        throw (error);
    }
}

/**
 * Récupérer les événements terminés dans la base de données
 * @returns {Promise<Array<Object>>} Une promesse résolue avec un tableau d'objets représentant les événements passés.
 * En cas d'erreur, la promesse est rejetée avec l'erreur rencontrée.
 */
async function recupererAncienEvents() {
    const query = `SELECT * FROM Evenement WHERE DATE(date_fin) < NOW();`;

    try {
        const chercher = await pool.query(query);
        return chercher.rows;
    } catch (error) {
        throw error;
    }
}

/**
 * Récupérer les événements non terminés dans la base de données
 * @returns {Promise<Array<Object>>} Une promesse résolue avec un tableau d'objets représentant les événements en cours.
 * En cas d'erreur, la promesse est rejetée avec l'erreur rencontrée.
 */
async function recupererEventActuel() {
    const query = `SELECT * FROM Evenement WHERE date_fin > NOW()`;

    try {
        const chercher = await pool.query(query);
        return chercher.rows;
    } catch (error) {
        throw error;
    }
}

async function toutesInfosEvent(idEvent, tabRetour) {
    try {
        const event = (await chercherEvenement(idEvent))[0];

        tabRetour.idEvent = event.idevent;
        tabRetour.title = event.nom;
        tabRetour.date_creation = event.debut_inscription;
        tabRetour.date_debut = event.date_debut;
        tabRetour.date_fin = event.date_fin;
        tabRetour.type_challenge = event.type_event;
        tabRetour.description = event.description_event;
        tabRetour.nbMinParEquipe = event.nombre_min_equipe;
        tabRetour.nbMaxParEquipe = event.nombre_max_equipe;
        tabRetour.image = url_images + "/" + event.img;

        if (event.message_fin == null) {
            tabRetour.messageFin = '';
        } else {
            tabRetour.messageFin = event.message_fin;
        }
        tabRetour.regles = [];
        tabRetour.projet = [];
        tabRetour.themes = [];
    } catch (error) {
        throw error;
    }

}

async function jsonEventChoisi(idEvent, typeUser, req) {

    let tabRetour = {};
    const motsDejaAjoutes = new Set();


    try {
        /*Récupérer toutes les infos liés à l'event*/
        toutesInfosEvent(idEvent, tabRetour);

        /*Les règles de l'event */
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

        /*Pour chaque projet, récupérer ses infos, ses ressources et ses mots-clés */
        for (i = 0; i < listeProjets.length; i++) {

            let projetCourant = listeProjets[i];
            let projetInfos = {};

            projetModel.toutesInfosProjet(projetCourant, projetInfos);

            /*Mots-clés*/
            const listeMots = await motCleModel.recupererMot(projetCourant.idprojet);

            for (let j = 0; j < listeMots.length; j++) {
                let motCourant = listeMots[j];
                let motLowerCase = motCourant.mot.toLowerCase();
                projetInfos.thematique.push(motCourant.mot);

                if (!motsDejaAjoutes.has(motLowerCase)) {
                    tabRetour.themes.push(motCourant.mot);
                    motsDejaAjoutes.add(motLowerCase);
                }
            }

            /**Les ressources */
            const listeRessource = await ressourceModel.recuperer_toutes_ressources(projetCourant.idprojet);

            projetInfos.ressources = [];

            for (j = 0; j < listeRessource.length; j++) {

                let ressourceCourante = listeRessource[j];
                let ressourcesInfos = {};
                let statut = ressourceCourante.statut;
                let date = ressourceCourante.date_apparition;

                /*Les ressources privées nécessient d'être connecté  */
                if (((statut === 'public') || (statut === 'privé' && typeUser != 'aucun')) && (date < new Date())) {
                    ressourcesInfos.titre = ressourceCourante.titre;
                    ressourcesInfos.type = ressourceCourante.type_ressource;
                    ressourcesInfos.lien = ressourceCourante.lien;
                    ressourcesInfos.description = ressourceCourante.description_ressource;
                    ressourcesInfos.statut = statut;

                    projetInfos.ressources.push(ressourcesInfos);
                }
            }
            tabRetour.projet.push(projetInfos);
        }

        /*Classement --> Obsolète*/
        tabRetour.classement = [];
        /*Finalistes --Obsolète*/
        tabRetour.finalistes = [];

        /*Infos étudiants, équipe dans l'event s'il en a une */
        if (typeUser === 'etudiant') {

            const idEquipe = await equipeModel.aUneEquipeDansEvent(req.id, idEvent);

            tabRetour.userIsInterested = false;

            if (idEquipe > 0) {
                tabRetour.teamId = idEquipe;
            } else {
                tabRetour.teamId = -1;
            }
        } else {
            tabRetour.userIsInterested = false;
            tabRetour.teamId = -1;
        }
        return tabRetour;
    } catch (error) {
        throw error;
    }
}

/*Tous les events de l'asso */
async function creerJsonTousEvents() {

    try {

        let listesAnciens = await recupererAncienEvents();
        let listeActuels = await recupererEventActuel();

        tabRetour = {};

        tabRetour.oldEvents = [];
        tabRetour.actualEvent = [];
        const motsDejaAjoutes = new Set();

        /*Infos des anciens  events*/
        for (i = 0; i < listesAnciens.length; i++) {

            ancienCourant = listesAnciens[i];
            courantInfos = {};
            let motCle = [];


            courantInfos.type = ancienCourant.type_event;
            courantInfos.id = ancienCourant.idevent;
            courantInfos.titre = ancienCourant.nom;
            courantInfos.image = url_images + "/" + ancienCourant.img;
            courantInfos.debut = ancienCourant.date_debut;
            courantInfos.fin = ancienCourant.date_fin;
            courantInfos.phase = "Terminé";

            let listeProjets = await projetModel.recuperer_projets(ancienCourant.idevent);
            let gainTotal = 0;

            /*les mots-clés provenant de la liste des projets de l'event */

            for (j = 0; j < listeProjets.length; j++) {
                gainTotal += listeProjets[j].recompense;

                let recupeMot = await motCleModel.recupererMot(listeProjets[j].idprojet);

                for (k = 0; k < recupeMot.length; k++) {
                    let mot = recupeMot[k].mot;

                    if (!motCle.includes(mot)) {
                        motCle.push(mot);
                    }
                }
            }

            courantInfos.mot = motCle;
            courantInfos.gain = gainTotal;

            tabRetour.oldEvents.push(courantInfos);
        }

        /*Evenement pas encore passés */
        for (i = 0; i < listeActuels.length; i++) {

            actuelCourant = listeActuels[i];
            courantInfos = {};

            courantInfos.type = actuelCourant.type_event;
            courantInfos.id = actuelCourant.idevent;
            courantInfos.titre = actuelCourant.nom;
            courantInfos.image = url_images + "/" + actuelCourant.img;
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
                    let mot = recupeMot[k].mot;

                    if (!motCle.includes(mot)) {
                        motCle.push(mot);
                    }
                }
            }
            courantInfos.mot = motCle;
            courantInfos.gain = gainTotal;

            tabRetour.actualEvent.push(courantInfos);
        }
        return tabRetour;
    }
    catch (error) {
        throw error;
    }
}

/*Liste des équipes associées à un event */
async function jsonlisteEquipeEvent(idEvent) {

    try {
        /*On récupère la liste des projets liés à l'evenement */
        const listeProjets = await projetModel.recuperer_projets(idEvent);

        const jsonRetour = {};
        jsonRetour.equipes = [];

        /*On récupère les équipes de chaques event*/
        for (let i = 0; i < listeProjets.length; i++) {
            let equipeList = await jsonListeEquipeProjet(listeProjets[i].idprojet);

            for (j = 0; j < equipeList.equipe.length; j++) {
                jsonRetour.equipes.push(equipeList.equipe[j]);
            }
        }
        return (jsonRetour);

    } catch (error) {
        throw error;
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
    const event = await chercherEvenement(idEvent);
    if (event[0].img == null) {
        jsonRetour.image = '';
    } else {
        jsonRetour.image = event[0].img;
    }    


    jsonRetour.projet.forEach((projet) => {
        delete projet.ressources;
        delete projet.recompense;
        delete projet.thematique;
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