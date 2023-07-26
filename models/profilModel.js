const pool = require('../database/configDB');

/****************************** PROFIL ****************************/



/****************************** PREFERENCES ****************************/

/*Insérer préférences */
function preferences(id) {

    const inserer = `INSERT INTO Preferences
    (idUser) VALUES ($1)`;

    try {
        pool.query(inserer, [id]);
    } catch {
        throw error;
    }
}

/*Modfier préférences */
function modifierPreferences(valeurs){

    const modifier = `UPDATE Preferences 
    WHERE`;
}


module.exports = {
    preferences,
    modifierPreferences
}