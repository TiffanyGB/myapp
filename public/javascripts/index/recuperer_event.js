const pool = require('../../../database/configDB');


function nbEvent() {
    const nb = `SELECT COUNT(*) AS total FROM Evenement`;

    return new Promise((resolve, reject) => {
        pool.query(nb)
            .then((result) => {
                resolve(result.rows[0].total);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function nbProjets(idEvent) {
    const nb = `SELECT COUNT(*) AS total FROM projet where idevent = '${idEvent}'`;

    return new Promise((resolve, reject) => {
        pool.query(nb)
            .then((result) => {
                resolve(result.rows[0].total);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function recuperer_projets(idEvent) {

    const chercherProjets = `SELECT * FROM Projets WHERE idevent = ${idEvent}`
}

function nbRessources(idProjet) {
    const nb = `SELECT COUNT(*) AS total FROM projet where idprojet = '${idProjet}'`;

    return new Promise((resolve, reject) => {
        pool.query(nb)
            .then((result) => {
                resolve(result.rows[0].total);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
async function recupererEvent(idEvent) {
    const chercherEvent = `SELECT * FROM Evenement WHERE idevent = ${idEvent}`;
    let tabRetour = {};

    try {
        const res = await pool.query(chercherEvent);
        if (res.rows.length === 1) {
            const event = res.rows[0];

            /**Insertion des données de l'event */
            tabRetour.title = event.nom;
            tabRetour.date_creation = '' + event.debut_inscription + '';
            tabRetour.date_debut = event.date_debut;
            tabRetour.date_fin = event.date_fin;
            tabRetour.type_challenge = event.type_event;
            tabRetour.nbMinParEquipe = event.nombre_min_equipe;
            tabRetour.nbMaxParEquipe = event.nombre_max_equipe;

            /**Récupérer nombre de projets */
            const countProjets = await nbProjets(idEvent);

            console.log('Nb projets', countProjets);

            /**Faire les regles */

            /**Les projets */
            for (i = 0; i < countProjets; i++) {

            }
            /**Les ressources */

            return tabRetour;
        } else {
            throw new Error('Evenement non trouvé: erreur dans le fichier "' + __filename + '" dans "' + arguments.callee.name + '"');
        }
    } catch (error) {
        throw error;
    }
}


module.exports = {
    nbEvent,
    recupererEvent
}