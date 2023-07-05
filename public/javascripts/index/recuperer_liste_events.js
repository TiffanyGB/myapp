const pool = require('../../../database/configDB');
const recupEvent = require('./recuperer_event_choisi');

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

async function creerJsonEvent() {

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

                let listeProjets = await recupEvent.recuperer_projets(ancienCourant.idevent);
                let gainTotal = 0;
                
                let motCle = [];


                for (j = 0; j < listeProjets.length; j++) {
                    gainTotal += listeProjets[j].recompense;

                    let recupeMot = await recupEvent.recupererMot(listeProjets[j].idprojet);

                    for(k = 0; k < recupeMot.length; k++){
                        motCle.push(recupeMot[k].mot);
                        console.log(recupeMot[k].mot);
                    }
                    console.log(motCle);
                    courantInfos.mot = motCle;
                }

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

                let listeProjets = await recupEvent.recuperer_projets(actuelCourant.idevent);
                let gainTotal = 0;


                for (j = 0; j < listeProjets.length; j++) {
                    gainTotal += listeProjets[j].recompense;
                }

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
    creerJsonEvent,
}