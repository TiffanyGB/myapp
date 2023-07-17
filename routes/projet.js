var express = require('express');
var router = express.Router();

const indexController = require('../controllers/indexController');
const projetController = require('../controllers/projetController');
const projetModel = require('../models/projetModel');
const equipeController = require('../controllers/equipeController');

/**Voir la liste des projets*/
router.all('/', indexController.verifyToken, projetController.voirListeProjets);

/**voir informations d'un projet */
router.all('/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;
    next();
}, indexController.verifyToken, projetController.infosProjet);

/**créer un projet */
router.all('/creerProjet', indexController.verifyToken, projetModel.validateProjet, projetController.creerProjet);

/**Modifier projet */
router.all('/edit/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;
    next();
}, indexController.verifyToken, projetController.modifierProjet);

/**Supprimer un projet */
router.all('/delete/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;
    next();
}, indexController.verifyToken, projetController.supprimerProjet);

/**Voir équipes du projet */
router.all('/:id/teams', (req, res, next) => {
    res.locals.projetId = req.params.id;
    next();
}, indexController.verifyToken, equipeController.retournerEquipeProjet);

module.exports = router;
