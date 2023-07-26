const pool = require('../database/configDB');

/****************************** PROFIL ****************************/
function supprimerSonCompte(idUser) {

    const supprimer = `DELETE FROM Utilisateur
    WHERE idUser = $1`;

    try {
        pool.query(supprimer, [idUser]);
    } catch (error) {
        throw error;
    }
}

/****************************** PREFERENCES ****************************/

/*Insérer préférences */
function preferences(id) {

    const inserer = `INSERT INTO Preferences
    (idUser) VALUES ($1)`;

    try {
        pool.query(inserer, [id]);
    } catch (error) {
        throw error;
    }
}

/*Modfier préférences */
function modifierPreferences(valeurs) {

    const modifier = `UPDATE Preferences 
    SET
    WHERE idUser = $5`;

    try {
        pool.query(modifier, valeurs);
    } catch (error) {
        throw error;
    }
}

/*Récupérer préférences*/
function getPreferences(idUser) {

    const get = `SELECT * 
    FROM Preferences
    WHERE idUser = $1`;

    try {
        return new Promise((resolve) => {
            pool.query(get, [idUser])
                .then((res) => {
                    resolve(res.rows);
                });
        });
    } catch (error) {
        throw (error);
    }
}

module.exports = {
    preferences,
    modifierPreferences,
    getPreferences,
    supprimerSonCompte,
}