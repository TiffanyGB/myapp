const pool = require('../../../database/configDB');

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