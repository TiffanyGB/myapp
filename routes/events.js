var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const eventsController = require('../controllers/eventsController');
const profil = require('../middleware/verifProfil');

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

router.all('/:id/infos', (req, res, next) => {
    res.locals.idevent = req.params.id;
    next();
}, indexController.verifyToken,
    // profil.checkAdminProfile,
    eventsController.recupInfoEvent);


module.exports = router;