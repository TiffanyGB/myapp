var express = require('express');
var router = express.Router();
const eventsController = require('../controllers/eventsController');
const eventModel = require('../models/eventModel');
const profil = require('../middleware/verifProfil');
const { verifIdNombre } = require('../verifications/verifierDonnéesGénérales');
const tokenModel = require('../models/tokenModel');


const checkAdminProfile = profil.checkProfile('admin');

/**Créer events */
router.all('/creerEvent',
    tokenModel.verifyToken,
    checkAdminProfile,
    eventModel.validateEvent,
    eventsController.createEvent);

/**Modifier un event */
router.all('/edit/:id', (req, res, next) => {
    res.locals.idevent = req.params.id;

    try {
        if (verifIdNombre(res.locals.idevent, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }

    next();
}, tokenModel.verifyToken,
    checkAdminProfile,
    eventModel.validateEvent,
    eventsController.modifierEvent);

/**supprimer un event*/
router.all('/delete/:id', (req, res, next) => {
    res.locals.idevent = req.params.id;

    try {
        if (verifIdNombre(res.locals.idevent, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }

    next();
}, tokenModel.verifyToken,
    checkAdminProfile,
    eventsController.supprimerEvent);

/**Voir les équipes d'un event */
router.all('/:id/teams', (req, res, next) => {
    res.locals.idevent = req.params.id;

    try {
        if (verifIdNombre(res.locals.idevent, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }

    next();
}, tokenModel.verifyToken,
    checkAdminProfile,
    eventsController.listeEquipes);

/*Infos d'un event pour modif */
router.all('/:id/infos', (req, res, next) => {
    res.locals.idevent = req.params.id;

    try {
        if (verifIdNombre(res.locals.idevent, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }
    
    next();
}, tokenModel.verifyToken,
    checkAdminProfile,
    eventsController.recupInfoEvent);


module.exports = router;