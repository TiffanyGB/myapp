const pool = require("../database/configDB");

// Envoyer message en tant qu'etudiant
function envoyerMessageEquipe(valeurs){
    const envoyer = `INSERT INTO MessageEquipe
    (idEquipe, contenu, idExpediteur) VALUES ($1, $2, $3)`;

    try{
        pool.query(envoyer, valeurs);
    }catch (error){
        throw error;
    }

}
//Envoyer message en tant que gerant
function envoyerMessageGerant(valeurs){
    const envoyer = `INSERT INTO MessageGestionnaireAdmin
    (idEquipe, contenu, idExpediteur) VALUES ($1, $2, $3)`;

    try{
        pool.query(envoyer, valeurs);
    }catch (error){
        throw error;
    }

}


//Recuperer tous les messages de l'equipe


module.exports = {
    envoyerMessageEquipe,
    envoyerMessageGerant
}