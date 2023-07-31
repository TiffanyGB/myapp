const messageModel = require('../models/messageModel');
const eventModel = require('../models/eventModel');

async function envoyerMessage(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).json({ sucess: 'Access granted' });
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

        /*Vérifier si l'id de l'event existe */
        const event = await eventModel.chercherEvenement(idEvent);

        if (event.length === 0) {
            return res.status(400).json({ erreur: 'L\'id de l\'événement n\'existe pas' });
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