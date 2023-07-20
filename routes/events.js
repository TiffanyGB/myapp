var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const eventsController = require('../controllers/eventsController');
const eventModel = require('../models/eventModel');
const profil = require('../middleware/verifProfil');

const checkAdminProfile = profil.checkProfile('admin');

/**Créer events */
router.all('/creerEvent',
    indexController.verifyToken,
    checkAdminProfile,
    eventModel.validateEvent,
    eventsController.createEvent);

/**Modifier */
router.all('/edit/:id', (req, res, next) => {
    res.locals.idevent = req.params.id;
    next();
}, indexController.verifyToken,
    checkAdminProfile,
    eventModel.validateEvent,
    eventsController.modifierEvent);

/**supprimer */
router.all('/delete/:id', (req, res, next) => {
    res.locals.idevent = req.params.id;
    next();
}, indexController.verifyToken,
    checkAdminProfile,
    eventsController.supprimerEvent);

/**Voir les équipes d'un event */ //Rajouter profil ici
router.all('/:id/teams', (req, res, next) => {
    res.locals.idevent = req.params.id;
    next();
}, indexController.verifyToken,
    eventsController.listeEquipes);

router.all('/:id/infos', (req, res, next) => {
    res.locals.idevent = req.params.id;
    next();
}, indexController.verifyToken,
    checkAdminProfile,
    eventsController.recupInfoEvent);


module.exports = router;