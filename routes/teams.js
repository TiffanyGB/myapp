var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const equipeController = require('../controllers/equipeController');
const equipeModel = require('../models/equipeModel');


/**Voir une équipe */


router.all('/creationEquipe',
    equipeController.creerEquipe);

router.all('/delete/:id', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken, equipeController.supprimerEquipe);

router.all('/:id', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken, equipeController.informationsEquipe);

module.exports = router;