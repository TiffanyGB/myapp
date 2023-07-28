const messageModel = require('../models/messageModel')

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


module.exports = {
    envoyerMessage,
    recupererMessageEquipe
}