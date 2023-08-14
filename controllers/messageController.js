const messageModel = require('../models/messageModel');
const { body, validationResult } = require('express-validator');

async function envoyerMessage(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ sucess: 'Access granted' });
    } else if (req.method === 'POST') {
        const idUser = req.id;
        const idEquipe = res.locals.idEquipe;

        const {
            contenu
        } = req.body;

        const valeurs = [
            idEquipe,
            contenu,
            idUser
        ];

        await body('contenu')
            .isLength({ min: 0, max: 1000 })
            .withMessage('Le message est trop long (maximum 1000 caractères)')
            .run(req);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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
    }
}

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
    }
}

async function messageGlobalProjet(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).json({ sucess: 'Access granted' });
    } else if (req.method === 'POST') {
        const idUser = req.id;
        const idProjet = res.locals.idProjet;

        const {
            contenu
        } = req.body;

        await body('contenu')
            .isLength({ min: 0, max: 1000 })
            .withMessage('Le message est trop long (maximum 1000 caractères)')
            .run(req);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {

            messageModel.envoyerMessageGlobalProjet(contenu, idProjet, idUser);
            return res.status(200).json({ message: 'Message envoyé aux équipes' });
        } catch (error) {
            return res.status(400).json({ erreur: 'Erreur lors de l\'envoi du message' });
        }
    }
}

async function messageGlobalEvent(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).json({ sucess: 'Access granted' });
    } else if (req.method === 'POST') {
        const idUser = req.id;
        const idEvent = res.locals.idEvent;

        const {
            contenu
        } = req.body;

        await body('contenu')
            .isLength({ min: 0, max: 1000 })
            .withMessage('Le message est trop long (maximum 1000 caractères)')
            .run(req);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            messageModel.envoyerMessageGlobalEvent(contenu, idEvent, idUser);
            return res.status(200).json({ message: 'Message envoyé aux équipes de l\'évènement.' });
        } catch (error) {
            return res.status(400).json({ erreur: 'Erreur lors de l\'envoi du message' });
        }
    }
}

module.exports = {
    envoyerMessage,
    recupererMessageEquipe,
    messageGlobalProjet,
    messageGlobalEvent
}