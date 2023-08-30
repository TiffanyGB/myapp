const pool = require("../database/configDB");
const userModel = require('./userModel');
const equipeModel = require('./equipeModel');
const projetModel = require('../models/projetModel');
const { body, validationResult } = require('express-validator');

async function validateMessageContenu(req, res) {

    await body('contenu')
        .notEmpty()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Le message est trop long (maximum 1000 caractères)')
        .custom((value) => !(/^\s+$/.test(value))) // Vérifier que ce n'est pas que des espaces
        .withMessage('Le message ne peut pas être composé uniquement d\'espaces')
        .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return { isValid: false, errors: errors.array() };
    }

    return { isValid: true, errors: null };
}



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

async function envoyerMessageGlobalProjet(contenu, idProjet, idUser) {

    const envoyer = `INSERT INTO MessageGestionnaireAdmin
    (idEquipe, contenu, idExpediteur, typeMessage)
    VALUES ($1, $2, $3, $4)`;

    const equipesProjet = await equipeModel.listeEquipeProjet(idProjet);

    for (i = 0; i < equipesProjet.length; i++) {

        let equipesCourantes = equipesProjet[i];
        let donnees = [equipesCourantes.idequipe, contenu, idUser, 'projet'];

        try {
            pool.query(envoyer, donnees);
        } catch (error) {
            throw (error);
        }
    }
}

async function envoyerMessageGlobalEvent(contenu, idEvent, idUser) {

    const envoyer = `INSERT INTO MessageGestionnaireAdmin
    (idEquipe, contenu, idExpediteur, typeMessage)
    VALUES ($1, $2, $3, $4)`;

    const projets = await projetModel.recuperer_projets(idEvent);

    for (i = 0; i < projets.length; i++) {
        const equipesProjet = await equipeModel.listeEquipeProjet(projets[i].idprojet);

        for (j = 0; j < equipesProjet.length; j++) {

            let equipesCourantes = equipesProjet[j];
            let donnees = [equipesCourantes.idequipe, contenu, idUser, 'event'];

            try {
                pool.query(envoyer, donnees);
            } catch (error) {
                throw (error);
            }
        }
    }
}

//Recuperer tous les messages de l'equipe
async function getMessageEquipe(idEquipe) {
    const envoyer = `SELECT * FROM MessageEquipe
    WHERE idEquipe = $1
    UNION SELECT * FROM MessageGestionnaireAdmin
    WHERE idEquipe = $1`;

    try {
        const chercher = await pool.query(envoyer, [idEquipe]);
        return chercher.rows;
    } catch (error) {
        throw error;
    }
}

async function jsonGetMessegaeEquipe(idEquipe, req) {

    const equipe = await getMessageEquipe(idEquipe);
    jsonRetour = {};
    jsonRetour.message = [];

    for (i = 0; i < equipe.length; i++) {

        temp = {};
        let messageCourant = equipe[i];
        temp.idSender = messageCourant.idexpediteur;

        let user = (await userModel.chercherUserID(temp.idSender))[0];
        temp.pseudoSender = user.pseudo;
        let id = user.iduser;

        /*Chercher le role de l'utilisateur */
        const type = await userModel.chercherType(id);
        switch (type) {
            case 'etudiant':
                temp.roleSender = 'Étudiant';
                break;
            case 'administrateur':
                temp.roleSender = 'Administrateur';
                break;
            case 'gestionnaireIA':
                temp.roleSender = 'Gestionnaire IA PAU';
                break;
            case 'etudiant':
                temp.roleSender = 'Gestionnaire Externe';
                break;
            default:
                break;
        }

        temp.dateMessage = messageCourant.date_envoie;

        if (req.id === temp.idSender) {
            temp.userIsSender = true;
        } else {
            temp.userIsSender = false;
        }

        temp.content = messageCourant.contenu;
        temp.range = messageCourant.typemessage;

        jsonRetour.message.push(temp);
    }
    return jsonRetour;
}

module.exports = {
    envoyerMessageEquipe,
    envoyerMessageGerant,
    jsonGetMessegaeEquipe,
    envoyerMessageGlobalProjet,
    getMessageEquipe,
    envoyerMessageGlobalEvent,
    validateMessageContenu
}