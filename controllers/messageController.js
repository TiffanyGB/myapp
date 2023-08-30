const messageModel = require('../models/messageModel');


/**
 * Controller pour créer une nouvelle annotation associée à une équipe.
 * 
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @returns {Object} - Retourne un objet JSON avec un message indiquant si le message a été envoyé
 * avec succès, avec un code 200 ou une erreur en cas d'échec, avec un code 400
 * @throws {Error} Une erreur si l'envoie du message echoue
 * @description  Controller pour envoyer un message dans la messagerie d'une équipe.
 * 
 * Récupère les informations utiles à l'insertion dans la base de données:
 * 
 * Le contenu du message: depuis la requete,
 * L'id de l'équipe: Directement depuis l'url de la route,
 * L'id de l'expéditeur du message est récupéré depuis son token.
 * 
 * L'appel du controller dans la route, se fait après l'appel de ces middlewares:
 * la vérification du token, la vérification de l'existence de l'équipe et (*)la vérification
 * du profil (dans cet ordre, les middlewares dépendants les uns des autres).
 * 
 * Accès à ce controller: Gestionnaires du projet et les administrateurs et les etudiants de l'équipe.
*/
async function envoyerMessage(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ sucess: 'Access granted' });
    } else if (req.method === 'POST') {
        const idUser = req.id;
        const idEquipe = res.locals.idEquipe;

        let contenu = req.body;
        contenu = contenu.contenu.trim();

        const valeurs = [
            idEquipe,
            contenu,
            idUser
        ];

        const validationResult = await messageModel.validateMessageContenu(req, res);

        if (!validationResult.isValid) {
            return res.status(400).json({ errors: validationResult.errors });
        }

        try {
            if (req.userProfile === 'etudiant') {
                messageModel.envoyerMessageEquipe(valeurs);
            } else if (req.userProfile === 'admin' || req.userProfile === 'gestionnaire') {
                messageModel.envoyerMessageGerant(valeurs);
            }

            return res.status(200).json({ message: 'Message envoyé à l\'équipe ' + idEquipe });
        } catch (error) {
            return res.status(400).json({ erreur: 'Erreur lors de l\'envoi du message' });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

/**
 * Controller pour créer une nouvelle annotation associée à une équipe.
 * 
 * @function
 * @param {Object} req - L'objet de la requête (express request object).
 * @param {Object} res - L'objet de la réponse (express response object).
 * @returns {Object} - Retourne un objet JSON avec un message indiquant si l'annotation a été créée
 * avec succès ou une erreur en cas d'échec.
 * @throws {Error} Une erreur si la création de l'annotation échoue.
 * @description  Controller pour créer une nouvelle annotation associée à une équipe.
 * 
 * Récupère les informations utiles à l'insertion dans la base de données:
 * 
 * Le contenu de l'annotation: est récupéré du body, message que laisse l'administrateur
 * ou le gestionnaire du projet,
 * L'id de l'équipe: Directement depuis l'url de la route,
 * L'id de l'auteur de l'annotation depuis son token.
 * 
 * L'appel du controller dans la route, se fait après l'appel de ces middlewares:
 * la vérification du token, la vérification de l'existence de l'équipe et (*)la vérification
 * du profil (dans cet ordre, les middlewares dépendants les uns des autres).
 * 
 * Accès à ce controller: Gestionnaires du projet et les administrateurs ((*)verifProfil/checkAG).
*/
async function recupererMessageEquipe(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).json({ sucess: 'Access granted' });
    } else if (req.method === 'GET') {
        const idEquipe = res.locals.idEquipe;

        try {
            const jsonRetour = await messageModel.jsonGetMessegaeEquipe(idEquipe, req);
            return res.status(200).json(jsonRetour);
        } catch (error) {
            return res.status(400).json({ erreur: "Erreur lors de la récupération des messages" });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

async function messageGlobalProjet(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ sucess: 'Access granted' });
    } else if (req.method === 'POST') {
        const idUser = req.id;
        const idProjet = res.locals.idProjet;

        let contenu = req.body;
        contenu = contenu.contenu.trim();

        const validationResult = await messageModel.validateMessageContenu(req, res);

        if (!validationResult.isValid) {
            return res.status(400).json({ errors: validationResult.errors });
        }

        try {
            messageModel.envoyerMessageGlobalProjet(contenu, idProjet, idUser);
            return res.status(200).json({ message: 'Message envoyé aux équipes' });
        } catch (error) {
            return res.status(400).json({ error: 'Erreur lors de l\'envoi du message' });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

async function messageGlobalEvent(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ sucess: 'Access granted' });
    } else if (req.method === 'POST') {
        const idUser = req.id;
        const idEvent = res.locals.idEvent;

        let contenu = req.body;
        contenu = contenu.contenu.trim();

        const validationResult = await messageModel.validateMessageContenu(req, res);

        if (!validationResult.isValid) {
            return res.status(400).json({ errors: validationResult.errors });
        }

        try {
            messageModel.envoyerMessageGlobalEvent(contenu, idEvent, idUser);
            return res.status(200).json({ message: 'Message envoyé aux équipes de l\'évènement.' });
        } catch (error) {
            return res.status(400).json({ error: 'Erreur lors de l\'envoi du message' });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

module.exports = {
    envoyerMessage,
    recupererMessageEquipe,
    messageGlobalProjet,
    messageGlobalEvent
}