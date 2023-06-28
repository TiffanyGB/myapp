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
function recupererEvent(idEvent){

    const chercherEvent = `SELECT * FROM Evenement where idevent = ${idEvent}`;
    let tabRetour = {}; 

    return new Promise((resolve, reject) => {
        pool.query(chercherEvent)
        .then((res) => {
            if(res.rows.length = 1){
                const event = res.rows[0];
                let info = event.nom;

                tabRetour.title = "'" + info + "'";
                console.log('BBBBBBBBB' + info);
                resolve(event);
            }else{
                reject(new Error('Evenement non trouvé: erreur dans le fichier "' + __filename + '" dans "'  + arguments.callee.name + '"'));
            }
        })
        .catch((error) => {
            reject(error);
        });

    });
}

module.exports = {
    nbEvent,
    recupererEvent
}