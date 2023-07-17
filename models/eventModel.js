const pool = require('../database/configDB');
const projetModel = require('./projetModel');
const regleModel = require('./reglesModel');
const motCleModel = require('./motCleModel');
const ressourceModel = require('./ressourceModel');
const classementModel = require('./classementModel');
const finalisteModel = require('./finalisteModel');
const equipeModel = require('./equipeModel');

/**Liste des événements */
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

/**Chercher un événement par son id*/

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

async function creerEvent(valeurs_event, regles) {
    const inserer = `
      INSERT INTO Evenement (type_event, nom, debut_inscription, date_debut, date_fin, description_event, nombre_min_equipe, nombre_max_equipe)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING idevent
    `;
  
    try {
      const result = await pool.query(inserer, valeurs_event);
      const id = result.rows[0].idevent;
  
      for (let i = 0; i < regles.length; i++) {
        await regleModel.ajouterRegle(id, regles[i].titre, regles[i].contenu);
      }
  
      return id;
    } catch (error) {
      console.error('Erreur lors de l\'insertion des données côté étudiant :', error);
      throw error;
    }
  }
  

/**Modifier */
async function modifierEvent(valeurs) {

    try {
        const modifier = `
        UPDATE Evenement 
        SET
          nom = ${valeurs[0] ? `'${valeurs[0]}'` : 'nom'},
          debut_inscription = ${valeurs[1] ? `'${valeurs[1]}'` : 'debut_inscription'},
          date_debut = ${valeurs[2] ? `'${valeurs[2]}'` : 'date_debut'},
          date_fin = ${valeurs[3] ? `'${valeurs[3]}'` : 'date_fin'},
          description_event = ${valeurs[4] ? `'${valeurs[4]}'` : 'description_event'},
          img = ${valeurs[5] ? `'${valeurs[5]}'` : 'img'},
          nombre_min_equipe = ${valeurs[6] ? `'${valeurs[6]}'` : 'nombre_min_equipe'},
          nombre_max_equipe = ${valeurs[7] ? `'${valeurs[7]}'` : 'nombre_max_equipe'},
          message_fin = ${valeurs[8] ? `'${valeurs[8]}'` : 'message_fin'},
          derniereModif = CURRENT_TIMESTAMP
        WHERE idEvent = '${idEvent}'`;

        try {
            pool.query(modifier);
            console.log("reussi");
        }
        catch (error) {
            console.error("Erreur lors de la mise à jour de l'événement", error);
        }




    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'étudiant", error);
        throw error;
    }
}


/**Supprimer */


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


function recuperer_message_fin(idEvent) {

    const message = `SELECT * FROM Evenement WHERE idEvent = '${idEvent}'`;

    return new Promise((resolve, reject) => {
        pool.query(message)
            .then((res) => {
                resolve(res);
            })
            .catch((error) => {
                reject(error);
            });
    })
}

async function jsonEventChoisi(idEvent, typeUser) {
    const chercherEvent = `SELECT * FROM Evenement WHERE idevent = ${idEvent}`;
    let tabRetour = {};

    try {
        const res = await pool.query(chercherEvent);
        if (res.rows.length === 1) {
            const event = res.rows[0];

            /**Insertion des données de l'event */
            tabRetour.title = event.nom;
            tabRetour.themes = [];
            tabRetour.date_creation = event.debut_inscription;
            tabRetour.date_debut = event.date_debut;
            tabRetour.date_fin = event.date_fin;
            tabRetour.type_challenge = event.type_event;
            tabRetour.description = event.description_event;
            tabRetour.nbMinParEquipe = event.nombre_min_equipe;
            tabRetour.nbMaxParEquipe = event.nombre_max_equipe;
            tabRetour.projet = [];
            tabRetour.regles = [];


            /**Récupérer les projets associé à l'event*/
            const listeProjets = await projetModel.recuperer_projets(idEvent);

            const listeRegles = await regleModel.recuperer_regles(idEvent);
            for (i = 0; i < listeRegles.length; i++) {

                let regleCourante = listeRegles[i];
                let reglesInfos = {};

                reglesInfos.titre = regleCourante.titre;
                reglesInfos.contenu = regleCourante.contenu;

                tabRetour.regles.push(reglesInfos);
            }

            /**Les projets */
            for (i = 0; i < listeProjets.length; i++) {

                let projetCourant = listeProjets[i];
                let projetInfos = {};

                projetInfos.img = projetCourant.imgprojet;
                projetInfos.titre = projetCourant.nom;
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

            if (classementFinal = []) {
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

            if (finalistes = []) {
                tabRetour.finalistes = null;
            } else {

                tabRetour.finalistes = [];

                for (i = 0; i < finalistes.length; i++) {
                    tabRetour.finalistes.push(finalistes[i]);
                }
            }

            let message = await recuperer_message_fin(idEvent);

            if (message = null) {
                tabRetour.messageFin = null;
            } else {
                tabRetour.messageFin = message;
            }

            if (typeUser === 'etudiant') {

                const equipe = await equipeModel.aUneEquipe(4); /**Mettre id User */
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
        } else {
            throw new Error('Evenement non trouvé: erreur dans le fichier "' + __filename + '" dans "' + arguments.callee.name + '"');
        }
    } catch (error) {
        throw error;
    }
}

async function creerJsonTousEvents() {

    try {

        let listesAnciens = await recupererAncienEvents();
        let listeActuels = await recupererEventActuel();

        if (listesAnciens.rows.length === 0) {
            return false;
        } else {

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
    }
    catch (error) {
        throw error;
    }
}


module.exports = {
    chercherEvenement,
    chercherListeEvenement,
    recuperer_message_fin,
    jsonEventChoisi,
    creerJsonTousEvents,
    modifierEvent,
    creerEvent
}