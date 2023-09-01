const pool = require("../database/configDB");
const userModel = require('./userModel');
const equipeModel = require('./equipeModel');
const projetModel = require('../models/projetModel');
const { body, validationResult } = require('express-validator');
const aDeplacer = require('../models/aDeplacer')

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

/**
 * Envoie un message à une équipe spécifiée.
 * @function
 * @param {Array} valeurs - Un tableau contenant les valeurs à insérer : [idEquipe, contenu, idExpediteur].
 * @throws {Error} Une erreur si l'envoi du message échoue.
 */function envoyerMessageEquipe(valeurs) {
    const envoyer = `INSERT INTO MessageEquipe
    (idEquipe, contenu, idExpediteur) VALUES ($1, $2, $3)`;

    try {
        pool.query(envoyer, valeurs);
    } catch (error) {
        throw error;
    }

}

/**
 * Envoie un message global à toutes les équipes d'un projet.
 * @async
 * @function
 * @param {string} contenu - Le contenu du message.
 * @param {number} idProjet - Identifiant du projet.
 * @param {number} idUser - Identifiant de l'utilisateur.
 * @throws {Error} Une erreur si l'envoi du message échoue.
 */
async function envoyerMessageGlobalProjet(contenu, idProjet, idUser) {

    const envoyer = `INSERT INTO MessageEquipe
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

/**
 * Envoie un message global à toutes les équipes de tous les projets d'un événement.
 * @async
 * @function
 * @param {string} contenu - Le contenu du message.
 * @param {number} idEvent - Identifiant de l'événement.
 * @param {number} idUser - Identifiant de l'utilisateur.
 * @throws {Error} Une erreur si l'envoi du message échoue.
 */
async function envoyerMessageGlobalEvent(contenu, idEvent, idUser) {

    const envoyer = `INSERT INTO MessageEquipe
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

/**
 * Récupère tous les messages d'une équipe spécifiée.
 * @async
 * @function
 * @param {number} idEquipe - Identifiant de l'équipe.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau de messages de l'équipe.
 * @throws {Error} Une erreur si la récupération des messages échoue.
 */
async function getMessageEquipe(idEquipe) {
    const envoyer = `SELECT * FROM MessageEquipe
    WHERE idEquipe = $1`;

    try {
        const chercher = await pool.query(envoyer, [idEquipe]);
        return chercher.rows;
    } catch (error) {
        throw error;
    }
}

/**
 * Crée un JSON personnalisé avec tous les messages d'une équipe spécifiée.
 * @async
 * @function
 * @param {number} idEquipe - Identifiant de l'équipe.
 * @param {express.Request} req - La requête Express.
 * @returns {Promise<Object>} - Une promesse résolue avec un objet JSON contenant les messages au format détaillé.
 * @throws {Error} Une erreur si la création du JSON échoue.
 */
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
        const type = await aDeplacer.chercherType(id);
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
    jsonGetMessegaeEquipe,
    envoyerMessageGlobalProjet,
    getMessageEquipe,
    envoyerMessageGlobalEvent,
    validateMessageContenu
}