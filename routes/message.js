const express = require('express');
const router = express.Router();
const { verifIdNombre } = require('../verifications/verifierDonnéesGénérales');
const indexController = require('../controllers/indexController');
const messageController = require('../controllers/messageController');
const verifProfil = require('../middleware/verifProfil');
const checkAdminProfile = verifProfil.checkProfile('admin');


router.all('/teams/:id', async (req, res, next) => {
    res.locals.idEquipe = req.params.id;

    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'event');
    }
    next();
}, indexController.verifyToken, verifProfil.checkAEG, messageController.recupererMessageEquipe);

router.all('/teams/:id/envoyerMessage', async (req, res, next) => {
    res.locals.idEquipe = req.params.id;

    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'event');
    }
    next();
}, indexController.verifyToken, verifProfil.checkAEG,messageController.envoyerMessage);


router.all('/envoyerMessageProjet/:id', async (req, res, next) => {
    res.locals.idProjet = req.params.id;

    try {
        if (verifIdNombre(res.locals.idProjet, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'event');
    }
    next();
}, indexController.verifyToken,verifProfil.checkAG,messageController.messageGlobalProjet);

router.all('/envoyerMessageEvenement/:id', async (req, res, next) => {
    res.locals.idEvent = req.params.id;

    try {
        if (verifIdNombre(res.locals.idEvent, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'event');
    }
    next();
}, indexController.verifyToken, checkAdminProfile, messageController.messageGlobalEvent);

module.exports = router;
