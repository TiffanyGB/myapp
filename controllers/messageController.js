const messageModel = require('../models/messageModel')

function envoyerMessage(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'POST') {

        const idUser = req.id;
        const idEquipe = res.locals.idEquipe;

        const {
            contenu
        } = req.body;

        const valeurs = [
            idEquipe,
            contenu,
            idUser
        ]

        if(req.userProfile === 'etudiant'){
            //Vérifier equipe
            try{
                messageModel.envoyerMessageEquipe(valeurs);
                res.status(200).json({message: 'Message envoyé à l\'équipe '+ idEquipe});
            }catch{
                res.status(400).json({erreur: 'Erreur lors de l\'envoi du message'});
            }
        }

        if(req.userProfile === 'admin' || req.userProfile === 'gestionnaire'){
            try{
                messageModel.envoyerMessageGerant(valeurs);
                res.status(200).json({message: 'Message envoyé à l\'équipe ' + idEquipe});
            }catch{
                res.status(400).json({erreur: 'Erreur lors de l\'envoi du message'});
            }
        }
    }
}

module.exports = {
    envoyerMessage
}