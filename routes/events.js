var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const eventsController = require('../controllers/eventsController');
const eventModel = require('../models/eventModel');
const profil = require('../middleware/verifProfil');
const { verifIdNombre } = require('../verifications/verifierDonnéesGénérales');


const checkAdminProfile = profil.checkProfile('admin');

/**Créer events */
router.all('/creerEvent',
    indexController.verifyToken,
    checkAdminProfile,
    eventModel.validateEvent,
    eventsController.createEvent);

/**Modifier un event */
router.all('/edit/:id', (req, res, next) => {
    res.locals.idevent = req.params.id;
    verifIdNombre(req.params.id, res, next)

    next();
}, indexController.verifyToken,
    checkAdminProfile,
    eventModel.validateEvent,
    eventsController.modifierEvent);

/**supprimer un event*/
router.all('/delete/:id', (req, res, next) => {
    res.locals.idevent = req.params.id;
    verifIdNombre(req.params.id, res, next)

    next();
}, indexController.verifyToken,
    checkAdminProfile,
    eventsController.supprimerEvent);

/**Voir les équipes d'un event */
router.all('/:id/teams', (req, res, next) => {
    res.locals.idevent = req.params.id;
    verifIdNombre(req.params.id, res, next)

    next();
}, indexController.verifyToken,
    checkAdminProfile,
    eventsController.listeEquipes);

/*Infos d'un event pour modif */
router.all('/:id/infos', (req, res, next) => {
    res.locals.idevent = req.params.id;
    verifIdNombre(req.params.id, res, next)

    next();
}, indexController.verifyToken,
    checkAdminProfile,
    eventsController.recupInfoEvent);


module.exports = router;