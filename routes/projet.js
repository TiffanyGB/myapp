var express = require('express');
var router = express.Router();

const indexController = require('../controllers/indexController');
const projetController = require('../controllers/projetController');
const projetModel = require('../models/projetModel');
const equipeController = require('../controllers/equipeController');
const adminProfile = require('../middleware/verifProfil');
const checkAdminProfile = adminProfile.checkProfile('admin');
const { verifIdNombre } = require('../verifications/verifierDonnéesGénérales');


/**Voir la liste des projets*/
router.all('/',
    indexController.verifyToken,
    checkAdminProfile,
    projetController.voirListeProjets);

router.all('/creerProjets', indexController.verifyToken, projetController.creationProjet);


/**voir informations d'un projet */
router.all('/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;
    verifIdNombre(req.params.id, res, next)

    next();
}, indexController.verifyToken, projetController.infosProjet);


/**Modifier projet */
router.all('/edit/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;
    verifIdNombre(req.params.id, res, next)

    next();
}, indexController.verifyToken, projetController.modifierProjet);

/**Supprimer un projet */
router.all('/delete/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;
    verifIdNombre(req.params.id, res, next)

    next();
}, indexController.verifyToken, projetController.supprimerProjet);

/**Voir équipes du projet */
router.all('/:id/teams', (req, res, next) => {
    res.locals.projetId = req.params.id;
    verifIdNombre(req.params.id, res, next)

    next();
}, indexController.verifyToken, equipeController.retournerEquipeProjet);



module.exports = router;
