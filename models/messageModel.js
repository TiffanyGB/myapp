const pool = require("../database/configDB");
const userModel = require('./userModel');

// Envoyer message en tant qu'etudiant
function envoyerMessageEquipe(valeurs) {
    const envoyer = `INSERT INTO MessageEquipe
    (idEquipe, contenu, idExpediteur) VALUES ($1, $2, $3)`;

    try {
        pool.query(envoyer, valeurs);
    } catch (error) {
        throw error;
    }

}
//Envoyer message en tant que gerant
function envoyerMessageGerant(valeurs) {
    const envoyer = `INSERT INTO MessageGestionnaireAdmin
    (idEquipe, contenu, idExpediteur) VALUES ($1, $2, $3)`;

    try {
        pool.query(envoyer, valeurs);
    } catch (error) {
        throw error;
    }
}


//Recuperer tous les messages de l'equipe
async function getMessageEquipe(idEquipe) {
    const envoyer = `SELECT * FROM MessageEquipe
    WHERE idEquipe = $1
    UNION SELECT * FROM MessageGestionnaireAdmin
    WHERE idEquipe = $1`;

    try {
        return new Promise((resolve) => {
            pool.query(envoyer, [idEquipe])
                .then((result) => {
                    resolve(result.rows);
                });
        });
    } catch (error) {
        throw error;
    }
}


async function jsonGetMessegaeEquipe(idEquipe, req) {

    const equipe = await getMessageEquipe(idEquipe);
    jsonRetour = {};
    jsonRetour.message = [];

    for(i = 0; i < equipe.length; i++){

        temp = {};
        let messageCourant = equipe[i];
        temp.idSender = messageCourant.idexpediteur;

        let user = (await userModel.chercherUserID(temp.idSender))[0];
        temp.pseudoSender = user.pseudo;
        temp.roleSender = user.typeuser;

        temp.dateMessage = messageCourant.date_envoie;

        if(req.id === temp.idSender){
            temp.userIsSender = true;
        }else{
            temp.userIsSender = false;
        }
        
        temp.content = messageCourant.contenu;
        temp.range = messageCourant.typeMessage;

        jsonRetour.message.push(temp);
    }
    return jsonRetour;
}



module.exports = {
    envoyerMessageEquipe,
    envoyerMessageGerant,
    jsonGetMessegaeEquipe
}