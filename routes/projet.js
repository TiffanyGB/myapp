var express = require('express');
var router = express.Router();

const indexController = require('../controllers/indexController');
const projetController = require('../controllers/projetController');
const projetModel = require('../models/projetModel');

/**Voir la liste des projets*/
router.all('/', indexController.verifyToken, projetController.voirListeProjets);

/**créer un projet */
router.all('/creerProjet', indexController.verifyToken, projetModel.validateProjet, projetController.creerProjet);

/**Modifier projet */


/**Supprimer un projet */
router.all('/delete/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;
    next();
}, indexController.verifyToken, projetController.supprimerProjet);

// router.all('/edit/:id', (req, res, next) => {
//     res.locals.projetId = req.params.id;
//     next();
// }, indexController.verifyToken, projetController.modifierProjet);

module.exports = router;
