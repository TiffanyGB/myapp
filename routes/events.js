var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const eventsController = require('../controllers/eventsController');
const equipeController = require('../controllers/equipeController');
const equipeModel = require('../models/equipeModel');

/**Créer events */
router.all('/creerEvent',
    indexController.verifyToken,
    eventsController.createEvent);

/**Modifier */
router.all('/edit/:id', (req, res, next) => {
    res.locals.idevent = req.params.id;
    next();
}, indexController.verifyToken,
    eventsController.modifierEvent);

/**supprimer */
router.all('/delete/:id', (req, res, next) => {
    res.locals.idevent = req.params.id;
    next();
}, indexController.verifyToken,
    eventsController.supprimerEvent);

/**Voir les équipes d'un event */
router.all('/:id/teams', (req, res, next) => {
    res.locals.idevent = req.params.id;
    next();
}, indexController.verifyToken,
    eventsController.listeEquipes);

/* Créer une équipe liée à l'event */
router.all('/:id/teams/create', (req, res, next) => {
    res.locals.idevent = req.params.id;
    next();
}, indexController.verifyToken,
    equipeController.creerEquipe,
    equipeModel.validerEquipe);

module.exports = router;