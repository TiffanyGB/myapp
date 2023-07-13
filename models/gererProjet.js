const pool = require('../database/configDB');


async function attribuerProjetIA(idProjet, idGestionnaire) {

    try {
        const valeurs = [idGestionnaire, idProjet];

        const attribuer = `INSERT INTO Gerer_ia_pau (id_g_iapau, idProjet)
        VALUES ($1, $2)`;

        pool.query(attribuer, valeurs)
            .then(() => {
                return 'ok';
            })

    } catch (error) {
        throw error;
    }
}

async function attribuerProjetExterne(idProjet, idGestionnaire) {

    try {
        const valeurs = [idGestionnaire, idProjet];

        const attribuer = `INSERT INTO Gerer_externe (id_g_externe, idProjet)
        VALUES ($1, $2)`;

        pool.query(attribuer, valeurs)
            .then(() => {
                return 'ok';
            })

    } catch (error) {
        throw error;
    }
}

async function destituerProjetExterne(idProjet) {

    try {

        const destituer = `DELETE FROM Gerer_externe 
        WHERE idProjet = $1`;

        pool.query(destituer, [idProjet]);

    } catch (error) {
        throw error;
    }
}
async function destituerProjetIa(idProjet) {

    try {

        const destituer = `DELETE FROM Gerer_ia_pau 
        WHERE idProjet = $1`;

        pool.query(destituer, [idProjet]);

    } catch (error) {
        throw error;
    }
}

module.exports = {
    attribuerProjetIA,
    attribuerProjetExterne,
    destituerProjetExterne,
    destituerProjetIa
}